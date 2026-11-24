import { Calendar, Check, Copy, ExternalLink, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { ProfileData, ServiceItem, SiteContentData } from '../types/portfolio.ts';

interface ContactSectionProps {
  profile: ProfileData;
  siteContent: SiteContentData;
  services: ServiceItem[];
  preselectedService: string;
  prefilledProjectNote: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

function isSafeExternalUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function ContactSection({
  profile,
  siteContent,
  services,
  preselectedService,
  prefilledProjectNote,
}: ContactSectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState(services[0]?.title || 'Workflow Automation');
  const [projectDescription, setProjectDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setServiceOfInterest(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (prefilledProjectNote) {
      setProjectDescription((prev) =>
        prev.trim()
          ? prev
          : `I am interested in building an automation system similar to: ${prefilledProjectNote}.`
      );
    }
  }, [prefilledProjectNote]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (projectDescription.trim().length < 15) {
      setErrorMsg('Please provide at least a brief 15-character description of your workflow or project.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          company: company.trim(),
          serviceOfInterest,
          projectDescription: projectDescription.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Unable to submit your message right now. Please try again.');
        return;
      }

      setSuccessMsg(
        'Your inquiry has been received securely. I will review your workflow requirements and reply shortly.'
      );
      setFullName('');
      setEmail('');
      setCompany('');
      setProjectDescription('');
    } catch {
      setErrorMsg('Network error while sending your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      className="bg-[#242424] dark:bg-[#09090B] text-[#F8F5ED] pt-16 sm:pt-24 pb-10 border-t border-transparent dark:border-[#2A2A2E] transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="lg:col-span-5"
          >
            <p className="text-xs sm:text-sm font-medium text-[#C5A46D] tracking-wide mb-2">
              Contact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F8F5ED] text-balance">
              {siteContent.contactHeadline}
            </h2>
            <p className="mt-4 text-base text-[#E8DFD0]/85 leading-relaxed">
              {siteContent.contactSubtext}
            </p>

            <div className="mt-8 space-y-4">
              {/* Discovery Call Booking */}
              {isSafeExternalUrl(profile.bookingUrl) ? (
                <a
                  href={profile.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#C47745]/15 hover:bg-[#C47745]/25 border border-[#C47745]/50 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#C47745] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#C5A46D] font-medium">Schedule Live Session</p>
                      <p className="text-sm font-semibold text-[#F8F5ED] truncate">
                        {profile.bookingButtonLabel || 'Book a Discovery Call'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#C5A46D] shrink-0" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setServiceOfInterest('Discovery Call / Automation Audit');
                    const input = document.getElementById('contact-name');
                    input?.focus();
                  }}
                  className="w-full text-left bg-[#C47745]/15 hover:bg-[#C47745]/25 border border-[#C47745]/50 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#C47745] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#C5A46D] font-medium">Schedule Live Session</p>
                      <p className="text-sm font-semibold text-[#F8F5ED] truncate">
                        {profile.bookingButtonLabel || 'Book a Discovery Call'}
                      </p>
                    </div>
                  </div>
                  <Send className="w-4 h-4 text-[#C5A46D] shrink-0" />
                </button>
              )}

              {/* Email */}
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#C47745]/20 border border-[#C47745]/40 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#C47745]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#E8DFD0]/65">Email</p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm font-medium text-[#F8F5ED] hover:text-[#C5A46D] truncate block transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyEmail()}
                  aria-label="Copy email address"
                  className="p-2 rounded-lg border border-white/10 text-[#E8DFD0] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-[#C5A46D]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={profile.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#C5A46D]/15 border border-[#C5A46D]/35 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#C5A46D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#E8DFD0]/65">WhatsApp</p>
                    <p className="text-sm font-medium text-[#F8F5ED] truncate">{profile.whatsappDisplay}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#E8DFD0]/60 shrink-0" />
              </a>

              {/* LinkedIn */}
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#C5A46D]/15 border border-[#C5A46D]/35 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-[#C5A46D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#E8DFD0]/65">LinkedIn</p>
                    <p className="text-sm font-medium text-[#F8F5ED] truncate">{profile.linkedinHandle}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#E8DFD0]/60 shrink-0" />
              </a>

              {/* Location */}
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#C5A46D]" />
                </div>
                <div>
                  <p className="text-xs text-[#E8DFD0]/65">Location</p>
                  <p className="text-sm font-medium text-[#F8F5ED]">{profile.location}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Validated Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_OUT_EXPO }}
            className="lg:col-span-7 bg-[#F8F5ED] dark:bg-[#161618] text-[#242424] dark:text-[#F8F5ED] rounded-2xl border border-[#E8DFD0] dark:border-[#2A2A2E] p-6 sm:p-8"
          >
            <h3 className="font-display text-xl font-bold text-[#242424] dark:text-[#F8F5ED]">
              {siteContent.contactFormTitle}
            </h3>
            <p className="text-sm text-[#242424]/70 dark:text-[#E8DFD0]/70 mt-1">
              {siteContent.contactFormSubtext}
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} noValidate className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                    Full Name <span className="text-[#C47745]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adaeze Okafor"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF9] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                    Email Address <span className="text-[#C47745]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF9] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-company" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                    Company Name <span className="text-[#242424]/50 dark:text-[#E8DFD0]/50 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Operations Ltd"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF9] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-service" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                    Service of Interest <span className="text-[#C47745]">*</span>
                  </label>
                  <select
                    id="contact-service"
                    value={serviceOfInterest}
                    onChange={(e) => setServiceOfInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF9] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED]"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.title}>
                        {srv.title}
                      </option>
                    ))}
                    <option value="Discovery Call / Automation Audit">Discovery Call / Automation Audit</option>
                    <option value="Custom Automation Architecture">Custom Automation Architecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-desc" className="block text-xs font-semibold text-[#242424] dark:text-[#F8F5ED] mb-1.5">
                  Project Description <span className="text-[#C47745]">*</span>
                </label>
                <textarea
                  id="contact-desc"
                  rows={4}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe the applications you want to connect, repetitive tasks to automate, or AI workflow you need..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFDF9] dark:bg-[#0D0D0F] border border-[#E8DFD0] dark:border-[#2A2A2E] focus:border-[#C47745] focus:outline-none rounded-lg text-[#242424] dark:text-[#F8F5ED] resize-y"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-[#C47745]/10 border border-[#C47745]/40 text-sm text-[#8F3D13] font-medium"
                >
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="p-3.5 rounded-lg bg-[#242424] text-[#F8F5ED] text-sm font-medium flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting Inquiry...' : 'Send Project Inquiry'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Clean Minimal Footer — Strictly NO Admin links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8DFD0]/70">
          <p>
            &copy; {new Date().getFullYear()} {profile.brandName}. {siteContent.footerTagline}.
          </p>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-[#F8F5ED] transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-[#F8F5ED] transition-colors">
              Services
            </a>
            <a href="#projects" className="hover:text-[#F8F5ED] transition-colors">
              Projects
            </a>
            <a href="#skills" className="hover:text-[#F8F5ED] transition-colors">
              Skills
            </a>
            <a href="#faq" className="hover:text-[#F8F5ED] transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
