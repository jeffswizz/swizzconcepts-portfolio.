import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Cpu,
  DatabaseZap,
  MessageSquareText,
  Plug,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ServiceItem, SiteContentData } from '../types/portfolio.ts';

interface ServicesSectionProps {
  services: ServiceItem[];
  siteContent: SiteContentData;
  isLoading?: boolean;
  onSelectServiceForContact: (serviceTitle: string) => void;
}

const ICON_MAP: Record<string, typeof Workflow> = {
  Workflow,
  Bot,
  Cpu,
  Users,
  Plug,
  MessageSquareText,
  DatabaseZap,
  BookOpenCheck,
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ServicesSection({
  services,
  siteContent,
  isLoading = false,
  onSelectServiceForContact,
}: ServicesSectionProps) {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);

  return (
    <section id="services" className="bg-[#F8F5ED] dark:bg-[#0D0D0F] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        >
          <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-2">
            Services
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] text-balance">
            {siteContent.servicesHeadline}
          </h2>
          <p className="mt-3 text-base text-[#242424]/75 dark:text-[#E8DFD0]/75 leading-relaxed">
            {siteContent.servicesSubtext}
          </p>
        </motion.div>

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading services"
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`srv-skel-${idx}`}
                className="bg-[#FFFDF9] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-6 flex flex-col justify-between animate-pulse motion-reduce:animate-none"
              >
                <div>
                  <div className="w-11 h-11 rounded-lg bg-[#E8DFD0] dark:bg-[#222226]" />
                  <div className="h-5 w-3/4 rounded-md bg-[#E8DFD0] dark:bg-[#222226] mt-5" />
                  <div className="space-y-2 mt-3">
                    <div className="h-3.5 w-full rounded bg-[#E8DFD0]/75 dark:bg-[#222226]/80" />
                    <div className="h-3.5 w-5/6 rounded bg-[#E8DFD0]/75 dark:bg-[#222226]/80" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2.5">
                    <div className="h-3 w-11/12 rounded bg-[#E8DFD0]/70 dark:bg-[#222226]/70" />
                    <div className="h-3 w-4/5 rounded bg-[#E8DFD0]/70 dark:bg-[#222226]/70" />
                    <div className="h-3 w-5/6 rounded bg-[#E8DFD0]/70 dark:bg-[#222226]/70" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8DFD0]/70 dark:border-[#2A2A2E]">
                  <div className="h-3.5 w-24 rounded bg-[#C5A46D]/35 dark:bg-[#222226]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => {
              const IconComponent = ICON_MAP[service.icon] ?? Workflow;
              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min((idx % 4) * 0.08, 0.24),
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{ y: -4 }}
                  className="group bg-[#FFFDF9] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C47745]/60 p-6 flex flex-col justify-between transition-colors duration-200"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-[#E8DFD0]/70 dark:bg-[#222226] border border-[#C5A46D]/30 flex items-center justify-center text-[#242424] dark:text-[#F8F5ED] group-hover:bg-[#C47745] group-hover:text-white group-hover:border-[#C47745] transition-colors duration-200">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#242424] dark:text-[#F8F5ED] mt-5">
                      {service.title}
                    </h3>

                    <p className="text-sm text-[#242424]/75 dark:text-[#E8DFD0]/75 mt-2 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    <ul className="mt-4 pt-4 border-t border-[#E8DFD0] dark:border-[#2A2A2E] space-y-2">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="text-xs text-[#242424]/80 dark:text-[#E8DFD0]/80 leading-relaxed flex items-start gap-2">
                          <span className="text-[#C5A46D] font-bold mt-0.5" aria-hidden="true">·</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E8DFD0]/70 dark:border-[#2A2A2E] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveService(service)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] hover:text-[#242424] dark:hover:text-[#F8F5ED] transition-colors cursor-pointer"
                    >
                      How It Works
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* How It Works Modal */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#242424]/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={() => setActiveService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="bg-[#F8F5ED] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                <div>
                  <p className="text-xs font-medium text-[#A85D2E] dark:text-[#C5A46D]">Service Architecture</p>
                  <h3 id="service-modal-title" className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                    {activeService.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveService(null)}
                  aria-label="Close service details"
                  className="w-10 h-10 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] flex items-center justify-center text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-4">
                  <p className="font-mono text-xs text-[#C5A46D] font-semibold">01 · Trigger</p>
                  <p className="text-sm text-[#242424] dark:text-[#F8F5ED] mt-1">{activeService.howItWorks.trigger}</p>
                </div>
                <div className="bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-4">
                  <p className="font-mono text-xs text-[#C47745] font-semibold">02 · Processing & Logic</p>
                  <p className="text-sm text-[#242424] dark:text-[#F8F5ED] mt-1">{activeService.howItWorks.processing}</p>
                </div>
                <div className="bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-4">
                  <p className="font-mono text-xs text-[#242424]/70 dark:text-[#E8DFD0]/70 font-semibold">03 · Output & Sync</p>
                  <p className="text-sm text-[#242424] dark:text-[#F8F5ED] mt-1">{activeService.howItWorks.output}</p>
                </div>
                <p className="text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 pt-2 leading-relaxed">
                  {activeService.howItWorks.summary}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#E8DFD0] dark:border-[#2A2A2E] flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveService(null)}
                  className="px-4 py-2.5 text-sm font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0]/70 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const title = activeService.title;
                    setActiveService(null);
                    onSelectServiceForContact(title);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors cursor-pointer"
                >
                  Discuss This Service
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
