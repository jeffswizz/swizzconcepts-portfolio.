import { MotionConfig } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { CredentialsSection } from './components/CredentialsSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { ProjectsSection } from './components/ProjectsSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { SkillsSection } from './components/SkillsSection.tsx';
import { DEFAULT_PORTFOLIO_DATA } from './data/defaultPortfolio.ts';
import { PortfolioData } from './types/portfolio.ts';

export type ThemeMode = 'light' | 'dark';

function isAdminLocation(): boolean {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/') ||
    params.has('admin') ||
    hash === 'admin' ||
    hash.startsWith('admin/')
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => isAdminLocation());
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = window.localStorage.getItem('swizz_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [preselectedService, setPreselectedService] = useState<string>('');
  const [prefilledProjectNote, setPrefilledProjectNote] = useState<string>('');
  const [externalProjectId, setExternalProjectId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('swizz_theme', theme);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const fetchPortfolio = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoadingPortfolio(true);
    }
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = (await res.json()) as PortfolioData;
        setPortfolio(data);
      }
    } catch {
      // Fall back gracefully to bundled default portfolio
    } finally {
      if (showSkeleton) {
        setIsLoadingPortfolio(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPortfolio(true);
  }, [fetchPortfolio]);

  useEffect(() => {
    const syncRoute = () => {
      setIsAdminRoute(isAdminLocation());
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminRoute) {
    return (
      <MotionConfig reducedMotion="user">
        <AdminDashboard
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigateHome={navigateHome}
          onPortfolioMutated={() => void fetchPortfolio()}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#0D0D0F] text-[#242424] dark:text-[#F8F5ED] transition-colors duration-200">
      <Navbar
        brandName={portfolio.profile.brandName}
        theme={theme}
        onToggleTheme={toggleTheme}
        onContactClick={() => scrollToSection('contact')}
      />

      <main>
        <HeroSection
          profile={portfolio.profile}
          siteContent={portfolio.siteContent}
          blueprints={portfolio.blueprints}
          onExploreProjects={() => scrollToSection('projects')}
          onWorkTogether={() => scrollToSection('contact')}
          onBookCallFallback={() => {
            setPreselectedService('Discovery Call / Automation Audit');
            scrollToSection('contact');
          }}
        />

        <AboutSection
          siteContent={portfolio.siteContent}
          timeline={portfolio.timeline}
        />

        <ServicesSection
          services={portfolio.services}
          siteContent={portfolio.siteContent}
          isLoading={isLoadingPortfolio}
          onSelectServiceForContact={(serviceTitle) => {
            setPreselectedService(serviceTitle);
            scrollToSection('contact');
          }}
        />

        <ProjectsSection
          projects={portfolio.projects}
          siteContent={portfolio.siteContent}
          isLoading={isLoadingPortfolio}
          externalProjectId={externalProjectId}
          onClearExternalProject={() => setExternalProjectId(null)}
          onInquireSimilar={(projectTitle) => {
            setPrefilledProjectNote(projectTitle);
            scrollToSection('contact');
          }}
        />

        <SkillsSection
          skillCategories={portfolio.skillCategories}
          siteContent={portfolio.siteContent}
          isLoading={isLoadingPortfolio}
        />

        <CredentialsSection
          credentials={portfolio.credentials}
          projects={portfolio.projects}
          siteContent={portfolio.siteContent}
          recipientName={portfolio.profile.fullName}
          brandName={portfolio.profile.brandName}
          onOpenProject={(projectId) => {
            setExternalProjectId(projectId);
            scrollToSection('projects');
          }}
        />

        <FaqSection
          faqs={portfolio.faqs}
          siteContent={portfolio.siteContent}
        />
      </main>

        <ContactSection
          profile={portfolio.profile}
          siteContent={portfolio.siteContent}
          services={portfolio.services}
          preselectedService={preselectedService}
          prefilledProjectNote={prefilledProjectNote}
        />
      </div>
    </MotionConfig>
  );
}
