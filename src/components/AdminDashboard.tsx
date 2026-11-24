import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Check,
  FileText,
  HelpCircle,
  Inbox,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
  Palette,
  PlayCircle,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Workflow,
  Wrench,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { ThemeMode } from '../App.tsx';
import {
  AdminState,
  AuthStatusResponse,
  BlueprintFeatureIcon,
  BlueprintScenario,
  CredentialItem,
  FaqItem,
  ProjectItem,
  ProjectStatus,
  ServiceItem,
  SkillCategory,
  SkillProficiency,
} from '../types/portfolio.ts';

interface AdminDashboardProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onPortfolioMutated: () => void;
}

type AdminTab =
  | 'submissions'
  | 'appearance'
  | 'profile'
  | 'content'
  | 'sections'
  | 'blueprints'
  | 'projects'
  | 'services'
  | 'skills'
  | 'credentials'
  | 'faqs';

export function AdminDashboard({
  theme,
  onToggleTheme,
  onNavigateHome,
  onPortfolioMutated,
}: AdminDashboardProps) {
  const isDark = theme === 'dark';
  // Token kept strictly in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const [loginEmail, setLoginEmail] = useState<string>('nnajichukwumajefferson@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [adminData, setAdminData] = useState<AdminState | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Project Form Modal/Inline State
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [creatingProject, setCreatingProject] = useState<boolean>(false);

  // Service Form State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [creatingService, setCreatingService] = useState<boolean>(false);

  // Blueprint Form State
  const [editingBlueprint, setEditingBlueprint] = useState<BlueprintScenario | null>(null);
  const [creatingBlueprint, setCreatingBlueprint] = useState<boolean>(false);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  };

  const fetchAuthStatus = useCallback(async (currentToken: string | null) => {
    setLoadingAuth(true);
    try {
      const headers: Record<string, string> = {};
      if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
      const res = await fetch('/api/auth/status', { headers });
      const data = (await res.json()) as AuthStatusResponse;
      setAuthStatus(data);
    } catch {
      setAuthError('Unable to reach authentication server.');
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const loadDashboard = useCallback(async (activeToken: string) => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        setToken(null);
        return;
      }
      const data = (await res.json()) as AdminState;
      setAdminData(data);
    } catch {
      notify('err', 'Failed to load admin workspace data.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuthStatus(token);
  }, [fetchAuthStatus, token]);

  useEffect(() => {
    if (token && authStatus?.authenticated) {
      void loadDashboard(token);
    }
  }, [token, authStatus?.authenticated, loadDashboard]);

  const handleFirstRunSetup = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (loginPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (loginPassword !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Setup failed.');
        return;
      }
      setToken(data.token);
      setLoginPassword('');
      setConfirmPassword('');
    } catch {
      setAuthError('Network error during setup.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Sign-in failed.');
        return;
      }
      setToken(data.token);
      setLoginPassword('');
    } catch {
      setAuthError('Network error during sign-in.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    setAdminData(null);
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    if (!token) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = typeof reader.result === 'string' ? reader.result : '';
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              dataBase64: dataUrl,
            }),
          });
          const result = await res.json();
          if (!res.ok) {
            notify('err', result.error || 'Image upload failed.');
            resolve(null);
            return;
          }
          resolve(result.url as string);
        } catch {
          notify('err', 'Upload failed.');
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Auth Gate Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#0D0D0F] flex items-center justify-center p-4">
        <div className="text-sm font-medium text-[#242424]/70 dark:text-[#E8DFD0]/70">
          Verifying administrator access...
        </div>
      </div>
    );
  }

  if (!token || !authStatus?.authenticated || authStatus.role !== 'admin') {
    const needsSetup = authStatus && !authStatus.configured;

    return (
      <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#0D0D0F] flex flex-col justify-center items-center p-4 transition-colors duration-200">
        <div className="w-full max-w-md mb-4 flex justify-end">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#FFFDF9] dark:bg-[#161618] text-[#242424] dark:text-[#F8F5ED] hover:border-[#C47745] transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`w-[18px] h-[18px] transition-transform duration-300 ${isDark ? 'rotate-180' : 'rotate-0'}`}
            >
              <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 2.5A9.5 9.5 0 0 0 12 21.5Z" fill="#18181B" />
            </svg>
          </button>
        </div>

        <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
            <div>
              <p className="text-xs font-mono text-[#A85D2E] dark:text-[#C5A46D] font-semibold">SWIZZCONCEPTS</p>
              <h1 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                {needsSetup ? 'Claim Admin Access' : 'Administrator Sign-In'}
              </h1>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#242424] dark:bg-[#0D0D0F] text-[#C5A46D] border border-transparent dark:border-[#2A2A2E] flex items-center justify-center shrink-0">
              {needsSetup ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#242424]/75 dark:text-[#E8DFD0]/75 mt-4 leading-relaxed">
            {needsSetup
              ? 'No administrator passcode is set yet. Create a strong password for the portfolio owner account to protect /admin.'
              : 'Sign in with your administrator credentials to manage every section, project, service, skill, certificate, and inquiry.'}
          </p>

          <form
            onSubmit={(e) => void (needsSetup ? handleFirstRunSetup(e) : handleLogin(e))}
            className="mt-6 space-y-4"
          >
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                {needsSetup ? 'Create Password (min 8 characters)' : 'Password / Passcode'}
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
              />
            </div>

            {needsSetup && (
              <div>
                <label htmlFor="admin-pass-confirm" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="admin-pass-confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                />
              </div>
            )}

            {authError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#C47745]/10 border border-[#C47745]/40 text-xs font-medium text-[#8F3D13] dark:text-[#F2A679]"
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {authSubmitting
                ? 'Authenticating...'
                : needsSetup
                  ? 'Save Password & Enter Dashboard'
                  : 'Sign In to Dashboard'}
            </button>
          </form>

          <button
            type="button"
            onClick={onNavigateHome}
            className="mt-6 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#242424]/70 dark:text-[#E8DFD0]/70 hover:text-[#242424] dark:hover:text-[#F8F5ED] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Public Portfolio
          </button>
        </div>
      </div>
    );
  }

  // Save helpers
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminData || !token) return;
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(adminData.profile),
    });
    if (res.ok) {
      notify('ok', 'Profile & portrait updated.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save profile.');
    }
  };

  const saveAppearance = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminData || !token) return;
    const [profileRes, contentRes] = await Promise.all([
      fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(adminData.profile),
      }),
      fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...adminData.siteContent,
          timeline: adminData.timeline,
        }),
      }),
    ]);

    if (profileRes.ok && contentRes.ok) {
      notify('ok', 'Appearance settings, profile picture, title, and tagline saved.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save appearance changes.');
    }
  };

  const saveContent = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminData || !token) return;
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...adminData.siteContent,
        timeline: adminData.timeline,
      }),
    });
    if (res.ok) {
      notify('ok', 'Biography and site copy updated.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to update content.');
    }
  };

  const handleSaveProject = async (proj: ProjectItem, isNew: boolean) => {
    if (!token) return;
    const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${encodeURIComponent(proj.id)}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(proj),
    });
    if (res.ok) {
      const updatedList = (await res.json()) as ProjectItem[];
      setAdminData((prev) => (prev ? { ...prev, projects: updatedList } : prev));
      setEditingProject(null);
      setCreatingProject(false);
      notify('ok', isNew ? 'Project added.' : 'Project updated.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updatedList = (await res.json()) as ProjectItem[];
      setAdminData((prev) => (prev ? { ...prev, projects: updatedList } : prev));
      notify('ok', 'Project removed.');
      onPortfolioMutated();
    }
  };

  const handleSaveService = async (srv: ServiceItem, isNew: boolean) => {
    if (!token) return;
    const url = isNew ? '/api/admin/services' : `/api/admin/services/${encodeURIComponent(srv.id)}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(srv),
    });
    if (res.ok) {
      const updatedList = (await res.json()) as ServiceItem[];
      setAdminData((prev) => (prev ? { ...prev, services: updatedList } : prev));
      setEditingService(null);
      setCreatingService(false);
      notify('ok', isNew ? 'Service added.' : 'Service updated.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updatedList = (await res.json()) as ServiceItem[];
      setAdminData((prev) => (prev ? { ...prev, services: updatedList } : prev));
      notify('ok', 'Service removed.');
      onPortfolioMutated();
    }
  };

  const handleSaveSkills = async (nextCategories: SkillCategory[]) => {
    if (!token) return;
    const res = await fetch('/api/admin/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillCategories: nextCategories }),
    });
    if (res.ok) {
      const updated = (await res.json()) as SkillCategory[];
      setAdminData((prev) => (prev ? { ...prev, skillCategories: updated } : prev));
      notify('ok', 'Skills & proficiency updated.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save skills.');
    }
  };

  const handleSaveCredential = async (cred: CredentialItem) => {
    if (!token) return;
    const res = await fetch(`/api/admin/credentials/${encodeURIComponent(cred.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(cred),
    });
    if (res.ok) {
      const updated = (await res.json()) as CredentialItem[];
      setAdminData((prev) => (prev ? { ...prev, credentials: updated } : prev));
      notify('ok', `${cred.organization} details saved.`);
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to update credential.');
    }
  };

  const handleAddCredential = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        organization: 'New Institution',
        roleTitle: 'Automation Certification / Role',
        period: '2026',
        summary: 'Describe the training or engineering internship experience.',
        highlights: ['Workflow Automation', 'API Integrations'],
        certificateTitle: 'Certificate of Completion',
        certificateId: `SWZ-${Date.now().toString().slice(-5)}`,
        issuedDate: '2026',
        certificateImageUrl: '',
        linkedProjectIds: [],
      }),
    });
    if (res.ok) {
      const updated = (await res.json()) as CredentialItem[];
      setAdminData((prev) => (prev ? { ...prev, credentials: updated } : prev));
      notify('ok', 'New credential card added. Edit its details and save.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to create credential.');
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/credentials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = (await res.json()) as CredentialItem[];
      setAdminData((prev) => (prev ? { ...prev, credentials: updated } : prev));
      notify('ok', 'Credential removed.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to delete credential.');
    }
  };

  const handleSaveBlueprint = async (bp: BlueprintScenario, isNew: boolean) => {
    if (!token) return;
    const url = isNew
      ? '/api/admin/blueprints'
      : `/api/admin/blueprints/${encodeURIComponent(bp.id)}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bp),
    });
    if (res.ok) {
      const updated = (await res.json()) as BlueprintScenario[];
      setAdminData((prev) => (prev ? { ...prev, blueprints: updated } : prev));
      setEditingBlueprint(null);
      setCreatingBlueprint(false);
      notify('ok', isNew ? 'Automation blueprint added.' : 'Automation blueprint updated.');
      onPortfolioMutated();
    } else {
      const err = await res.json().catch(() => ({}));
      notify('err', err.error || 'Failed to save automation blueprint.');
    }
  };

  const handleDeleteBlueprint = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/blueprints/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = (await res.json()) as BlueprintScenario[];
      setAdminData((prev) => (prev ? { ...prev, blueprints: updated } : prev));
      notify('ok', 'Blueprint deleted.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to delete blueprint.');
    }
  };

  const handleSaveFaqs = async () => {
    if (!token || !adminData) return;
    const [faqRes, contentRes] = await Promise.all([
      fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ faqs: adminData.faqs }),
      }),
      fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          siteContent: adminData.siteContent,
          timeline: adminData.timeline,
        }),
      }),
    ]);

    if (faqRes.ok && contentRes.ok) {
      const updatedFaqs = (await faqRes.json()) as FaqItem[];
      setAdminData((prev) => (prev ? { ...prev, faqs: updatedFaqs } : prev));
      notify('ok', 'FAQs and section heading saved.');
      onPortfolioMutated();
    } else {
      notify('err', 'Failed to save FAQs.');
    }
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'new' | 'reviewed' | 'archived') => {
    if (!token) return;
    const res = await fetch(`/api/admin/submissions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setAdminData((prev) =>
        prev
          ? {
              ...prev,
              submissions: prev.submissions.map((s) => (s.id === id ? { ...s, status } : s)),
            }
          : prev
      );
      notify('ok', `Marked as ${status}.`);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setAdminData((prev) =>
        prev ? { ...prev, submissions: prev.submissions.filter((s) => s.id !== id) } : prev
      );
      notify('ok', 'Submission deleted.');
    }
  };

  const handlePortraitUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminData) return;
    const url = await uploadImageFile(file);
    if (url) {
      setAdminData({
        ...adminData,
        profile: { ...adminData.profile, portraitUrl: url },
      });
      notify('ok', 'Portrait uploaded. Click Save Profile to publish.');
    }
  };

  const handleCertificateUpload = async (credId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminData) return;
    const url = await uploadImageFile(file);
    if (url) {
      const next = adminData.credentials.map((c) =>
        c.id === credId ? { ...c, certificateImageUrl: url } : c
      );
      setAdminData({ ...adminData, credentials: next });
      notify('ok', 'Certificate uploaded. Click Save Credential to publish.');
    }
  };

  const NAV_TABS: { id: AdminTab; label: string; icon: typeof Inbox }[] = [
    { id: 'submissions', label: 'Inquiries Inbox', icon: Inbox },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile & Photo', icon: User },
    { id: 'content', label: 'Bio & Timeline', icon: FileText },
    { id: 'sections', label: 'Sections & Contact', icon: LayoutGrid },
    { id: 'blueprints', label: 'Blueprints', icon: Workflow },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'skills', label: 'Skills & Tools', icon: Wrench },
    { id: 'credentials', label: 'Certificates', icon: Award },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#0D0D0F] text-[#242424] dark:text-[#F8F5ED] flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar (260px desktop) */}
      <aside className="lg:w-64 bg-[#242424] dark:bg-[#141416] text-[#F8F5ED] shrink-0 flex flex-col justify-between p-5 border-b lg:border-b-0 lg:border-r border-[#E8DFD0]/20 dark:border-[#2A2A2E]">
        <div>
          <div className="pb-5 border-b border-white/10">
            <p className="font-display text-lg font-bold text-[#F8F5ED]">SWIZZCONCEPTS</p>
            <p className="text-xs text-[#C5A46D] mt-0.5">Admin Control Center</p>
          </div>

          <nav className="mt-5 flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#C47745] text-white'
                      : 'text-[#E8DFD0]/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.id === 'submissions' && adminData && (
                    <span className="ml-auto font-mono text-[11px] tabular-nums opacity-90">
                      {adminData.submissions.filter((s) => s.status === 'new').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-[#E8DFD0] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            View Public Website
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-[#C5A46D] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-[#FFFDF9] dark:bg-[#161618] border-b border-[#E8DFD0] dark:border-[#2A2A2E] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#242424]/60 dark:text-[#E8DFD0]/60">
              Admin / <span className="text-[#A85D2E] dark:text-[#C5A46D] font-medium">{NAV_TABS.find((t) => t.id === activeTab)?.label}</span>
            </p>
            <p className="text-xs font-mono text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-0.5">{authStatus.email}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={isDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#F8F5ED] dark:bg-[#0D0D0F] text-[#242424] dark:text-[#F8F5ED] hover:border-[#C47745] transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`w-[18px] h-[18px] transition-transform duration-300 ${isDark ? 'rotate-180' : 'rotate-0'}`}
              >
                <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
                <path d="M12 2.5A9.5 9.5 0 0 0 12 21.5Z" fill="#18181B" />
              </svg>
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-1.5 text-xs font-medium border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg cursor-pointer"
              >
                Public Site
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-3 py-1.5 text-xs font-medium bg-[#242424] dark:bg-[#C47745] text-[#F8F5ED] rounded-lg cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {toast && (
          <div className="mx-6 mt-4">
            <div
              role="status"
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                toast.type === 'ok'
                  ? 'bg-[#242424] dark:bg-[#161618] border border-transparent dark:border-[#2A2A2E] text-[#F8F5ED]'
                  : 'bg-[#C47745]/15 border border-[#C47745] text-[#8F3D13] dark:text-[#F2A679]'
              }`}
            >
              <Check className="w-4 h-4 text-[#C5A46D]" />
              {toast.text}
            </div>
          </div>
        )}

        <div className="p-6 max-w-5xl">
          {loadingData || !adminData ? (
            <div className="py-16 text-center text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70">
              Loading workspace records...
            </div>
          ) : (
            <>
              {/* 1. SUBMISSIONS TAB */}
              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                    Contact Form Submissions ({adminData.submissions.length})
                  </h2>

                  {adminData.submissions.length === 0 ? (
                    <div className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-10 text-center">
                      <p className="font-display text-base font-semibold text-[#242424] dark:text-[#F8F5ED]">
                        No inquiries submitted yet
                      </p>
                      <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                        Submissions from the public contact form will appear here for review.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {adminData.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-[#242424]/65 dark:text-[#E8DFD0]/65">
                                <span className="font-semibold text-[#A85D2E] dark:text-[#C5A46D]">{sub.serviceOfInterest}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {new Date(sub.createdAt).toLocaleString()}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="capitalize font-medium text-[#242424] dark:text-[#F8F5ED]">{sub.status}</span>
                              </div>
                              <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                                {sub.fullName}
                                {sub.company && (
                                  <span className="text-sm font-normal text-[#242424]/70 dark:text-[#E8DFD0]/70"> · {sub.company}</span>
                                )}
                              </h3>
                              <p className="text-xs font-mono text-[#242424]/75 dark:text-[#E8DFD0]/75">{sub.email}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                aria-label="Submission status"
                                value={sub.status}
                                onChange={(e) =>
                                  void handleUpdateSubmissionStatus(
                                    sub.id,
                                    e.target.value as 'new' | 'reviewed' | 'archived'
                                  )
                                }
                                className="px-2.5 py-1.5 text-xs bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                              >
                                <option value="new">New</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="archived">Archived</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => void handleDeleteSubmission(sub.id)}
                                aria-label="Delete submission"
                                className="p-2 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-[#242424]/85 dark:text-[#E8DFD0]/85 leading-relaxed pt-2 border-t border-[#E8DFD0] dark:border-[#2A2A2E]">
                            {sub.projectDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 1B. APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <form
                  onSubmit={(e) => void saveAppearance(e)}
                  className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-6 space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Appearance, Profile Picture & Tagline
                    </h2>
                    <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                      Update your hero portrait image, professional title, role labels, and primary taglines shown across the portfolio.
                    </p>
                  </div>

                  {/* Profile Picture Upload Card */}
                  <div className="p-5 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-28 h-36 rounded-xl overflow-hidden border border-[#C5A46D]/50 bg-[#242424] shrink-0">
                      <img
                        src={adminData.profile.portraitUrl}
                        alt={adminData.profile.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#242424] dark:text-[#F8F5ED]">
                          Profile Picture
                        </h3>
                        <p className="text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-0.5">
                          Upload a new portrait photograph (PNG, JPG, or WEBP up to 5 MB). Then click Save Appearance to publish.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#242424] dark:bg-[#222226] hover:bg-[#383838] dark:hover:bg-[#2C2C32] rounded-lg cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-[#C5A46D]" />
                          Upload New Profile Picture
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => void handlePortraitUpload(e)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Professional Title & Tagline Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="app-title" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                        Professional Title
                      </label>
                      <input
                        id="app-title"
                        type="text"
                        value={adminData.profile.title}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, title: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                      />
                    </div>

                    <div>
                      <label htmlFor="app-roles" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                        Role Labels (comma separated)
                      </label>
                      <input
                        id="app-roles"
                        type="text"
                        value={adminData.profile.roleLabels.join(', ')}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: {
                              ...adminData.profile,
                              roleLabels: e.target.value
                                .split(',')
                                .map((r) => r.trim())
                                .filter(Boolean),
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="app-hero-headline" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                      Primary Hero Headline
                    </label>
                    <input
                      id="app-hero-headline"
                      type="text"
                      value={adminData.siteContent.heroHeadline}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, heroHeadline: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="app-hero-tagline" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                      Hero Supporting Tagline
                    </label>
                    <textarea
                      id="app-hero-tagline"
                      rows={3}
                      value={adminData.siteContent.heroSupportingText}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, heroSupportingText: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="app-footer-tagline" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                      Footer Brand Tagline
                    </label>
                    <input
                      id="app-footer-tagline"
                      type="text"
                      value={adminData.siteContent.footerTagline}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, footerTagline: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] focus:border-[#C47745] focus:outline-none rounded-lg"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Appearance
                    </button>
                  </div>
                </form>
              )}

              {/* 2. PROFILE & PHOTO TAB */}
              {activeTab === 'profile' && (
                <form onSubmit={(e) => void saveProfile(e)} className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-6 space-y-5">
                  <h2 className="font-display text-xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                    Profile & Portrait Settings
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                    <img
                      src={adminData.profile.portraitUrl}
                      alt={adminData.profile.fullName}
                      className="w-24 h-28 object-cover rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#242424]"
                    />
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#E8DFD0] dark:bg-[#222226] hover:bg-[#C5A46D]/40 dark:hover:bg-[#2C2C32] text-[#242424] dark:text-[#F8F5ED] rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload New Portrait Photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => void handlePortraitUpload(e)}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-xs text-[#242424]/65 dark:text-[#E8DFD0]/65">PNG, JPG, or WEBP up to 5 MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={adminData.profile.brandName}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, brandName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={adminData.profile.fullName}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, fullName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={adminData.profile.title}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Location</label>
                      <input
                        type="text"
                        value={adminData.profile.location}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, location: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={adminData.profile.email}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, email: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Availability Text</label>
                      <input
                        type="text"
                        value={adminData.profile.availabilityText}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, availabilityText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#242424]/80 dark:text-[#E8DFD0]/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={adminData.profile.isAvailable}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              profile: { ...adminData.profile, isAvailable: e.target.checked },
                            })
                          }
                          className="accent-[#C47745] w-4 h-4 rounded"
                        />
                        Show availability status badge in Hero section
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">WhatsApp Display</label>
                      <input
                        type="text"
                        value={adminData.profile.whatsappDisplay}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, whatsappDisplay: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">WhatsApp URL</label>
                      <input
                        type="url"
                        value={adminData.profile.whatsappUrl}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, whatsappUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">LinkedIn Handle</label>
                      <input
                        type="text"
                        value={adminData.profile.linkedinHandle}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, linkedinHandle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={adminData.profile.linkedinUrl}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            profile: { ...adminData.profile, linkedinUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Discovery Call Booking Settings */}
                  <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C47745]" />
                      <h3 className="font-display text-sm font-bold text-[#242424] dark:text-[#F8F5ED]">
                        Discovery Call Booking (Calendly / Cal.com)
                      </h3>
                    </div>
                    <p className="text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70">
                      Paste your Calendly or Cal.com scheduling link to open it directly from the Hero &amp; Contact buttons. If left blank, clicking the button scrolls visitors smoothly to the inquiry form.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Booking Button Label</label>
                        <input
                          type="text"
                          value={adminData.profile.bookingButtonLabel || ''}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              profile: { ...adminData.profile, bookingButtonLabel: e.target.value },
                            })
                          }
                          placeholder="Book a Discovery Call"
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Calendly / Cal.com URL</label>
                        <input
                          type="url"
                          value={adminData.profile.bookingUrl || ''}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              profile: { ...adminData.profile, bookingUrl: e.target.value },
                            })
                          }
                          placeholder="https://cal.com/your-handle/discovery"
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Profile
                  </button>
                </form>
              )}

              {/* 3. BIO & TIMELINE TAB */}
              {activeTab === 'content' && (
                <form onSubmit={(e) => void saveContent(e)} className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-6 space-y-5">
                  <h2 className="font-display text-xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                    Website Headlines, Biography & Career Timeline
                  </h2>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Hero Headline</label>
                    <input
                      type="text"
                      value={adminData.siteContent.heroHeadline}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, heroHeadline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Hero Supporting Text</label>
                    <textarea
                      rows={2}
                      value={adminData.siteContent.heroSupportingText}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, heroSupportingText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">About Section Headline</label>
                    <input
                      type="text"
                      value={adminData.siteContent.aboutHeadline}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: { ...adminData.siteContent, aboutHeadline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Biography Paragraphs (separated by blank line)
                    </label>
                    <textarea
                      rows={7}
                      value={adminData.siteContent.aboutBioParagraphs.join('\n\n')}
                      onChange={(e) =>
                        setAdminData({
                          ...adminData,
                          siteContent: {
                            ...adminData.siteContent,
                            aboutBioParagraphs: e.target.value.split(/\n\s*\n/).map((p) => p.trim()),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                    />
                  </div>

                  {/* Core Engineering Focus Box */}
                  <div className="pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E] space-y-4">
                    <h3 className="font-display text-base font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Core Engineering Focus Card
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Card Title</label>
                        <input
                          type="text"
                          value={adminData.siteContent.aboutPillarsTitle}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, aboutPillarsTitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Card Subtitle</label>
                        <input
                          type="text"
                          value={adminData.siteContent.aboutPillarsSubtitle}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, aboutPillarsSubtitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Focus Pillars (one per line)
                      </label>
                      <textarea
                        rows={5}
                        value={adminData.siteContent.aboutPillars.join('\n')}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            siteContent: {
                              ...adminData.siteContent,
                              aboutPillars: e.target.value.split('\n').map((p) => p.trim()).filter(Boolean),
                            },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-[#242424] dark:text-[#F8F5ED]">
                        Career Journey Timeline
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setAdminData({
                            ...adminData,
                            timeline: [
                              ...adminData.timeline,
                              {
                                id: `tl-${Date.now()}`,
                                stepNumber: String(adminData.timeline.length + 1).padStart(2, '0'),
                                title: 'New Milestone',
                                subtitle: 'Phase Subtitle',
                                description: 'Describe what you built or learned during this stage.',
                              },
                            ],
                          })
                        }
                        className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] hover:underline cursor-pointer"
                      >
                        + Add Milestone
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Timeline Section Headline</label>
                      <input
                        type="text"
                        value={adminData.siteContent.timelineHeadline}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            siteContent: { ...adminData.siteContent, timelineHeadline: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminData.timeline.map((step, idx) => (
                        <div key={step.id} className="p-4 rounded-lg bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={step.stepNumber}
                              onChange={(e) => {
                                const next = [...adminData.timeline];
                                next[idx] = { ...step, stepNumber: e.target.value };
                                setAdminData({ ...adminData, timeline: next });
                              }}
                              className="w-16 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                            />
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const next = [...adminData.timeline];
                                next[idx] = { ...step, title: e.target.value };
                                setAdminData({ ...adminData, timeline: next });
                              }}
                              className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                            />
                            {adminData.timeline.length > 1 && (
                              <button
                                type="button"
                                aria-label="Remove milestone"
                                onClick={() =>
                                  setAdminData({
                                    ...adminData,
                                    timeline: adminData.timeline.filter((t) => t.id !== step.id),
                                  })
                                }
                                className="p-1.5 text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={step.subtitle}
                            onChange={(e) => {
                              const next = [...adminData.timeline];
                              next[idx] = { ...step, subtitle: e.target.value };
                              setAdminData({ ...adminData, timeline: next });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                          />
                          <textarea
                            rows={3}
                            value={step.description}
                            onChange={(e) => {
                              const next = [...adminData.timeline];
                              next[idx] = { ...step, description: e.target.value };
                              setAdminData({ ...adminData, timeline: next });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Content & Timeline
                  </button>
                </form>
              )}

              {/* 3B. ALL SECTIONS & CONTACT COPY TAB */}
              {activeTab === 'sections' && (
                <form
                  onSubmit={(e) => void saveContent(e)}
                  className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-6 space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Section Headings, Subtexts & Contact Copy
                    </h2>
                    <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                      Edit the headings and descriptions displayed at the top of Services, Projects, Skills, Training, Contact, and Footer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
                      <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">Services Section</h3>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.servicesHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, servicesHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.servicesSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, servicesSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
                      <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">Projects Showcase Section</h3>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.projectsHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, projectsHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.projectsSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, projectsSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
                      <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">Skills Section</h3>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.skillsHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, skillsHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.skillsSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, skillsSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
                      <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">Training & Internship Section</h3>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.credentialsHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, credentialsHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.credentialsSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, credentialsSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">Contact & Footer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Contact Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.contactHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, contactHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Form Card Title</label>
                        <input
                          type="text"
                          value={adminData.siteContent.contactFormTitle}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, contactFormTitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Contact Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.contactSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, contactSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Form Card Subtext</label>
                        <textarea
                          rows={2}
                          value={adminData.siteContent.contactFormSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, contactFormSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Footer Text</label>
                      <input
                        type="text"
                        value={adminData.siteContent.footerTagline}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            siteContent: { ...adminData.siteContent, footerTagline: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save All Section Text
                  </button>
                </form>
              )}

              {/* BLUEPRINTS TAB */}
              {activeTab === 'blueprints' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                        Automation Blueprints ({adminData.blueprints.length})
                      </h2>
                      <p className="text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                        Edit the interactive scenarios displayed inside the n8n Orchestration · AI Agent Classification · CRM Record Updates grid.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingBlueprint(true);
                        setEditingBlueprint({
                          id: 'new',
                          label: '',
                          stackSummary: 'Webhook · n8n · OpenAI · Airtable',
                          triggerSource: '',
                          triggerMethod: 'POST /webhooks/custom-flow',
                          inboundText: '',
                          triggerMeta: 'Validated JSON payload',
                          classification: '',
                          aiModel: 'LLM Structured Extractor',
                          aiActionMeta: 'Extracted intent & structured fields',
                          crmTarget: '',
                          crmAction: '',
                          crmMeta: 'Idempotent upsert · Alert sent',
                          latencyLabel: '1.2s end-to-end',
                          outputJson: {
                            intent: 'automation_flow',
                            status: 'classified',
                          },
                          features: [
                            { label: 'Webhook Auth', value: 'HMAC signature verification', statusTag: 'Verified', icon: 'auth' },
                            { label: 'Schema Guardrail', value: 'Strict JSON field validation', statusTag: 'Validated', icon: 'schema' },
                            { label: 'Retry & Fallback', value: '3x backoff + Slack error alert', statusTag: 'Armed', icon: 'retry' },
                            { label: 'Idempotent Sync', value: 'Deduplicated record upsert key', statusTag: 'Synced', icon: 'sync' },
                            { label: 'Execution SLA', value: '1.2s end-to-end completion', statusTag: 'Passed', icon: 'latency' },
                            { label: 'Audit & Notify', value: 'Execution log & channel update', statusTag: 'Dispatched', icon: 'audit' },
                          ],
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Blueprint
                    </button>
                  </div>

                  {editingBlueprint && (
                    <BlueprintEditorForm
                      key={editingBlueprint.id}
                      blueprint={editingBlueprint}
                      isNew={creatingBlueprint}
                      onCancel={() => {
                        setEditingBlueprint(null);
                        setCreatingBlueprint(false);
                      }}
                      onSave={(bp) => void handleSaveBlueprint(bp, creatingBlueprint)}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminData.blueprints.map((bp, idx) => (
                      <div
                        key={bp.id}
                        className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#A85D2E] dark:text-[#C5A46D]">
                            <span>{String(idx + 1).padStart(2, '0')} · {bp.latencyLabel}</span>
                            <span className="truncate max-w-[180px] text-[#242424]/60 dark:text-[#E8DFD0]/60">
                              {bp.stackSummary}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED] mt-1.5">
                            {bp.label}
                          </h3>
                          <p className="text-xs text-[#242424]/75 dark:text-[#E8DFD0]/75 mt-1">
                            {bp.triggerSource} → {bp.classification} → {bp.crmTarget}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-[#E8DFD0] dark:border-[#2A2A2E]">
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingBlueprint(false);
                              setEditingBlueprint(bp);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#E8DFD0]/70 dark:bg-[#222226] hover:bg-[#E8DFD0] dark:hover:bg-[#2C2C32] text-[#242424] dark:text-[#F8F5ED] rounded-lg cursor-pointer"
                          >
                            Edit Blueprint
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteBlueprint(bp.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. PROJECTS TAB */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Projects ({adminData.projects.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingProject(true);
                        setEditingProject({
                          id: 'new',
                          title: '',
                          category: 'Workflow Automation',
                          status: 'Completed',
                          overview: '',
                          businessProblem: '',
                          solutionImplemented: '',
                          tools: ['n8n', 'OpenAI'],
                          workflowSteps: ['Trigger captured', 'AI processes payload', 'Target app updated'],
                          workflowExplanation: '',
                          businessValue: '',
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>

                  {editingProject && (
                    <ProjectEditorForm
                      key={editingProject.id}
                      project={editingProject}
                      isNew={creatingProject}
                      onUploadImage={uploadImageFile}
                      onCancel={() => {
                        setEditingProject(null);
                        setCreatingProject(false);
                      }}
                      onSave={(p) => void handleSaveProject(p, creatingProject)}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminData.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-xs text-[#A85D2E] dark:text-[#C5A46D] font-medium">
                            {proj.category} · {proj.status}
                          </p>
                          <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-[#242424]/75 dark:text-[#E8DFD0]/75 mt-2 line-clamp-2">{proj.overview}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E8DFD0] dark:border-[#2A2A2E] flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingProject(false);
                              setEditingProject(proj);
                            }}
                            className="text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] hover:text-[#C47745] cursor-pointer"
                          >
                            Edit Case Study
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteProject(proj.id)}
                            className="text-xs font-semibold text-[#8F3D13] dark:text-[#E89B6C] hover:underline ml-auto cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Services ({adminData.services.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingService(true);
                        setEditingService({
                          id: 'new',
                          title: '',
                          icon: 'Workflow',
                          shortDescription: '',
                          capabilities: ['Automated triggers', 'API synchronization'],
                          howItWorks: {
                            trigger: 'Webhook or scheduled event',
                            processing: 'AI and JavaScript data processing',
                            output: 'Target platform updated cleanly',
                            summary: 'Dependable automated execution.',
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Service
                    </button>
                  </div>

                  {editingService && (
                    <ServiceEditorForm
                      key={editingService.id}
                      service={editingService}
                      isNew={creatingService}
                      onCancel={() => {
                        setEditingService(null);
                        setCreatingService(false);
                      }}
                      onSave={(s) => void handleSaveService(s, creatingService)}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminData.services.map((srv) => (
                      <div key={srv.id} className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5">
                        <h3 className="font-display text-base font-bold text-[#242424] dark:text-[#F8F5ED]">{srv.title}</h3>
                        <p className="text-xs text-[#242424]/75 dark:text-[#E8DFD0]/75 mt-1.5">{srv.shortDescription}</p>
                        <div className="mt-4 pt-3 border-t border-[#E8DFD0] dark:border-[#2A2A2E] flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingService(false);
                              setEditingService(srv);
                            }}
                            className="text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] hover:text-[#C47745] cursor-pointer"
                          >
                            Edit Service
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteService(srv.id)}
                            className="text-xs font-semibold text-[#8F3D13] dark:text-[#E89B6C] hover:underline ml-auto cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. SKILLS TAB */}
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Skills & Tools Manager
                    </h2>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAdminData({
                            ...adminData,
                            skillCategories: [
                              ...adminData.skillCategories,
                              {
                                id: `cat-${Date.now()}`,
                                name: 'New Category',
                                items: [
                                  {
                                    id: `sk-${Date.now()}`,
                                    name: 'New Tool',
                                    proficiency: 'Practical Experience',
                                  },
                                ],
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#E8DFD0] dark:bg-[#222226] text-[#242424] dark:text-[#F8F5ED] hover:bg-[#C5A46D]/40 dark:hover:bg-[#2C2C32] rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveSkills(adminData.skillCategories)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save All Skills
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {adminData.skillCategories.map((cat, catIdx) => (
                      <div key={cat.id} className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                          <input
                            type="text"
                            aria-label="Category name"
                            value={cat.name}
                            onChange={(e) => {
                              const next = [...adminData.skillCategories];
                              next[catIdx] = { ...cat, name: e.target.value };
                              setAdminData({ ...adminData, skillCategories: next });
                            }}
                            className="flex-1 min-w-0 px-2 py-1 font-display text-sm font-bold bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...adminData.skillCategories];
                              next[catIdx] = {
                                ...cat,
                                items: [
                                  ...cat.items,
                                  {
                                    id: `sk-${Date.now()}`,
                                    name: 'New Tool',
                                    proficiency: 'Practical Experience',
                                  },
                                ],
                              };
                              setAdminData({ ...adminData, skillCategories: next });
                            }}
                            className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            + Add Tool
                          </button>
                          {adminData.skillCategories.length > 1 && (
                            <button
                              type="button"
                              aria-label="Remove category"
                              onClick={() =>
                                setAdminData({
                                  ...adminData,
                                  skillCategories: adminData.skillCategories.filter((c) => c.id !== cat.id),
                                })
                              }
                              className="p-1.5 text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {cat.items.map((item, itemIdx) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const next = [...adminData.skillCategories];
                                  const nextItems = [...cat.items];
                                  nextItems[itemIdx] = { ...item, name: e.target.value };
                                  next[catIdx] = { ...cat, items: nextItems };
                                  setAdminData({ ...adminData, skillCategories: next });
                                }}
                                className="flex-1 px-2.5 py-1.5 text-xs bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                              />
                              <select
                                value={item.proficiency}
                                onChange={(e) => {
                                  const next = [...adminData.skillCategories];
                                  const nextItems = [...cat.items];
                                  nextItems[itemIdx] = {
                                    ...item,
                                    proficiency: e.target.value as SkillProficiency,
                                  };
                                  next[catIdx] = { ...cat, items: nextItems };
                                  setAdminData({ ...adminData, skillCategories: next });
                                }}
                                className="px-2 py-1.5 text-xs bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded"
                              >
                                <option value="Practical Experience">Practical Experience</option>
                                <option value="Learning">Learning</option>
                              </select>
                              <button
                                type="button"
                                aria-label="Remove skill"
                                onClick={() => {
                                  const next = [...adminData.skillCategories];
                                  next[catIdx] = {
                                    ...cat,
                                    items: cat.items.filter((s) => s.id !== item.id),
                                  };
                                  setAdminData({ ...adminData, skillCategories: next });
                                }}
                                className="p-1.5 text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CREDENTIALS & CERTIFICATES TAB */}
              {activeTab === 'credentials' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                      Training & Internship Certificates
                    </h2>
                    <button
                      type="button"
                      onClick={() => void handleAddCredential()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Credential
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {adminData.credentials.map((cred, idx) => (
                      <div key={cred.id} className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DFD0] dark:border-[#2A2A2E] pb-3">
                          <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED]">
                            {cred.organization} — {cred.roleTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#E8DFD0] dark:bg-[#222226] hover:bg-[#C5A46D]/40 dark:hover:bg-[#2C2C32] text-[#242424] dark:text-[#F8F5ED] rounded-lg cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              Upload Certificate Image
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => void handleCertificateUpload(cred.id, e)}
                                className="sr-only"
                              />
                            </label>
                            {adminData.credentials.length > 1 && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteCredential(cred.id)}
                                className="px-3 py-2 text-xs font-semibold text-[#8F3D13] dark:text-[#E89B6C] border border-[#E8DFD0] dark:border-[#2A2A2E] hover:bg-[#C47745]/10 rounded-lg cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {cred.certificateImageUrl && (
                          <div className="flex items-center gap-4">
                            <img
                              src={cred.certificateImageUrl}
                              alt={cred.certificateTitle}
                              className="h-20 w-auto rounded border border-[#E8DFD0] dark:border-[#2A2A2E]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, certificateImageUrl: '' };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="text-xs text-[#8F3D13] dark:text-[#E89B6C] hover:underline cursor-pointer"
                            >
                              Revert to Default Vector Certificate
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Organization</label>
                            <input
                              type="text"
                              value={cred.organization}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, organization: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Role / Program Title</label>
                            <input
                              type="text"
                              value={cred.roleTitle}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, roleTitle: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Period</label>
                            <input
                              type="text"
                              value={cred.period}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, period: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Certificate Title</label>
                            <input
                              type="text"
                              value={cred.certificateTitle}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, certificateTitle: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Certificate ID</label>
                            <input
                              type="text"
                              value={cred.certificateId}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, certificateId: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Issued Date</label>
                            <input
                              type="text"
                              value={cred.issuedDate}
                              onChange={(e) => {
                                const next = [...adminData.credentials];
                                next[idx] = { ...cred, issuedDate: e.target.value };
                                setAdminData({ ...adminData, credentials: next });
                              }}
                              className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Summary</label>
                          <textarea
                            rows={2}
                            value={cred.summary}
                            onChange={(e) => {
                              const next = [...adminData.credentials];
                              next[idx] = { ...cred, summary: e.target.value };
                              setAdminData({ ...adminData, credentials: next });
                            }}
                            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Key Areas Covered (one per line)</label>
                          <textarea
                            rows={3}
                            value={cred.highlights.join('\n')}
                            onChange={(e) => {
                              const next = [...adminData.credentials];
                              next[idx] = {
                                ...cred,
                                highlights: e.target.value.split('\n').map((h) => h.trim()).filter(Boolean),
                              };
                              setAdminData({ ...adminData, credentials: next });
                            }}
                            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold mb-1.5">Linked Project Showcases</p>
                          <div className="flex flex-wrap gap-2">
                            {adminData.projects.map((proj) => {
                              const checked = cred.linkedProjectIds.includes(proj.id);
                              return (
                                <label
                                  key={proj.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const nextIds = e.target.checked
                                        ? [...cred.linkedProjectIds, proj.id]
                                        : cred.linkedProjectIds.filter((pid) => pid !== proj.id);
                                      const next = [...adminData.credentials];
                                      next[idx] = { ...cred, linkedProjectIds: nextIds };
                                      setAdminData({ ...adminData, credentials: next });
                                    }}
                                    className="accent-[#C47745]"
                                  />
                                  <span className="truncate max-w-[200px]">{proj.title}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleSaveCredential(cred)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save {cred.organization}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQS TAB */}
              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED]">
                        FAQ Accordion ({adminData.faqs.length})
                      </h2>
                      <p className="text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                        Answer client questions on platforms, API costs, error recovery, and timelines.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdminData({
                            ...adminData,
                            faqs: [
                              ...adminData.faqs,
                              {
                                id: `faq-${Date.now()}`,
                                question: 'New Question',
                                answer: 'Provide a clear, practical engineering answer.',
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#242424] dark:bg-[#222226] text-[#F8F5ED] hover:bg-[#383838] rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C5A46D]" />
                        Add FAQ
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveFaqs()}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save All FAQs
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#A85D2E] dark:text-[#C5A46D]">
                      FAQ Section Heading
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          value={adminData.siteContent.faqHeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, faqHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtext</label>
                        <input
                          type="text"
                          value={adminData.siteContent.faqSubtext}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, faqSubtext: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {adminData.faqs.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-xl p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-[#C5A46D]">
                            FAQ {String(idx + 1).padStart(2, '0')}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAdminData({
                                ...adminData,
                                faqs: adminData.faqs.filter((f) => f.id !== item.id),
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8F3D13] dark:text-[#E89B6C] hover:bg-[#C47745]/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Question</label>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => {
                              const next = [...adminData.faqs];
                              next[idx] = { ...item, question: e.target.value };
                              setAdminData({ ...adminData, faqs: next });
                            }}
                            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Answer</label>
                          <textarea
                            rows={3}
                            value={item.answer}
                            onChange={(e) => {
                              const next = [...adminData.faqs];
                              next[idx] = { ...item, answer: e.target.value };
                              setAdminData({ ...adminData, faqs: next });
                            }}
                            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectEditorForm({
  project,
  isNew,
  onUploadImage,
  onCancel,
  onSave,
}: {
  project: ProjectItem;
  isNew: boolean;
  onUploadImage: (file: File) => Promise<string | null>;
  onCancel: () => void;
  onSave: (p: ProjectItem) => void;
}) {
  const [draft, setDraft] = useState<ProjectItem>(project);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await onUploadImage(file);
    setUploadingCover(false);
    if (url) {
      setDraft((prev) => ({ ...prev, coverImageUrl: url }));
    }
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const url = await onUploadImage(file);
      if (url) uploaded.push(url);
    }
    setUploadingGallery(false);
    if (uploaded.length > 0) {
      setDraft((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...uploaded].slice(0, 8),
      }));
    }
  };

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#C47745] rounded-xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED]">
        {isNew ? 'Create New Project' : `Edit Case Study: ${project.title}`}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Title</label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Category</label>
          <input
            type="text"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as ProjectStatus })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          >
            <option value="Production Ready">Production Ready</option>
            <option value="Completed">Completed</option>
            <option value="Active System">Active System</option>
            <option value="Prototype">Prototype</option>
          </select>
        </div>
      </div>

      {/* Case Study Images Upload */}
      <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#242424] dark:text-[#F8F5ED]">Case Study Visuals & Screenshots</p>
            <p className="text-[11px] text-[#242424]/65 dark:text-[#E8DFD0]/65">
              Upload workflow diagrams, n8n screenshots, or system architecture images (PNG, JPG, WEBP).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#242424] dark:bg-[#222226] text-[#F8F5ED] hover:bg-[#383838] dark:hover:bg-[#2C2C32] rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#C5A46D]" />
              {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void handleCoverUpload(e)}
                className="sr-only"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#E8DFD0] dark:bg-[#222226] hover:bg-[#C5A46D]/40 dark:hover:bg-[#2C2C32] text-[#242424] dark:text-[#F8F5ED] rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploadingGallery ? 'Uploading...' : 'Add Gallery Images'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => void handleGalleryUpload(e)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {(draft.coverImageUrl || (draft.galleryImages && draft.galleryImages.length > 0)) && (
          <div className="flex flex-wrap items-start gap-3">
            {draft.coverImageUrl && (
              <div className="relative group">
                <img
                  src={draft.coverImageUrl}
                  alt="Cover preview"
                  className="h-20 w-32 object-cover rounded-lg border border-[#C47745]"
                />
                <span className="block text-[10px] font-mono text-[#A85D2E] dark:text-[#C5A46D] mt-1">Cover Image</span>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, coverImageUrl: '' })}
                  className="text-[10px] text-[#8F3D13] dark:text-[#E89B6C] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {(draft.galleryImages || []).map((imgUrl, idx) => (
              <div key={imgUrl + idx} className="relative">
                <img
                  src={imgUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="h-20 w-28 object-cover rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E]"
                />
                <span className="block text-[10px] font-mono text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
                  Image {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      galleryImages: (draft.galleryImages || []).filter((_, i) => i !== idx),
                    })
                  }
                  className="text-[10px] text-[#8F3D13] dark:text-[#E89B6C] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Walkthrough Embed URL */}
      <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2">
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#242424] dark:text-[#F8F5ED]">
          <PlayCircle className="w-3.5 h-3.5 text-[#C47745]" />
          Workflow Video Walkthrough URL (Optional)
        </label>
        <input
          type="url"
          value={draft.videoUrl || ''}
          onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
          placeholder="https://www.loom.com/share/... or https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
        <p className="text-[11px] text-[#242424]/65 dark:text-[#E8DFD0]/65">
          Supports Loom, YouTube, Vimeo, or direct MP4/WebM links—embedded directly in the Case Study modal.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Overview</label>
        <textarea
          rows={2}
          value={draft.overview}
          onChange={(e) => setDraft({ ...draft, overview: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Business Problem</label>
          <textarea
            rows={3}
            value={draft.businessProblem}
            onChange={(e) => setDraft({ ...draft, businessProblem: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Solution Implemented</label>
          <textarea
            rows={3}
            value={draft.solutionImplemented}
            onChange={(e) => setDraft({ ...draft, solutionImplemented: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Workflow Steps (one per line)</label>
        <textarea
          rows={3}
          value={draft.workflowSteps.join('\n')}
          onChange={(e) =>
            setDraft({
              ...draft,
              workflowSteps: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Workflow Explanation</label>
        <textarea
          rows={2}
          value={draft.workflowExplanation}
          onChange={(e) => setDraft({ ...draft, workflowExplanation: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Tools (comma separated)</label>
          <input
            type="text"
            value={draft.tools.join(', ')}
            onChange={(e) =>
              setDraft({
                ...draft,
                tools: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              })
            }
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Expected / Achieved Business Value</label>
          <input
            type="text"
            value={draft.businessValue}
            onChange={(e) => setDraft({ ...draft, businessValue: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-[#222226] rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="px-5 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
        >
          Save Project
        </button>
      </div>
    </div>
  );
}

function ServiceEditorForm({
  service,
  isNew,
  onCancel,
  onSave,
}: {
  service: ServiceItem;
  isNew: boolean;
  onCancel: () => void;
  onSave: (s: ServiceItem) => void;
}) {
  const [draft, setDraft] = useState<ServiceItem>(service);

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#C47745] rounded-xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED]">
        {isNew ? 'Add Service' : `Edit: ${service.title}`}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Service Title</label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Icon Key</label>
          <select
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          >
            <option value="Workflow">Workflow</option>
            <option value="Bot">Bot</option>
            <option value="Cpu">Cpu</option>
            <option value="Users">Users</option>
            <option value="Plug">Plug</option>
            <option value="MessageSquareText">MessageSquareText</option>
            <option value="DatabaseZap">DatabaseZap</option>
            <option value="BookOpenCheck">BookOpenCheck</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Short Description</label>
        <textarea
          rows={2}
          value={draft.shortDescription}
          onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Capabilities (one per line)</label>
        <textarea
          rows={3}
          value={draft.capabilities.join('\n')}
          onChange={(e) =>
            setDraft({
              ...draft,
              capabilities: e.target.value.split('\n').map((c) => c.trim()).filter(Boolean),
            })
          }
          className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
        />
      </div>

      <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-3">
        <p className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D]">
          &ldquo;How It Works&rdquo; Modal Architecture
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">01 · Trigger</label>
            <input
              type="text"
              value={draft.howItWorks.trigger}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  howItWorks: { ...draft.howItWorks, trigger: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">02 · Processing & Logic</label>
            <input
              type="text"
              value={draft.howItWorks.processing}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  howItWorks: { ...draft.howItWorks, processing: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">03 · Output & Sync</label>
            <input
              type="text"
              value={draft.howItWorks.output}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  howItWorks: { ...draft.howItWorks, output: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Architecture Summary</label>
          <input
            type="text"
            value={draft.howItWorks.summary}
            onChange={(e) =>
              setDraft({
                ...draft,
                howItWorks: { ...draft.howItWorks, summary: e.target.value },
              })
            }
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-[#222226] rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="px-5 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
        >
          Save Service
        </button>
      </div>
    </div>
  );
}

function BlueprintEditorForm({
  blueprint,
  isNew,
  onCancel,
  onSave,
}: {
  blueprint: BlueprintScenario;
  isNew: boolean;
  onCancel: () => void;
  onSave: (bp: BlueprintScenario) => void;
}) {
  const [draft, setDraft] = useState<BlueprintScenario>(blueprint);
  const [jsonText, setJsonText] = useState<string>(() =>
    JSON.stringify(blueprint.outputJson || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string>('');

  const handleSaveClick = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('Output JSON must be a flat JSON object (key/value pairs).');
        return;
      }
      const normalizedJson: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        normalizedJson[k] = typeof v === 'string' ? v : String(v);
      }
      setJsonError('');
      onSave({ ...draft, outputJson: normalizedJson });
    } catch {
      setJsonError('Please fix the JSON syntax in AI Output JSON before saving.');
    }
  };

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#161618] border border-[#C47745] rounded-xl p-6 space-y-5">
      <h3 className="font-display text-lg font-bold text-[#242424] dark:text-[#F8F5ED]">
        {isNew ? 'Create Automation Blueprint' : `Edit Blueprint: ${blueprint.label}`}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Blueprint Title</label>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="e.g. B2B Lead Qualification"
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Stack Summary</label>
          <input
            type="text"
            value={draft.stackSummary}
            onChange={(e) => setDraft({ ...draft, stackSummary: e.target.value })}
            placeholder="Fillout · n8n · OpenAI · HubSpot"
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Execution Latency</label>
          <input
            type="text"
            value={draft.latencyLabel}
            onChange={(e) => setDraft({ ...draft, latencyLabel: e.target.value })}
            placeholder="1.4s end-to-end"
            className="w-full px-3 py-2 text-sm bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] text-[#242424] dark:text-[#F8F5ED] rounded-lg"
          />
        </div>
      </div>

      {/* Stage 01, 02, 03 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage 01 */}
        <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2.5">
          <p className="text-xs font-mono font-semibold text-[#A85D2E] dark:text-[#C5A46D]">
            01 · n8n Orchestration
          </p>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Trigger Source</label>
            <input
              type="text"
              value={draft.triggerSource}
              onChange={(e) => setDraft({ ...draft, triggerSource: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Method / Endpoint</label>
            <input
              type="text"
              value={draft.triggerMethod}
              onChange={(e) => setDraft({ ...draft, triggerMethod: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Sample Inbound Message</label>
            <textarea
              rows={2}
              value={draft.inboundText}
              onChange={(e) => setDraft({ ...draft, inboundText: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Footer Meta</label>
            <input
              type="text"
              value={draft.triggerMeta}
              onChange={(e) => setDraft({ ...draft, triggerMeta: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
        </div>

        {/* Stage 02 */}
        <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2.5">
          <p className="text-xs font-mono font-semibold text-[#A85D2E] dark:text-[#C5A46D]">
            02 · AI Agent Classification
          </p>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Classification Result</label>
            <input
              type="text"
              value={draft.classification}
              onChange={(e) => setDraft({ ...draft, classification: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">AI Model / Agent Role</label>
            <input
              type="text"
              value={draft.aiModel}
              onChange={(e) => setDraft({ ...draft, aiModel: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">AI Output JSON</label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
            {jsonError && <p className="text-[11px] text-[#8F3D13] dark:text-[#E89B6C] mt-1">{jsonError}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Footer Meta</label>
            <input
              type="text"
              value={draft.aiActionMeta}
              onChange={(e) => setDraft({ ...draft, aiActionMeta: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
        </div>

        {/* Stage 03 */}
        <div className="p-4 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2.5">
          <p className="text-xs font-mono font-semibold text-[#A85D2E] dark:text-[#C5A46D]">
            03 · CRM & App Sync
          </p>
          <div>
            <label className="block text-[11px] font-semibold mb-1">CRM / Target System</label>
            <input
              type="text"
              value={draft.crmTarget}
              onChange={(e) => setDraft({ ...draft, crmTarget: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Action Executed</label>
            <textarea
              rows={3}
              value={draft.crmAction}
              onChange={(e) => setDraft({ ...draft, crmAction: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Footer Meta</label>
            <input
              type="text"
              value={draft.crmMeta}
              onChange={(e) => setDraft({ ...draft, crmMeta: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* 6 Safeguards Grid */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D]">
          6 Safeguards &amp; Telemetry Cards
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {draft.features.map((feat, fIdx) => (
            <div
              key={fIdx}
              className="p-3 rounded-xl bg-[#F8F5ED] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={feat.label}
                  onChange={(e) => {
                    const next = [...draft.features];
                    next[fIdx] = { ...feat, label: e.target.value };
                    setDraft({ ...draft, features: next });
                  }}
                  placeholder="Label"
                  className="px-2 py-1 text-xs font-semibold bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-md"
                />
                <input
                  type="text"
                  value={feat.statusTag}
                  onChange={(e) => {
                    const next = [...draft.features];
                    next[fIdx] = { ...feat, statusTag: e.target.value };
                    setDraft({ ...draft, features: next });
                  }}
                  placeholder="Status tag"
                  className="px-2 py-1 text-xs font-mono bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-md"
                />
              </div>
              <input
                type="text"
                value={feat.value}
                onChange={(e) => {
                  const next = [...draft.features];
                  next[fIdx] = { ...feat, value: e.target.value };
                  setDraft({ ...draft, features: next });
                }}
                placeholder="Technical detail"
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-md"
              />
              <select
                value={feat.icon}
                onChange={(e) => {
                  const next = [...draft.features];
                  next[fIdx] = { ...feat, icon: e.target.value as BlueprintFeatureIcon };
                  setDraft({ ...draft, features: next });
                }}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-md"
              >
                <option value="auth">Webhook Auth Icon</option>
                <option value="schema">Schema Guardrail Icon</option>
                <option value="retry">Retry &amp; Fallback Icon</option>
                <option value="sync">Idempotent Sync Icon</option>
                <option value="latency">Execution SLA Icon</option>
                <option value="audit">Audit &amp; Notify Icon</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-[#222226] rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          className="px-5 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg cursor-pointer"
        >
          Save Blueprint
        </button>
      </div>
    </div>
  );
}
