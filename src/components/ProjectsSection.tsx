import { ArrowRight, ArrowUpRight, ExternalLink, PlayCircle, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ProjectItem, SiteContentData } from '../types/portfolio.ts';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  siteContent: SiteContentData;
  isLoading?: boolean;
  externalProjectId: string | null;
  onClearExternalProject: () => void;
  onInquireSimilar: (projectTitle: string) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ResolvedVideoMedia =
  | { kind: 'iframe'; src: string; provider: string }
  | { kind: 'video'; src: string }
  | { kind: 'link'; src: string };

function resolveSafeVideoMedia(rawUrl?: string): ResolvedVideoMedia | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // YouTube
  if (host === 'youtu.be') {
    const id = pathname.replace(/^\/+/, '').split('/')[0];
    if (/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}`, provider: 'YouTube' };
    }
  }
  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
    if (pathname === '/watch') {
      const id = parsed.searchParams.get('v') || '';
      if (/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
        return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}`, provider: 'YouTube' };
      }
    }
    const embedMatch = pathname.match(/^\/(?:embed|shorts)\/([a-zA-Z0-9_-]{6,20})/);
    if (embedMatch?.[1]) {
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${embedMatch[1]}`, provider: 'YouTube' };
    }
  }

  // Loom
  if (host === 'loom.com' || host === 'www.loom.com') {
    const loomMatch = pathname.match(/^\/(?:share|embed)\/([a-zA-Z0-9]{10,48})/);
    if (loomMatch?.[1]) {
      return { kind: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}`, provider: 'Loom' };
    }
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'www.vimeo.com' || host === 'player.vimeo.com') {
    const vimeoMatch = pathname.match(/^\/(?:video\/)?([0-9]{5,15})/);
    if (vimeoMatch?.[1]) {
      return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}`, provider: 'Vimeo' };
    }
  }

  // Direct MP4/WebM/Ogg
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(pathname)) {
    return { kind: 'video', src: parsed.toString() };
  }

  return { kind: 'link', src: parsed.toString() };
}

export function ProjectsSection({
  projects,
  siteContent,
  isLoading = false,
  externalProjectId,
  onClearExternalProject,
  onInquireSimilar,
}: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    if (!externalProjectId) return;
    const match = projects.find((p) => p.id === externalProjectId);
    if (match) {
      setActiveProject(match);
    }
    onClearExternalProject();
  }, [externalProjectId, projects, onClearExternalProject]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ['All', ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCat = selectedCategory === 'All' || project.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.overview.toLowerCase().includes(q) ||
        project.tools.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <section
      id="projects"
      className="bg-[#E8DFD0]/40 dark:bg-[#121214] border-y border-[#E8DFD0] dark:border-[#2A2A2E] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        >
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-2">
              Project Showcase
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] text-balance">
              {siteContent.projectsHeadline}
            </h2>
            <p className="mt-3 text-base text-[#242424]/75 dark:text-[#E8DFD0]/75 leading-relaxed">
              {siteContent.projectsSubtext}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#242424]/50 dark:text-[#E8DFD0]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by tool or keyword..."
              aria-label="Filter projects by tool or keyword"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8F5ED] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED] placeholder:text-[#242424]/45 dark:placeholder:text-[#E8DFD0]/45"
            />
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT_EXPO }}
          className="mt-8 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E8DFD0]/70 dark:bg-[#161618] border border-transparent dark:border-[#2A2A2E] rounded-xl w-fit max-w-full"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#242424] dark:bg-[#C47745] text-[#F8F5ED] dark:text-white shadow-xs'
                  : 'text-[#242424]/75 dark:text-[#E8DFD0]/75 hover:text-[#242424] dark:hover:text-[#F8F5ED] hover:bg-[#F8F5ED]/60 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading projects"
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`proj-skel-${idx}`}
                className="bg-[#F8F5ED] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-6 flex flex-col justify-between animate-pulse motion-reduce:animate-none"
              >
                <div>
                  <div className="mb-4 rounded-lg bg-[#E8DFD0] dark:bg-[#222226] aspect-[16/9]" />
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-3 w-28 rounded bg-[#C5A46D]/35 dark:bg-[#222226]" />
                    <div className="h-3 w-20 rounded bg-[#E8DFD0] dark:bg-[#222226]" />
                  </div>
                  <div className="h-6 w-4/5 rounded-md bg-[#E8DFD0] dark:bg-[#222226] mt-3" />
                  <div className="space-y-2 mt-3">
                    <div className="h-3.5 w-full rounded bg-[#E8DFD0]/75 dark:bg-[#222226]/80" />
                    <div className="h-3.5 w-5/6 rounded bg-[#E8DFD0]/75 dark:bg-[#222226]/80" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E]">
                    <div className="h-3 w-3/4 rounded bg-[#E8DFD0]/70 dark:bg-[#222226]/70" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8DFD0]/70 dark:border-[#2A2A2E]">
                  <div className="h-4 w-32 rounded bg-[#C47745]/35 dark:bg-[#222226]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="mt-10 bg-[#F8F5ED] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-2xl p-10 text-center"
          >
            <p className="font-display text-lg font-semibold text-[#242424] dark:text-[#F8F5ED]">
              No matching automation projects
            </p>
            <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
              Try clearing your search filter or choosing &ldquo;All&rdquo; categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#C47745] rounded-lg hover:bg-[#AE602E] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{
                  duration: 0.48,
                  delay: Math.min((idx % 3) * 0.08, 0.2),
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ y: -4 }}
                className="group bg-[#F8F5ED] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C47745]/70 p-6 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  {project.coverImageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#242424] aspect-[16/9]">
                      <img
                        src={project.coverImageUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  {/* Clean unboxed metadata row */}
                  <div className="flex items-center justify-between gap-2 text-xs text-[#242424]/65 dark:text-[#E8DFD0]/65">
                    <span className="font-medium text-[#A85D2E] dark:text-[#C5A46D] truncate">{project.category}</span>
                    <span className="font-mono tabular-nums shrink-0 text-[#242424]/60 dark:text-[#E8DFD0]/60">
                      {String(idx + 1).padStart(2, '0')} · {project.status}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-3 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 mt-2.5 leading-relaxed">
                    {project.overview}
                  </p>

                  {/* Clean inline tool list with dot separators (zero pills) */}
                  <p className="mt-4 pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E] text-xs font-mono text-[#242424]/70 dark:text-[#E8DFD0]/70 leading-relaxed">
                    {project.tools.join(' · ')}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFD0]/70 dark:border-[#2A2A2E] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#242424] dark:text-[#F8F5ED] hover:text-[#C47745] dark:hover:text-[#C47745] transition-colors cursor-pointer"
                  >
                    Read Case Study
                    <ArrowUpRight className="w-4 h-4 text-[#C47745] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  {resolveSafeVideoMedia(project.videoUrl) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A85D2E] dark:text-[#C5A46D]">
                      <PlayCircle className="w-3.5 h-3.5" />
                      Video Demo
                    </span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Case Study Detail Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#242424]/75 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="bg-[#F8F5ED] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Modal Header */}
              <div className="sticky top-0 z-10 bg-[#F8F5ED]/95 dark:bg-[#161618]/95 backdrop-blur-sm border-b border-[#E8DFD0] dark:border-[#2A2A2E] px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70">
                    <span className="font-semibold text-[#A85D2E] dark:text-[#C5A46D]">{activeProject.category}</span>
                    <span aria-hidden="true" className="text-[#C5A46D]">·</span>
                    <span>{activeProject.status}</span>
                  </div>
                  <h3 id="case-study-title" className="font-display text-2xl sm:text-3xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                    {activeProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  aria-label="Close case study"
                  className="w-10 h-10 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] flex items-center justify-center text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-7">
              {(() => {
                const videoMedia = resolveSafeVideoMedia(activeProject.videoUrl);
                if (!videoMedia) return null;
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] tracking-wide">
                        <PlayCircle className="w-4 h-4" />
                        Workflow Video Walkthrough
                      </h4>
                      {videoMedia.kind === 'iframe' && (
                        <span className="font-mono text-[11px] text-[#242424]/55 dark:text-[#E8DFD0]/55">
                          {videoMedia.provider}
                        </span>
                      )}
                    </div>
                    {videoMedia.kind === 'iframe' && (
                      <div className="rounded-xl overflow-hidden border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#141416] aspect-video">
                        <iframe
                          src={videoMedia.src}
                          title={`${activeProject.title} video walkthrough`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}
                    {videoMedia.kind === 'video' && (
                      <div className="rounded-xl overflow-hidden border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#141416] aspect-video">
                        <video
                          src={videoMedia.src}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    {videoMedia.kind === 'link' && (
                      <a
                        href={videoMedia.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#FFFDF9] dark:bg-[#0D0D0F] hover:border-[#C47745] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5 text-[#C47745] shrink-0" />
                          <span className="text-sm font-medium text-[#242424] dark:text-[#F8F5ED]">
                            Watch Live Workflow Walkthrough
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#C47745] shrink-0" />
                      </a>
                    )}
                  </div>
                );
              })()}

              {(activeProject.coverImageUrl || (activeProject.galleryImages && activeProject.galleryImages.length > 0)) && (
                <div className="space-y-3">
                  {activeProject.coverImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#141416]">
                      <img
                        src={activeProject.coverImageUrl}
                        alt={`${activeProject.title} workflow preview`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  )}
                  {activeProject.galleryImages && activeProject.galleryImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeProject.galleryImages.map((imgUrl, gIdx) => (
                        <div key={imgUrl + gIdx} className="rounded-xl overflow-hidden border border-[#E8DFD0] dark:border-[#2A2A2E] bg-[#242424]">
                          <img
                            src={imgUrl}
                            alt={`${activeProject.title} screenshot ${gIdx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] tracking-wide">Project Overview</h4>
                <p className="text-base text-[#242424]/90 dark:text-[#E8DFD0]/90 mt-2 leading-relaxed">
                  {activeProject.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-5">
                  <h4 className="font-display text-base font-semibold text-[#242424] dark:text-[#F8F5ED]">
                    Business Problem
                  </h4>
                  <p className="text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 mt-2 leading-relaxed">
                    {activeProject.businessProblem}
                  </p>
                </div>

                <div className="bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-5">
                  <h4 className="font-display text-base font-semibold text-[#242424] dark:text-[#F8F5ED]">
                    Solution Implemented
                  </h4>
                  <p className="text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 mt-2 leading-relaxed">
                    {activeProject.solutionImplemented}
                  </p>
                </div>
              </div>

              {/* Workflow Architecture Steps */}
              <div className="bg-[#242424] dark:bg-[#0D0D0F] text-[#F8F5ED] rounded-xl border border-transparent dark:border-[#2A2A2E] p-6">
                <h4 className="font-display text-base font-semibold text-[#F8F5ED]">
                  Workflow Execution Pipeline
                </h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeProject.workflowSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-white/5 border border-white/10 p-3.5 flex items-start gap-3"
                    >
                      <span className="font-mono text-xs font-semibold text-[#C5A46D] tabular-nums shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs sm:text-sm text-[#E8DFD0] leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 pt-4 border-t border-white/10 text-sm text-[#E8DFD0]/85 leading-relaxed">
                  {activeProject.workflowExplanation}
                </p>
              </div>

              {/* Tools & Business Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] tracking-wide">
                    Tools & Technologies
                  </h4>
                  <p className="mt-2 font-mono text-sm text-[#242424] dark:text-[#F8F5ED] leading-relaxed">
                    {activeProject.tools.join(' · ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] tracking-wide">
                    Expected & Achieved Business Value
                  </h4>
                  <p className="mt-2 text-sm text-[#242424]/85 dark:text-[#E8DFD0]/85 leading-relaxed">
                    {activeProject.businessValue}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8DFD0] dark:border-[#2A2A2E] px-6 py-4 bg-[#E8DFD0]/30 dark:bg-[#0D0D0F]/60 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="px-4 py-2.5 text-sm font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = activeProject.title;
                  setActiveProject(null);
                  onInquireSimilar(title);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors cursor-pointer"
              >
                Build a Similar System
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}
