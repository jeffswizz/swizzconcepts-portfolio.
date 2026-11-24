import { ArrowUpRight, Award, Briefcase, Check, Download, Eye, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CredentialItem, ProjectItem, SiteContentData } from '../types/portfolio.ts';
import { CertificateDocument, downloadCredentialCertificate } from './CertificateDocument.tsx';

interface CredentialsSectionProps {
  credentials: CredentialItem[];
  projects: ProjectItem[];
  siteContent: SiteContentData;
  recipientName: string;
  brandName: string;
  onOpenProject: (projectId: string) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CredentialsSection({
  credentials,
  projects,
  siteContent,
  recipientName,
  brandName,
  onOpenProject,
}: CredentialsSectionProps) {
  const [viewingCred, setViewingCred] = useState<CredentialItem | null>(null);

  return (
    <section
      id="experience"
      className="bg-[#E8DFD0]/45 dark:bg-[#121214] border-y border-[#E8DFD0] dark:border-[#2A2A2E] py-16 sm:py-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          className="max-w-2xl"
        >
          <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-2">
            Training & Practical Experience
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] text-balance">
            {siteContent.credentialsHeadline}
          </h2>
          <p className="mt-3 text-base text-[#242424]/75 dark:text-[#E8DFD0]/75 leading-relaxed">
            {siteContent.credentialsSubtext}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {credentials.map((cred, idx) => {
            const linkedProjects = projects.filter((p) => cred.linkedProjectIds.includes(p.id));
            const isInternship = idx > 0 || cred.organization.toLowerCase().includes('big brains');

            return (
              <motion.article
                key={cred.id}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min((idx % 2) * 0.1, 0.2),
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ y: -4 }}
                className="bg-[#F8F5ED] dark:bg-[#161618] rounded-2xl border border-[#E8DFD0] dark:border-[#2A2A2E] hover:border-[#C47745]/50 p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#A85D2E] dark:text-[#C5A46D]">
                        {isInternship ? (
                          <Briefcase className="w-4 h-4 text-[#C47745]" />
                        ) : (
                          <Award className="w-4 h-4 text-[#C5A46D]" />
                        )}
                        <span>{cred.organization}</span>
                        <span aria-hidden="true" className="text-[#C5A46D]">·</span>
                        <span className="text-[#242424]/65 dark:text-[#E8DFD0]/65">{cred.period}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-2">
                        {cred.roleTitle}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#242424]/80 dark:text-[#E8DFD0]/80 mt-5 leading-relaxed">
                    {cred.summary}
                  </p>

                  {/* Highlights */}
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-[#242424]/65 dark:text-[#E8DFD0]/65 tracking-wide mb-3">
                      Key Areas Covered
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cred.highlights.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-[#242424]/85 dark:text-[#E8DFD0]/85">
                          <Check className="w-4 h-4 text-[#C47745] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificate Preview Card */}
                  <div className="mt-6 bg-[#FFFDF9] dark:bg-[#0D0D0F] rounded-xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-mono text-[#A85D2E] dark:text-[#C5A46D]">{cred.certificateId}</p>
                      <p className="font-display text-sm font-semibold text-[#242424] dark:text-[#F8F5ED] mt-0.5">
                        {cred.certificateTitle}
                      </p>
                      <p className="text-xs text-[#242424]/65 dark:text-[#E8DFD0]/65 mt-0.5">{cred.issuedDate}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingCred(cred)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] bg-[#E8DFD0]/70 dark:bg-[#222226] hover:bg-[#E8DFD0] dark:hover:bg-[#2C2C32] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadCredentialCertificate(cred, recipientName, brandName)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Linked Project Showcase Links */}
                {linkedProjects.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[#E8DFD0] dark:border-[#2A2A2E]">
                    <p className="text-xs font-semibold text-[#242424]/65 dark:text-[#E8DFD0]/65 mb-2.5">
                      Related Project Showcase
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {linkedProjects.map((proj) => (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => onOpenProject(proj.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#A85D2E] dark:text-[#C5A46D] hover:text-[#242424] dark:hover:text-[#F8F5ED] transition-colors cursor-pointer"
                        >
                          {proj.title}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      <AnimatePresence>
        {viewingCred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#242424]/80 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
            onClick={() => setViewingCred(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="bg-[#F8F5ED] dark:bg-[#161618] border border-[#E8DFD0] dark:border-[#2A2A2E] rounded-2xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b border-[#E8DFD0] dark:border-[#2A2A2E]">
                <div>
                  <p className="text-xs font-medium text-[#A85D2E] dark:text-[#C5A46D]">{viewingCred.organization}</p>
                  <h3 id="cert-modal-title" className="font-display text-xl font-bold text-[#242424] dark:text-[#F8F5ED] mt-0.5">
                    {viewingCred.certificateTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCred(null)}
                  aria-label="Close certificate preview"
                  className="w-10 h-10 rounded-lg border border-[#E8DFD0] dark:border-[#2A2A2E] flex items-center justify-center text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <CertificateDocument
                credential={viewingCred}
                recipientName={recipientName}
                brandName={brandName}
              />

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewingCred(null)}
                  className="px-4 py-2.5 text-sm font-medium text-[#242424] dark:text-[#F8F5ED] hover:bg-[#E8DFD0] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void downloadCredentialCertificate(viewingCred, recipientName, brandName)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
