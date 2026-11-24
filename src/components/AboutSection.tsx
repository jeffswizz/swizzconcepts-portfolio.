import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { CareerMilestone, SiteContentData } from '../types/portfolio.ts';

interface AboutSectionProps {
  siteContent: SiteContentData;
  timeline: CareerMilestone[];
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AboutSection({ siteContent, timeline }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="bg-[#E8DFD0]/45 dark:bg-[#121214] border-y border-[#E8DFD0] dark:border-[#2A2A2E] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Biography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="lg:col-span-7"
          >
            <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-3">
              About Me
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] leading-[1.18] text-balance">
              {siteContent.aboutHeadline}
            </h2>

            <div className="mt-6 space-y-4 text-base text-[#242424]/85 dark:text-[#E8DFD0]/85 leading-relaxed max-w-2xl">
              {siteContent.aboutBioParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </motion.div>

          {/* Core Capabilities Summary Box */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_OUT_EXPO }}
            className="lg:col-span-5 bg-[#F8F5ED] dark:bg-[#161618] rounded-2xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-6 sm:p-8"
          >
            <h3 className="font-display text-lg font-semibold text-[#242424] dark:text-[#F8F5ED]">
              {siteContent.aboutPillarsTitle}
            </h3>
            <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
              {siteContent.aboutPillarsSubtitle}
            </p>
            <ul className="mt-5 space-y-3">
              {siteContent.aboutPillars.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#242424]/90 dark:text-[#E8DFD0]/90">
                  <span className="mt-0.5 w-5 h-5 rounded-md bg-[#C47745]/15 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#A85D2E] dark:text-[#C47745]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Visual Career Journey Timeline */}
        <div className="mt-16 pt-12 border-t border-[#242424]/10 dark:border-[#2A2A2E]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide">
                Career Journey
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-1">
                {siteContent.timelineHeadline}
              </h3>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.48,
                  delay: Math.min((index % 4) * 0.08, 0.24),
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ y: -3 }}
                className="relative bg-[#F8F5ED] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C47745]/50 p-6 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-sm font-semibold text-[#C5A46D] tabular-nums">
                      {step.stepNumber}
                    </span>
                    {index < timeline.length - 1 && (
                      <span className="hidden lg:block h-px flex-1 bg-[#E8DFD0] dark:bg-[#2A2A2E] ml-3" aria-hidden="true" />
                    )}
                  </div>
                  <h4 className="font-display text-lg font-semibold text-[#242424] dark:text-[#F8F5ED]">
                    {step.title}
                  </h4>
                  {step.subtitle && (
                    <p className="text-xs font-medium text-[#A85D2E] dark:text-[#C47745] mt-1">
                      {step.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
