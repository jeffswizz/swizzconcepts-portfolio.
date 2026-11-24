import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DEFAULT_PORTFOLIO_DATA } from '../data/defaultPortfolio.ts';
import type { AdminState, ContactSubmission, PortfolioData } from '../types/portfolio.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'portfolio-db.json');
export const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

interface PersistedDatabase {
  portfolio: PortfolioData;
  submissions: ContactSubmission[];
  adminCredentialHash: string | null;
}

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function cloneDefaultPortfolio(): PortfolioData {
  return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA)) as PortfolioData;
}

function readDatabase(): PersistedDatabase {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const initial: PersistedDatabase = {
      portfolio: cloneDefaultPortfolio(),
      submissions: [],
      adminCredentialHash: null,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PersistedDatabase>;
    const defaults = cloneDefaultPortfolio();
    const rawPortfolio = parsed.portfolio;
    const portfolio: PortfolioData = rawPortfolio
      ? {
          ...defaults,
          ...rawPortfolio,
          profile: { ...defaults.profile, ...(rawPortfolio.profile || {}) },
          siteContent: { ...defaults.siteContent, ...(rawPortfolio.siteContent || {}) },
          blueprints: Array.isArray(rawPortfolio.blueprints) ? rawPortfolio.blueprints : defaults.blueprints,
          faqs: Array.isArray(rawPortfolio.faqs) ? rawPortfolio.faqs : defaults.faqs,
        }
      : defaults;
    return {
      portfolio,
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      adminCredentialHash: typeof parsed.adminCredentialHash === 'string' ? parsed.adminCredentialHash : null,
    };
  } catch {
    const fallback: PersistedDatabase = {
      portfolio: cloneDefaultPortfolio(),
      submissions: [],
      adminCredentialHash: null,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeDatabase(db: PersistedDatabase): void {
  ensureDirectories();
  const tempFile = path.resolve(DATA_DIR, `portfolio-db.${crypto.randomUUID()}.tmp`);
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Optional Supabase REST sync when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured
async function syncToSupabase(table: string, payload: Record<string, unknown>): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) return;

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(table)}`;
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn(`[Supabase sync warning for ${table}]:`, err instanceof Error ? err.message : 'Unknown error');
  }
}

export function getPublicPortfolio(): PortfolioData {
  return readDatabase().portfolio;
}

export function getAdminState(): AdminState {
  const db = readDatabase();
  return {
    ...db.portfolio,
    submissions: db.submissions,
  };
}

export function updatePortfolio(updater: (current: PortfolioData) => PortfolioData): PortfolioData {
  const db = readDatabase();
  db.portfolio = updater(db.portfolio);
  writeDatabase(db);
  void syncToSupabase('portfolio_state', {
    id: 'primary',
    data: db.portfolio,
    updated_at: new Date().toISOString(),
  });
  return db.portfolio;
}

export function addSubmission(input: Omit<ContactSubmission, 'id' | 'status' | 'createdAt'>): ContactSubmission {
  const db = readDatabase();
  const entry: ContactSubmission = {
    id: `sub-${crypto.randomUUID().slice(0, 8)}`,
    fullName: input.fullName,
    email: input.email,
    company: input.company,
    serviceOfInterest: input.serviceOfInterest,
    projectDescription: input.projectDescription,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  db.submissions.unshift(entry);
  writeDatabase(db);
  void syncToSupabase('contact_submissions', {
    id: entry.id,
    full_name: entry.fullName,
    email: entry.email,
    company: entry.company,
    service_of_interest: entry.serviceOfInterest,
    project_description: entry.projectDescription,
    status: entry.status,
    created_at: entry.createdAt,
  });
  return entry;
}

export function updateSubmissionStatus(id: string, status: ContactSubmission['status']): ContactSubmission | null {
  const db = readDatabase();
  const target = db.submissions.find((s) => s.id === id);
  if (!target) return null;
  target.status = status;
  writeDatabase(db);
  return target;
}

export function deleteSubmission(id: string): boolean {
  const db = readDatabase();
  const next = db.submissions.filter((s) => s.id !== id);
  if (next.length === db.submissions.length) return false;
  db.submissions = next;
  writeDatabase(db);
  return true;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const expectedBuffer = Buffer.from(keyHex, 'hex');
  const actualBuffer = crypto.scryptSync(password, salt, 64);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function verifyEnvPasscode(candidate: string, configuredPasscode: string): boolean {
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(configuredPasscode).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isAuthConfigured(): { configured: boolean; usingEnvPasscode: boolean } {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (envPass) {
    return { configured: true, usingEnvPasscode: true };
  }
  const db = readDatabase();
  return {
    configured: Boolean(db.adminCredentialHash),
    usingEnvPasscode: false,
  };
}

export function claimAdminPassword(password: string): boolean {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (envPass) {
    return false;
  }
  const db = readDatabase();
  if (db.adminCredentialHash) {
    return false;
  }
  db.adminCredentialHash = hashPassword(password);
  writeDatabase(db);
  return true;
}

export function verifyAdminPassword(password: string): boolean {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (envPass) {
    return verifyEnvPasscode(password, envPass);
  }
  const db = readDatabase();
  if (!db.adminCredentialHash) return false;
  return verifyPasswordHash(password, db.adminCredentialHash);
}
