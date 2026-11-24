import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  addSubmission,
  claimAdminPassword,
  deleteSubmission,
  getAdminState,
  getPublicPortfolio,
  isAuthConfigured,
  UPLOAD_DIR,
  updatePortfolio,
  updateSubmissionStatus,
  verifyAdminPassword,
} from './src/server/store.ts';
import {
  BlueprintFeature,
  BlueprintFeatureIcon,
  BlueprintScenario,
  CredentialItem,
  FaqItem,
  ProjectItem,
  ServiceItem,
  SkillCategory,
} from './src/types/portfolio.ts';

dotenv.config();

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const revokedTokenIds = new Set<string>();
const contactRateLimiter = new Map<string, number[]>();

interface SessionPayload {
  sub: string;
  email: string;
  role: 'admin';
  jti: string;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  admin?: SessionPayload;
}

function signSessionToken(email: string): string {
  const payload: SessionPayload = {
    sub: 'admin-owner',
    email,
    role: 'admin',
    jti: crypto.randomUUID(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${sig}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  if (!encodedPayload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encodedPayload).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf-8');
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as SessionPayload;
    if (!parsed || parsed.role !== 'admin' || !parsed.jti || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp || revokedTokenIds.has(parsed.jti)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    return;
  }
  req.admin = payload;
  next();
}

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function sanitizeSafeUrl(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/api/uploads/') || trimmed.startsWith('/src/assets/')) {
    return trimmed.slice(0, 500);
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed.slice(0, 500);
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function sanitizeHttpUrl(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed.slice(0, 500);
    }
  } catch {
    return fallback;
  }
  return fallback;
}

const ALLOWED_FEATURE_ICONS: BlueprintFeatureIcon[] = [
  'auth',
  'schema',
  'retry',
  'sync',
  'latency',
  'audit',
];

function sanitizeBlueprint(body: any, existing?: BlueprintScenario): BlueprintScenario {
  const rawJson = body?.outputJson;
  const cleanJson: Record<string, string> = {};
  if (rawJson && typeof rawJson === 'object' && !Array.isArray(rawJson)) {
    for (const [k, v] of Object.entries(rawJson).slice(0, 12)) {
      const key = sanitizeString(k, 40);
      if (key) {
        cleanJson[key] = sanitizeString(typeof v === 'string' ? v : String(v ?? ''), 120);
      }
    }
  } else if (existing) {
    Object.assign(cleanJson, existing.outputJson);
  }

  const rawFeatures = Array.isArray(body?.features) ? body.features : existing?.features || [];
  const cleanFeatures: BlueprintFeature[] = rawFeatures.slice(0, 6).map((feat: any, idx: number) => {
    const iconCandidate = feat?.icon as BlueprintFeatureIcon;
    const fallbackIcon = ALLOWED_FEATURE_ICONS[idx % ALLOWED_FEATURE_ICONS.length];
    return {
      label: sanitizeString(feat?.label, 40) || `Safeguard ${idx + 1}`,
      value: sanitizeString(feat?.value, 140),
      statusTag: sanitizeString(feat?.statusTag, 24) || 'Verified',
      icon: ALLOWED_FEATURE_ICONS.includes(iconCandidate) ? iconCandidate : fallbackIcon,
    };
  });

  return {
    id: existing?.id || `bp-${crypto.randomUUID().slice(0, 8)}`,
    label: sanitizeString(body?.label, 80) || existing?.label || 'Automation Blueprint',
    stackSummary: sanitizeString(body?.stackSummary, 120) || existing?.stackSummary || '',
    triggerSource: sanitizeString(body?.triggerSource, 100) || existing?.triggerSource || '',
    triggerMethod: sanitizeString(body?.triggerMethod, 100) || existing?.triggerMethod || '',
    inboundText: sanitizeString(body?.inboundText, 280),
    triggerMeta: sanitizeString(body?.triggerMeta, 140),
    classification: sanitizeString(body?.classification, 120) || existing?.classification || '',
    aiModel: sanitizeString(body?.aiModel, 100) || existing?.aiModel || '',
    aiActionMeta: sanitizeString(body?.aiActionMeta, 140),
    crmTarget: sanitizeString(body?.crmTarget, 100) || existing?.crmTarget || '',
    crmAction: sanitizeString(body?.crmAction, 240),
    crmMeta: sanitizeString(body?.crmMeta, 140),
    latencyLabel: sanitizeString(body?.latencyLabel, 40) || existing?.latencyLabel || '1.2s end-to-end',
    outputJson: cleanJson,
    features: cleanFeatures,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 160;
}

async function startServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '8mb' }));

  // Public portfolio read endpoint
  app.get('/api/portfolio', (_req, res) => {
    res.json(getPublicPortfolio());
  });

  // Public contact form submission with rate limit & strict validation
  app.post('/api/contact', (req, res) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const recent = (contactRateLimiter.get(ip) || []).filter((ts) => now - ts < 60_000);
    if (recent.length >= 6) {
      res.status(429).json({ error: 'Too many submissions. Please wait a minute before trying again.' });
      return;
    }
    recent.push(now);
    contactRateLimiter.set(ip, recent);

    const fullName = sanitizeString(req.body?.fullName, 120);
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const company = sanitizeString(req.body?.company, 140);
    const serviceOfInterest = sanitizeString(req.body?.serviceOfInterest, 140);
    const projectDescription = sanitizeString(req.body?.projectDescription, 2500);

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Please provide your full name.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!serviceOfInterest) {
      res.status(400).json({ error: 'Please select a service of interest.' });
      return;
    }
    if (projectDescription.length < 15) {
      res.status(400).json({ error: 'Please describe your project requirements (at least 15 characters).' });
      return;
    }

    const saved = addSubmission({
      fullName,
      email,
      company,
      serviceOfInterest,
      projectDescription,
    });

    res.status(201).json({
      ok: true,
      id: saved.id,
      createdAt: saved.createdAt,
    });
  });

  // Safely serve uploaded images from confined upload directory
  app.get('/api/uploads/:filename', (req, res) => {
    const safeName = path.basename(String(req.params.filename || ''));
    if (!/^[a-zA-Z0-9._-]+$/.test(safeName)) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }
    const resolved = path.resolve(UPLOAD_DIR, safeName);
    if (!resolved.startsWith(UPLOAD_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(resolved);
  });

  // Auth status endpoint
  app.get('/api/auth/status', (req, res) => {
    const status = isAuthConfigured();
    const token = extractBearerToken(req);
    const session = token ? verifySessionToken(token) : null;
    res.json({
      configured: status.configured,
      usingEnvPasscode: status.usingEnvPasscode,
      authenticated: Boolean(session),
      role: session ? session.role : null,
      email: session ? session.email : null,
    });
  });

  // One-time first-run admin setup when ADMIN_PASSCODE is unset
  app.post('/api/auth/setup', (req, res) => {
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const portfolio = getPublicPortfolio();
    const expectedAdminEmail = portfolio.profile.email.toLowerCase();

    if (email !== expectedAdminEmail) {
      res.status(400).json({ error: `Admin setup must use the portfolio owner email (${expectedAdminEmail}).` });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Admin password must be between 8 and 128 characters.' });
      return;
    }

    const claimed = claimAdminPassword(password);
    if (!claimed) {
      res.status(409).json({ error: 'Admin access is already configured. Please sign in.' });
      return;
    }

    const token = signSessionToken(email);
    res.status(201).json({
      token,
      user: { email, role: 'admin', name: portfolio.profile.fullName },
    });
  });

  // Admin login endpoint
  app.post('/api/auth/login', (req, res) => {
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const portfolio = getPublicPortfolio();
    const expectedAdminEmail = portfolio.profile.email.toLowerCase();

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const status = isAuthConfigured();
    if (!status.configured) {
      res.status(400).json({ error: 'Admin passcode is not configured yet. Complete setup first.' });
      return;
    }

    if (email !== expectedAdminEmail || !verifyAdminPassword(password)) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = signSessionToken(email);
    res.json({
      token,
      user: { email, role: 'admin', name: portfolio.profile.fullName },
    });
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    const token = extractBearerToken(req);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload?.jti) {
        revokedTokenIds.add(payload.jti);
      }
    }
    res.json({ ok: true });
  });

  // Protected Admin Routes
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    res.json(getAdminState());
  });

  app.put('/api/admin/profile', requireAdmin, (req, res) => {
    const body = req.body || {};
    const updated = updatePortfolio((curr) => ({
      ...curr,
      profile: {
        ...curr.profile,
        brandName: sanitizeString(body.brandName, 60) || curr.profile.brandName,
        fullName: sanitizeString(body.fullName, 100) || curr.profile.fullName,
        title: sanitizeString(body.title, 100) || curr.profile.title,
        roleLabels: Array.isArray(body.roleLabels)
          ? body.roleLabels.map((r: unknown) => sanitizeString(r, 60)).filter(Boolean).slice(0, 6)
          : curr.profile.roleLabels,
        location: sanitizeString(body.location, 100) || curr.profile.location,
        availabilityText: sanitizeString(body.availabilityText, 120) || curr.profile.availabilityText,
        isAvailable: typeof body.isAvailable === 'boolean' ? body.isAvailable : curr.profile.isAvailable,
        portraitUrl:
          body.portraitUrl !== undefined
            ? sanitizeSafeUrl(body.portraitUrl, curr.profile.portraitUrl)
            : curr.profile.portraitUrl,
        email: isValidEmail(sanitizeString(body.email, 160))
          ? sanitizeString(body.email, 160).toLowerCase()
          : curr.profile.email,
        whatsappUrl: sanitizeSafeUrl(body.whatsappUrl, curr.profile.whatsappUrl),
        whatsappDisplay: sanitizeString(body.whatsappDisplay, 60) || curr.profile.whatsappDisplay,
        linkedinUrl: sanitizeSafeUrl(body.linkedinUrl, curr.profile.linkedinUrl),
        linkedinHandle: sanitizeString(body.linkedinHandle, 120) || curr.profile.linkedinHandle,
        bookingUrl:
          body.bookingUrl !== undefined
            ? sanitizeHttpUrl(body.bookingUrl, curr.profile.bookingUrl)
            : curr.profile.bookingUrl,
        bookingButtonLabel:
          sanitizeString(body.bookingButtonLabel, 60) || curr.profile.bookingButtonLabel,
      },
    }));
    res.json(updated.profile);
  });

  app.put('/api/admin/content', requireAdmin, (req, res) => {
    const body = req.body || {};
    const updated = updatePortfolio((curr) => ({
      ...curr,
      siteContent: {
        ...curr.siteContent,
        heroHeadline: sanitizeString(body.heroHeadline, 200) || curr.siteContent.heroHeadline,
        heroSupportingText: sanitizeString(body.heroSupportingText, 400) || curr.siteContent.heroSupportingText,
        aboutHeadline: sanitizeString(body.aboutHeadline, 220) || curr.siteContent.aboutHeadline,
        aboutBioParagraphs: Array.isArray(body.aboutBioParagraphs)
          ? body.aboutBioParagraphs.map((p: unknown) => sanitizeString(p, 1000)).filter(Boolean).slice(0, 8)
          : curr.siteContent.aboutBioParagraphs,
        aboutPillarsTitle: sanitizeString(body.aboutPillarsTitle, 120) || curr.siteContent.aboutPillarsTitle,
        aboutPillarsSubtitle: sanitizeString(body.aboutPillarsSubtitle, 240) || curr.siteContent.aboutPillarsSubtitle,
        aboutPillars: Array.isArray(body.aboutPillars)
          ? body.aboutPillars.map((p: unknown) => sanitizeString(p, 160)).filter(Boolean).slice(0, 12)
          : curr.siteContent.aboutPillars,
        timelineHeadline: sanitizeString(body.timelineHeadline, 180) || curr.siteContent.timelineHeadline,
        servicesHeadline: sanitizeString(body.servicesHeadline, 180) || curr.siteContent.servicesHeadline,
        servicesSubtext: sanitizeString(body.servicesSubtext, 350) || curr.siteContent.servicesSubtext,
        projectsHeadline: sanitizeString(body.projectsHeadline, 180) || curr.siteContent.projectsHeadline,
        projectsSubtext: sanitizeString(body.projectsSubtext, 350) || curr.siteContent.projectsSubtext,
        skillsHeadline: sanitizeString(body.skillsHeadline, 180) || curr.siteContent.skillsHeadline,
        skillsSubtext: sanitizeString(body.skillsSubtext, 350) || curr.siteContent.skillsSubtext,
        credentialsHeadline: sanitizeString(body.credentialsHeadline, 180) || curr.siteContent.credentialsHeadline,
        credentialsSubtext: sanitizeString(body.credentialsSubtext, 350) || curr.siteContent.credentialsSubtext,
        faqHeadline: sanitizeString(body.faqHeadline, 180) || curr.siteContent.faqHeadline,
        faqSubtext: sanitizeString(body.faqSubtext, 350) || curr.siteContent.faqSubtext,
        contactHeadline: sanitizeString(body.contactHeadline, 140) || curr.siteContent.contactHeadline,
        contactSubtext: sanitizeString(body.contactSubtext, 400) || curr.siteContent.contactSubtext,
        contactFormTitle: sanitizeString(body.contactFormTitle, 140) || curr.siteContent.contactFormTitle,
        contactFormSubtext: sanitizeString(body.contactFormSubtext, 350) || curr.siteContent.contactFormSubtext,
        footerTagline: sanitizeString(body.footerTagline, 160) || curr.siteContent.footerTagline,
      },
      timeline: Array.isArray(body.timeline)
        ? body.timeline.slice(0, 8).map((item: any, idx: number) => ({
            id: sanitizeString(item?.id, 40) || `tl-${idx + 1}`,
            stepNumber: sanitizeString(item?.stepNumber, 10) || String(idx + 1).padStart(2, '0'),
            title: sanitizeString(item?.title, 100) || 'Milestone',
            subtitle: sanitizeString(item?.subtitle, 120),
            description: sanitizeString(item?.description, 500),
          }))
        : curr.timeline,
    }));
    res.json({ siteContent: updated.siteContent, timeline: updated.timeline });
  });

  app.post('/api/admin/projects', requireAdmin, (req, res) => {
    const body = req.body || {};
    const title = sanitizeString(body.title, 140);
    if (!title) {
      res.status(400).json({ error: 'Project title is required.' });
      return;
    }
    const newProject: ProjectItem = {
      id: `proj-${crypto.randomUUID().slice(0, 8)}`,
      title,
      category: sanitizeString(body.category, 80) || 'Workflow Automation',
      status: ['Production Ready', 'Completed', 'Active System', 'Prototype'].includes(body.status)
        ? body.status
        : 'Completed',
      overview: sanitizeString(body.overview, 500),
      businessProblem: sanitizeString(body.businessProblem, 700),
      solutionImplemented: sanitizeString(body.solutionImplemented, 700),
      tools: Array.isArray(body.tools)
        ? body.tools.map((t: unknown) => sanitizeString(t, 50)).filter(Boolean).slice(0, 15)
        : [],
      workflowSteps: Array.isArray(body.workflowSteps)
        ? body.workflowSteps.map((s: unknown) => sanitizeString(s, 220)).filter(Boolean).slice(0, 8)
        : [],
      workflowExplanation: sanitizeString(body.workflowExplanation, 900),
      businessValue: sanitizeString(body.businessValue, 600),
      coverImageUrl: sanitizeSafeUrl(body.coverImageUrl, ''),
      galleryImages: Array.isArray(body.galleryImages)
        ? body.galleryImages
            .map((img: unknown) => sanitizeSafeUrl(img, ''))
            .filter(Boolean)
            .slice(0, 8)
        : [],
      videoUrl: sanitizeHttpUrl(body.videoUrl, ''),
      featured: Boolean(body.featured),
    };
    const updated = updatePortfolio((curr) => ({
      ...curr,
      projects: [newProject, ...curr.projects],
    }));
    res.status(201).json(updated.projects);
  });

  app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const body = req.body || {};
    let found = false;
    const updated = updatePortfolio((curr) => ({
      ...curr,
      projects: curr.projects.map((p) => {
        if (p.id !== id) return p;
        found = true;
        return {
          ...p,
          title: sanitizeString(body.title, 140) || p.title,
          category: sanitizeString(body.category, 80) || p.category,
          status: ['Production Ready', 'Completed', 'Active System', 'Prototype'].includes(body.status)
            ? body.status
            : p.status,
          overview: sanitizeString(body.overview, 500),
          businessProblem: sanitizeString(body.businessProblem, 700),
          solutionImplemented: sanitizeString(body.solutionImplemented, 700),
          tools: Array.isArray(body.tools)
            ? body.tools.map((t: unknown) => sanitizeString(t, 50)).filter(Boolean).slice(0, 15)
            : p.tools,
          workflowSteps: Array.isArray(body.workflowSteps)
            ? body.workflowSteps.map((s: unknown) => sanitizeString(s, 220)).filter(Boolean).slice(0, 8)
            : p.workflowSteps,
          workflowExplanation: sanitizeString(body.workflowExplanation, 900),
          businessValue: sanitizeString(body.businessValue, 600),
          coverImageUrl:
            body.coverImageUrl !== undefined
              ? sanitizeSafeUrl(body.coverImageUrl, '')
              : p.coverImageUrl,
          galleryImages: Array.isArray(body.galleryImages)
            ? body.galleryImages
                .map((img: unknown) => sanitizeSafeUrl(img, ''))
                .filter(Boolean)
                .slice(0, 8)
            : p.galleryImages,
          videoUrl:
            body.videoUrl !== undefined
              ? sanitizeHttpUrl(body.videoUrl, '')
              : p.videoUrl,
          featured: typeof body.featured === 'boolean' ? body.featured : p.featured,
        };
      }),
    }));
    if (!found) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json(updated.projects);
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const updated = updatePortfolio((curr) => ({
      ...curr,
      projects: curr.projects.filter((p) => p.id !== id),
    }));
    res.json(updated.projects);
  });

  app.post('/api/admin/services', requireAdmin, (req, res) => {
    const body = req.body || {};
    const title = sanitizeString(body.title, 120);
    if (!title) {
      res.status(400).json({ error: 'Service title is required.' });
      return;
    }
    const newService: ServiceItem = {
      id: `srv-${crypto.randomUUID().slice(0, 8)}`,
      title,
      icon: sanitizeString(body.icon, 40) || 'Workflow',
      shortDescription: sanitizeString(body.shortDescription, 350),
      capabilities: Array.isArray(body.capabilities)
        ? body.capabilities.map((c: unknown) => sanitizeString(c, 160)).filter(Boolean).slice(0, 8)
        : [],
      howItWorks: {
        trigger: sanitizeString(body.howItWorks?.trigger, 200),
        processing: sanitizeString(body.howItWorks?.processing, 240),
        output: sanitizeString(body.howItWorks?.output, 200),
        summary: sanitizeString(body.howItWorks?.summary, 240),
      },
    };
    const updated = updatePortfolio((curr) => ({
      ...curr,
      services: [...curr.services, newService],
    }));
    res.status(201).json(updated.services);
  });

  app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const body = req.body || {};
    const updated = updatePortfolio((curr) => ({
      ...curr,
      services: curr.services.map((s) =>
        s.id === id
          ? {
              ...s,
              title: sanitizeString(body.title, 120) || s.title,
              icon: sanitizeString(body.icon, 40) || s.icon,
              shortDescription: sanitizeString(body.shortDescription, 350),
              capabilities: Array.isArray(body.capabilities)
                ? body.capabilities.map((c: unknown) => sanitizeString(c, 160)).filter(Boolean).slice(0, 8)
                : s.capabilities,
              howItWorks: {
                trigger: sanitizeString(body.howItWorks?.trigger, 200) || s.howItWorks.trigger,
                processing: sanitizeString(body.howItWorks?.processing, 240) || s.howItWorks.processing,
                output: sanitizeString(body.howItWorks?.output, 200) || s.howItWorks.output,
                summary: sanitizeString(body.howItWorks?.summary, 240) || s.howItWorks.summary,
              },
            }
          : s
      ),
    }));
    res.json(updated.services);
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const updated = updatePortfolio((curr) => ({
      ...curr,
      services: curr.services.filter((s) => s.id !== id),
    }));
    res.json(updated.services);
  });

  app.put('/api/admin/skills', requireAdmin, (req, res) => {
    const categories = Array.isArray(req.body?.skillCategories) ? req.body.skillCategories : null;
    if (!categories) {
      res.status(400).json({ error: 'Invalid skillCategories payload.' });
      return;
    }
    const sanitized: SkillCategory[] = categories.slice(0, 16).map((cat: any, idx: number) => ({
      id: sanitizeString(cat?.id, 40) || `cat-${idx + 1}`,
      name: sanitizeString(cat?.name, 80) || 'Category',
      items: Array.isArray(cat?.items)
        ? cat.items.slice(0, 25).map((item: any, itemIdx: number) => ({
            id: sanitizeString(item?.id, 40) || `sk-${idx}-${itemIdx}`,
            name: sanitizeString(item?.name, 80) || 'Skill',
            proficiency: item?.proficiency === 'Learning' ? 'Learning' : 'Practical Experience',
          }))
        : [],
    }));
    const updated = updatePortfolio((curr) => ({
      ...curr,
      skillCategories: sanitized,
    }));
    res.json(updated.skillCategories);
  });

  app.post('/api/admin/credentials', requireAdmin, (req, res) => {
    const body = req.body || {};
    const organization = sanitizeString(body.organization, 100);
    const roleTitle = sanitizeString(body.roleTitle, 120);
    if (!organization || !roleTitle) {
      res.status(400).json({ error: 'Organization and role title are required.' });
      return;
    }
    const newCredential: CredentialItem = {
      id: `cred-${crypto.randomUUID().slice(0, 8)}`,
      organization,
      roleTitle,
      period: sanitizeString(body.period, 80) || 'Completed',
      summary: sanitizeString(body.summary, 600),
      highlights: Array.isArray(body.highlights)
        ? body.highlights.map((h: unknown) => sanitizeString(h, 140)).filter(Boolean).slice(0, 12)
        : [],
      certificateTitle: sanitizeString(body.certificateTitle, 140) || `${organization} Certificate`,
      certificateId: sanitizeString(body.certificateId, 80) || `CERT-${Date.now()}`,
      issuedDate: sanitizeString(body.issuedDate, 80) || '2025',
      certificateImageUrl: sanitizeSafeUrl(body.certificateImageUrl, ''),
      linkedProjectIds: Array.isArray(body.linkedProjectIds)
        ? body.linkedProjectIds.map((pid: unknown) => sanitizeString(pid, 60)).filter(Boolean).slice(0, 12)
        : [],
    };
    const updated = updatePortfolio((curr) => ({
      ...curr,
      credentials: [...curr.credentials, newCredential],
    }));
    res.status(201).json(updated.credentials);
  });

  app.put('/api/admin/credentials/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const body = req.body || {};
    const updated = updatePortfolio((curr) => ({
      ...curr,
      credentials: curr.credentials.map((c): CredentialItem =>
        c.id === id
          ? {
              ...c,
              organization: sanitizeString(body.organization, 100) || c.organization,
              roleTitle: sanitizeString(body.roleTitle, 120) || c.roleTitle,
              period: sanitizeString(body.period, 80) || c.period,
              summary: sanitizeString(body.summary, 600),
              highlights: Array.isArray(body.highlights)
                ? body.highlights.map((h: unknown) => sanitizeString(h, 140)).filter(Boolean).slice(0, 12)
                : c.highlights,
              certificateTitle: sanitizeString(body.certificateTitle, 140) || c.certificateTitle,
              certificateId: sanitizeString(body.certificateId, 80) || c.certificateId,
              issuedDate: sanitizeString(body.issuedDate, 80) || c.issuedDate,
              certificateImageUrl:
                body.certificateImageUrl !== undefined
                  ? sanitizeSafeUrl(body.certificateImageUrl, c.certificateImageUrl)
                  : c.certificateImageUrl,
              linkedProjectIds: Array.isArray(body.linkedProjectIds)
                ? body.linkedProjectIds.map((pid: unknown) => sanitizeString(pid, 60)).filter(Boolean).slice(0, 12)
                : c.linkedProjectIds,
            }
          : c
      ),
    }));
    res.json(updated.credentials);
  });

  app.delete('/api/admin/credentials/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const updated = updatePortfolio((curr) => ({
      ...curr,
      credentials: curr.credentials.filter((c) => c.id !== id),
    }));
    res.json(updated.credentials);
  });

  app.post('/api/admin/blueprints', requireAdmin, (req, res) => {
    const body = req.body || {};
    const label = sanitizeString(body.label, 80);
    if (!label) {
      res.status(400).json({ error: 'Blueprint title is required.' });
      return;
    }
    const created = sanitizeBlueprint(body);
    const updated = updatePortfolio((curr) => ({
      ...curr,
      blueprints: [...curr.blueprints, created].slice(0, 12),
    }));
    res.status(201).json(updated.blueprints);
  });

  app.put('/api/admin/blueprints/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const body = req.body || {};
    let found = false;
    const updated = updatePortfolio((curr) => ({
      ...curr,
      blueprints: curr.blueprints.map((bp) => {
        if (bp.id !== id) return bp;
        found = true;
        return sanitizeBlueprint(body, bp);
      }),
    }));
    if (!found) {
      res.status(404).json({ error: 'Blueprint not found.' });
      return;
    }
    res.json(updated.blueprints);
  });

  app.delete('/api/admin/blueprints/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const updated = updatePortfolio((curr) => ({
      ...curr,
      blueprints: curr.blueprints.filter((bp) => bp.id !== id),
    }));
    res.json(updated.blueprints);
  });

  app.put('/api/admin/faqs', requireAdmin, (req, res) => {
    const rawFaqs = Array.isArray(req.body?.faqs) ? req.body.faqs : null;
    if (!rawFaqs) {
      res.status(400).json({ error: 'Invalid faqs payload.' });
      return;
    }
    const sanitizedFaqs: FaqItem[] = rawFaqs
      .slice(0, 20)
      .map((item: any, idx: number) => ({
        id: sanitizeString(item?.id, 40) || `faq-${idx + 1}`,
        question: sanitizeString(item?.question, 240),
        answer: sanitizeString(item?.answer, 1200),
      }))
      .filter((item: FaqItem) => item.question && item.answer);

    const updated = updatePortfolio((curr) => ({
      ...curr,
      faqs: sanitizedFaqs,
    }));
    res.json(updated.faqs);
  });

  app.patch('/api/admin/submissions/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const status = req.body?.status;
    if (!['new', 'reviewed', 'archived'].includes(status)) {
      res.status(400).json({ error: 'Invalid submission status.' });
      return;
    }
    const result = updateSubmissionStatus(id, status);
    if (!result) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    res.json(result);
  });

  app.delete('/api/admin/submissions/:id', requireAdmin, (req, res) => {
    const id = sanitizeString(req.params.id, 60);
    const deleted = deleteSubmission(id);
    if (!deleted) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // Secure image/certificate upload endpoint (PNG, JPG, WEBP up to 5MB)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType.toLowerCase() : '';
    const dataBase64 = typeof req.body?.dataBase64 === 'string' ? req.body.dataBase64 : '';

    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
    };
    const ext = extMap[mimeType];
    if (!ext) {
      res.status(400).json({ error: 'Only PNG, JPEG, and WEBP images are supported.' });
      return;
    }

    const cleaned = dataBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleaned, 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'File must be non-empty and under 5 MB.' });
      return;
    }

    const safeFilename = `asset-${crypto.randomUUID()}${ext}`;
    const destPath = path.resolve(UPLOAD_DIR, safeFilename);
    if (!destPath.startsWith(UPLOAD_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid destination path.' });
      return;
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    fs.writeFileSync(destPath, buffer);
    res.status(201).json({ url: `/api/uploads/${safeFilename}` });
  });

  // Serve Vite in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SWIZZCONCEPTS server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
