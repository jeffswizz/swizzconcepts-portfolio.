import { CheckCircle2, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { SiteContentData, SkillCategory, SkillProficiency } from '../types/portfolio.ts';

interface SkillsSectionProps {
  skillCategories: SkillCategory[];
  siteContent: SiteContentData;
  isLoading?: boolean;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SkillsSection({
  skillCategories,
  siteContent,
  isLoading = false,
}: SkillsSectionProps) {
  const [filter, setFilter] = useState<'All' | SkillProficiency>('All');

  return (
    <section
      id="skills"
      className="bg-[#F8F5ED] dark:bg-[#0D0D0F] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-2">
              Skills & Technical Stack
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] text-balance">
              {siteContent.skillsHeadline}
            </h2>
            <p className="mt-3 text-base text-[#242424]/75 dark:text-[#E8DFD0]/75 leading-relaxed">
              {siteContent.skillsSubtext}
            </p>
          </div>

          {/* Proficiency Filter Control */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#E8DFD0]/70 dark:bg-[#161618] border border-transparent dark:border-[#2A2A2E] rounded-xl w-fit shrink-0">
            {(['All', 'Practical Experience', 'Learning'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === option
                    ? 'bg-[#242424] dark:bg-[#C47745] text-[#F8F5ED] dark:text-white'
                    : 'text-[#242424]/75 dark:text-[#E8DFD0]/75 hover:text-[#242424] dark:hover:text-[#F8F5ED]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading technical skills"
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`skill-skel-${idx}`}
                className="bg-[#FFFDF9] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-6 animate-pulse motion-reduce:animate-none"
              >
                <div className="pb-3 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                  <div className="h-5 w-2/3 rounded-md bg-[#E8DFD0] dark:bg-[#222226]" />
                </div>
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 4 }).map((__, rowIdx) => (
                    <div key={rowIdx} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-3.5 w-24 rounded bg-[#E8DFD0]/80 dark:bg-[#222226]" />
                        <div className="h-3 w-20 rounded bg-[#E8DFD0]/60 dark:bg-[#222226]/70" />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="h-1 rounded-full bg-[#C47745]/35 dark:bg-[#222226]" />
                        <div className="h-1 rounded-full bg-[#E8DFD0] dark:bg-[#2A2A2E]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, idx) => {
            const visibleItems =
              filter === 'All'
                ? category.items
                : category.items.filter((item) => item.proficiency === filter);

            if (visibleItems.length === 0) return null;

            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.48,
                  delay: Math.min((idx % 4) * 0.08, 0.24),
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ y: -3 }}
                className="bg-[#FFFDF9] dark:bg-[#161618] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C47745]/50 p-6 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-[#242424] dark:text-[#F8F5ED] pb-3 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                    {category.name}
                  </h3>

                  <ul className="mt-4 space-y-3.5">
                    {visibleItems.map((skill) => {
                      const isPractical = skill.proficiency === 'Practical Experience';
                      return (
                        <li key={skill.id} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[#242424] dark:text-[#F8F5ED]">
                              {skill.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                                isPractical
                                  ? 'text-[#A85D2E] dark:text-[#C47745]'
                                  : 'text-[#242424]/65 dark:text-[#E8DFD0]/65'
                              }`}
                            >
                              {isPractical ? (
                                <CheckCircle2 className="w-3 h-3 text-[#C47745]" />
                              ) : (
                                <Compass className="w-3 h-3 text-[#C5A46D]" />
                              )}
                              {skill.proficiency}
                            </span>
                          </div>
                          {/* Clean 2-bar visual level indicator */}
                          <div className="grid grid-cols-2 gap-1" aria-hidden="true">
                            <motion.div
                              initial={{ scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                              style={{ originX: 0 }}
                              className={`h-1 rounded-full ${
                                isPractical ? 'bg-[#C47745]' : 'bg-[#C5A46D]'
                              }`}
                            />
                            <motion.div
                              initial={{ scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT_EXPO }}
                              style={{ originX: 0 }}
                              className={`h-1 rounded-full ${
                                isPractical ? 'bg-[#C47745]' : 'bg-[#E8DFD0] dark:bg-[#2A2A2E]'
                              }`}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
