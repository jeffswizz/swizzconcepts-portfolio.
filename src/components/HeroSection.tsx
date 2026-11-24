import { ArrowRight, Calendar, CheckCircle2, MapPin, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { BlueprintScenario, ProfileData, SiteContentData } from '../types/portfolio.ts';
import { WorkflowIllustration } from './WorkflowIllustration.tsx';

interface HeroSectionProps {
  profile: ProfileData;
  siteContent: SiteContentData;
  blueprints: BlueprintScenario[];
  onExploreProjects: () => void;
  onWorkTogether: () => void;
  onBookCallFallback: () => void;
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

export function HeroSection({
  profile,
  siteContent,
  blueprints,
  onExploreProjects,
  onWorkTogether,
  onBookCallFallback,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);
  const hasBookingLink = isSafeExternalUrl(profile.bookingUrl);
  const bookingLabel = profile.bookingButtonLabel || 'Book a Discovery Call';

  return (
    <section
      id="top"
      className="bg-[#F8F5ED] dark:bg-[#0D0D0F] pt-10 pb-16 sm:pt-14 sm:pb-24 transition-colors duration-200 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split-Screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="lg:col-span-7 flex flex-col justify-between py-2"
          >
            <div>
              {/* Quiet unboxed availability & location metadata */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#242424]/80 dark:text-[#E8DFD0]/80 mb-5">
                {profile.isAvailable && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#242424] dark:text-[#F8F5ED]">
                    <CheckCircle2 className="w-4 h-4 text-[#C47745]" />
                    {profile.availabilityText}
                  </span>
                )}
                {profile.isAvailable && <span aria-hidden="true" className="text-[#C5A46D]">·</span>}
                <span className="inline-flex items-center gap-1.5 text-[#242424]/75 dark:text-[#E8DFD0]/75">
                  <MapPin className="w-4 h-4 text-[#C5A46D]" />
                  {profile.location}
                </span>
              </div>

              {/* Role Labels */}
              <p className="text-xs sm:text-sm font-medium text-[#A85D2E] dark:text-[#C5A46D] tracking-wide mb-3">
                {profile.roleLabels.join(' · ')}
              </p>

              {/* Strong Headline */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-[#242424] dark:text-[#F8F5ED] leading-[1.1] text-balance max-w-2xl">
                {siteContent.heroHeadline}
              </h1>

              {/* Supporting Introduction */}
              <p className="mt-5 text-base sm:text-lg text-[#242424]/80 dark:text-[#E8DFD0]/80 leading-relaxed max-w-2xl">
                {siteContent.heroSupportingText}
              </p>

              {/* Primary, Discovery Call & Secondary CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onExploreProjects}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#C47745] hover:bg-[#AE602E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#242424] dark:focus-visible:outline-[#F8F5ED]"
                >
                  Explore My Projects
                  <ArrowRight className="w-4 h-4" />
                </button>

                {hasBookingLink ? (
                  <a
                    href={profile.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#242424] dark:text-[#F8F5ED] bg-[#FFFDF9] dark:bg-[#161618] hover:border-[#C47745] border border-[#C5A46D]/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C47745]"
                  >
                    <Calendar className="w-4 h-4 text-[#C47745]" />
                    {bookingLabel}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onBookCallFallback}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#242424] dark:text-[#F8F5ED] bg-[#FFFDF9] dark:bg-[#161618] hover:border-[#C47745] border border-[#C5A46D]/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C47745]"
                  >
                    <Calendar className="w-4 h-4 text-[#C47745]" />
                    {bookingLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onWorkTogether}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#242424] dark:text-[#F8F5ED] bg-[#E8DFD0]/70 dark:bg-[#161618] hover:bg-[#E8DFD0] dark:hover:bg-[#222226] border border-[#242424]/15 dark:border-[#2A2A2E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C47745]"
                >
                  Let's Work Together
                </button>
              </div>
            </div>

            {/* Identity Anchor Footer within Left Column */}
            <div className="mt-10 pt-6 border-t border-[#E8DFD0] dark:border-[#2A2A2E] flex flex-wrap items-center justify-between gap-4 text-sm text-[#242424]/75 dark:text-[#E8DFD0]/75">
              <div>
                <span className="font-display font-semibold text-[#242424] dark:text-[#F8F5ED]">{profile.fullName}</span>
                <span className="mx-2 text-[#C5A46D]" aria-hidden="true">·</span>
                <span>{profile.title}</span>
              </div>
              <span className="font-mono text-xs text-[#242424]/65 dark:text-[#E8DFD0]/65">
                {profile.brandName}
              </span>
            </div>
          </motion.div>

          {/* Right Column: Editorial Portrait Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO }}
            className="lg:col-span-5 flex"
          >
            <div className="relative w-full rounded-2xl overflow-hidden bg-[#242424] border border-[#E8DFD0] dark:border-[#2A2A2E] min-h-[380px] lg:min-h-[480px] flex flex-col justify-end">
              {!imgError && profile.portraitUrl ? (
                <img
                  src={profile.portraitUrl}
                  alt={`${profile.fullName} — ${profile.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#242424] via-[#2F2A24] to-[#1A1A1A] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#C47745]/20 border border-[#C5A46D]/40 flex items-center justify-center mb-4">
                    <User className="w-9 h-9 text-[#C5A46D]" />
                  </div>
                  <p className="font-display text-lg font-semibold text-[#F8F5ED]">{profile.fullName}</p>
                  <p className="text-sm text-[#E8DFD0]/75 mt-1">{profile.title}</p>
                </div>
              )}

              {/* Measured Scrim for legible caption overlay */}
              <div className="relative z-10 bg-gradient-to-t from-[#242424]/95 via-[#242424]/65 to-transparent pt-20 pb-5 px-6">
                <p className="font-display text-lg font-semibold text-[#F8F5ED]">
                  {profile.fullName}
                </p>
                <p className="text-xs sm:text-sm text-[#E8DFD0]/90 mt-0.5">
                  {profile.title} · {profile.brandName}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Interactive Workflow Architecture Band Below Hero Split */}
        <div className="mt-12 sm:mt-16">
          <WorkflowIllustration blueprints={blueprints} />
        </div>
      </div>
    </section>
  );
}
