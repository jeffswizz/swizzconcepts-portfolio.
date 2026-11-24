import { ChevronDown, HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { FaqItem, SiteContentData } from '../types/portfolio.ts';

interface FaqSectionProps {
  faqs: FaqItem[];
  siteContent: SiteContentData;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FaqSection({ faqs, siteContent }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      id="faq"
      className="bg-[#F8F5ED] dark:bg-[#0D0D0F] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          className="max-w-2xl"
        >
          <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] text-balance">
            {siteContent.faqHeadline}
          </h2>
          <p className="mt-3 text-base text-[#242424]/75 dark:text-[#E8DFD0]/75 leading-relaxed">
            {siteContent.faqSubtext}
          </p>
        </motion.div>

        <div className="mt-10 space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: Math.min(idx * 0.05, 0.25),
                  ease: EASE_OUT_EXPO,
                }}
                className={`rounded-xl border transition-colors duration-200 ${
                  isOpen
                    ? 'bg-[#FFFDF9] dark:bg-[#161618] border-[#C47745]/60 shadow-xs'
                    : 'bg-[#FFFDF9] dark:bg-[#161618] border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C5A46D]/60'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#C5A46D] mt-1 shrink-0 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-base sm:text-lg font-semibold text-[#242424] dark:text-[#F8F5ED] leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C47745] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 sm:pl-14 border-t border-[#E8DFD0]/70 dark:border-[#2A2A2E]/80 text-sm sm:text-base text-[#242424]/80 dark:text-[#E8DFD0]/80 leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
