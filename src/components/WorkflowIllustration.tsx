import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileCheck2,
  KeyRound,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Workflow,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DEFAULT_PORTFOLIO_DATA } from '../data/defaultPortfolio.ts';
import { BlueprintFeatureIcon, BlueprintScenario } from '../types/portfolio.ts';

interface WorkflowIllustrationProps {
  blueprints?: BlueprintScenario[];
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

function FeatureIcon({ type, active }: { type: BlueprintFeatureIcon; active?: boolean }) {
  const cls = `w-3.5 h-3.5 shrink-0 transition-colors ${
    active ? 'text-[#C47745]' : 'text-[#C5A46D]'
  }`;
  switch (type) {
    case 'auth':
      return <KeyRound className={cls} />;
    case 'schema':
      return <FileCheck2 className={cls} />;
    case 'retry':
      return <ShieldAlert className={cls} />;
    case 'sync':
      return <RefreshCw className={cls} />;
    case 'latency':
      return <Activity className={cls} />;
    case 'audit':
      return <CheckCircle2 className={cls} />;
  }
}

export function WorkflowIllustration({ blueprints }: WorkflowIllustrationProps) {
  const items =
    blueprints && blueprints.length > 0 ? blueprints : DEFAULT_PORTFOLIO_DATA.blueprints;

  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  const safeIdx = scenarioIdx < items.length ? scenarioIdx : 0;
  const scenario = items[safeIdx] ?? items[0];
  const featureCount = scenario.features.length;
  const totalFlowSteps = 4 + featureCount; // 0: Blueprint, 1..3: Pipeline stages, 4..: Safeguards

  useEffect(() => {
    if (scenarioIdx >= items.length) {
      setScenarioIdx(0);
      setActiveStep(0);
    }
  }, [items.length, scenarioIdx]);

  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setTimeout(() => {
      if (activeStep + 1 >= totalFlowSteps) {
        setScenarioIdx((sIdx) => (sIdx + 1) % items.length);
        setActiveStep(0);
      } else {
        setActiveStep(activeStep + 1);
      }
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [autoAdvance, activeStep, safeIdx, items.length, totalFlowSteps]);

  const handleStepThrough = () => {
    setActiveStep(0);
    setAutoAdvance(true);
  };

  const handleSelectScenario = (idx: number) => {
    setScenarioIdx(idx);
    setActiveStep(0);
    setAutoAdvance(true);
  };

  const handleSelectStep = (stepIndex: number) => {
    setAutoAdvance(false);
    setActiveStep(stepIndex);
  };

  const phaseMarkers = [
    { label: '01. Blueprint', targetStep: 0, activeRange: [0, 0] as const },
    { label: '02. n8n Trigger', targetStep: 1, activeRange: [1, 1] as const },
    { label: '03. AI Classification', targetStep: 2, activeRange: [2, 2] as const },
    { label: '04. CRM Sync', targetStep: 3, activeRange: [3, 3] as const },
    {
      label: '05. Safeguards to Audit & Notify',
      targetStep: 4,
      activeRange: [4, Math.max(4, totalFlowSteps - 1)] as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className="bg-[#242424] dark:bg-[#141416] text-[#F8F5ED] rounded-2xl border border-[#C5A46D]/25 dark:border-[#2A2A2E] p-5 sm:p-8 shadow-sm"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#C5A46D] tracking-wide">
            <span>Interactive Automation Architecture</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span className="font-mono text-[#E8DFD0]/70">{scenario.stackSummary}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#F8F5ED] mt-1">
            n8n Orchestration · AI Agent Classification · CRM Record Updates
          </h2>
        </div>

        <button
          type="button"
          onClick={handleStepThrough}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#C5A46D]/50 text-[#F8F5ED] hover:bg-[#C5A46D]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C5A46D]" />
          Step Through Flow
        </button>
      </div>

      {/* Section 1: Blueprint Cards in Grid View */}
      <div className="pt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8DFD0]/60">
            01 · Select Automation Blueprint ({safeIdx + 1} / {items.length})
          </span>
          <span className="font-mono text-xs text-[#C5A46D] tabular-nums">
            Step {String(activeStep + 1).padStart(2, '0')} / {totalFlowSteps} · {scenario.latencyLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {items.map((item, idx) => {
            const isSelected = safeIdx === idx;
            const isStepActive = isSelected && activeStep === 0;
            const isCompleted = isSelected && activeStep > 0;
            return (
              <motion.button
                key={item.id}
                type="button"
                animate={{ scale: isStepActive ? 1.015 : 1 }}
                transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                whileHover={{ y: -2 }}
                onClick={() => handleSelectScenario(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isStepActive
                    ? 'bg-[#C47745]/25 border-[#C47745] ring-1 ring-[#C47745]/50 shadow-md'
                    : isCompleted
                      ? 'bg-[#C47745]/12 border-[#C5A46D]/60 text-[#F8F5ED]'
                      : 'bg-white/[0.03] border-white/10 text-[#E8DFD0]/80 hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isSelected ? 'text-[#C5A46D]' : 'text-[#C5A46D]/70'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {isStepActive ? (
                    <span className="text-[11px] font-mono font-semibold text-[#C47745]">
                      Active
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C5A46D]">
                      <CheckCircle2 className="w-3 h-3" />
                      Selected
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[#E8DFD0]/55 tabular-nums">
                      {item.latencyLabel}
                    </span>
                  )}
                </div>
                <p className="font-display text-sm font-semibold text-[#F8F5ED] mt-1">
                  {item.label}
                </p>
                <p className="font-mono text-[11px] text-[#E8DFD0]/65 mt-1 truncate">
                  {item.stackSummary}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Section 2 & 3: Active Scenario Execution Pipeline Grid + Safeguards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
          className="pt-6 space-y-5"
        >
          {/* 3-Column Execution Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Node 1: n8n Trigger & Orchestration (step 1) */}
            <motion.button
              type="button"
              animate={{ scale: activeStep === 1 ? 1.015 : 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              whileHover={{ y: -2 }}
              onClick={() => handleSelectStep(1)}
              className={`text-left rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                activeStep === 1
                  ? 'bg-white/10 border-[#C47745] ring-1 ring-[#C47745]/50 shadow-md'
                  : activeStep > 1
                    ? 'bg-white/[0.06] border-[#C5A46D]/45'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-[#C5A46D]">
                    <Workflow className="w-4 h-4 text-[#C47745]" />
                    01 · n8n Orchestration
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C47745]">
                    {activeStep === 1 ? (
                      'Triggering'
                    ) : activeStep > 1 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A46D]" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </span>
                </div>
                <p className="font-display text-base font-semibold text-[#F8F5ED]">
                  {scenario.triggerSource}
                </p>
                <p className="mt-1 text-[11px] font-mono text-[#C5A46D]/90">
                  {scenario.triggerMethod}
                </p>
                <p className="text-xs sm:text-sm text-[#E8DFD0]/80 mt-2.5 leading-relaxed">
                  &ldquo;{scenario.inboundText}&rdquo;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-[#E8DFD0]/65">
                {scenario.triggerMeta}
              </div>
            </motion.button>

            {/* Node 2: AI Agent Classification (step 2) */}
            <motion.button
              type="button"
              animate={{ scale: activeStep === 2 ? 1.015 : 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              whileHover={{ y: -2 }}
              onClick={() => handleSelectStep(2)}
              className={`text-left rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                activeStep === 2
                  ? 'bg-white/10 border-[#C47745] ring-1 ring-[#C47745]/50 shadow-md'
                  : activeStep > 2
                    ? 'bg-white/[0.06] border-[#C5A46D]/45'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-[#C5A46D]">
                    <Bot className="w-4 h-4 text-[#C47745]" />
                    02 · AI Agent
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C47745]">
                    {activeStep === 2 ? (
                      'Classifying'
                    ) : activeStep > 2 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A46D]" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </span>
                </div>
                <p className="font-display text-base font-semibold text-[#F8F5ED]">
                  {scenario.classification}
                </p>
                <p className="mt-1 text-[11px] font-mono text-[#C5A46D]/90">
                  {scenario.aiModel}
                </p>
                <pre className="mt-3 p-2.5 rounded-lg bg-[#1A1A1A] border border-white/10 text-[11px] font-mono text-[#E8DFD0] overflow-x-auto leading-relaxed">
                  {JSON.stringify(scenario.outputJson, null, 2)}
                </pre>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-[#E8DFD0]/65">
                {scenario.aiActionMeta}
              </div>
            </motion.button>

            {/* Node 3: CRM Record Updates (step 3) */}
            <motion.button
              type="button"
              animate={{ scale: activeStep === 3 ? 1.015 : 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              whileHover={{ y: -2 }}
              onClick={() => handleSelectStep(3)}
              className={`text-left rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                activeStep === 3
                  ? 'bg-white/10 border-[#C5A46D] ring-1 ring-[#C5A46D]/50 shadow-md'
                  : activeStep > 3
                    ? 'bg-white/[0.06] border-[#C5A46D]/45'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-[#C5A46D]">
                    <Database className="w-4 h-4 text-[#C5A46D]" />
                    03 · CRM & App Sync
                  </span>
                  {activeStep === 3 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C5A46D]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Syncing
                    </span>
                  ) : activeStep > 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A46D]" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                  )}
                </div>
                <p className="font-display text-base font-semibold text-[#F8F5ED]">
                  {scenario.crmTarget}
                </p>
                <p className="text-xs sm:text-sm text-[#E8DFD0]/85 mt-2.5 leading-relaxed">
                  {scenario.crmAction}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-[#E8DFD0]/65">
                {scenario.crmMeta}
              </div>
            </motion.button>
          </div>

          {/* Safeguards & Telemetry Cards in Grid View (steps 4.. ending on Audit & Notify) */}
          {scenario.features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {scenario.features.map((feat, fIdx) => {
                const stepNum = 4 + fIdx;
                const isCardActive = activeStep === stepNum;
                const isCardDone = activeStep > stepNum;
                return (
                  <motion.button
                    key={`${feat.label}-${fIdx}`}
                    type="button"
                    animate={{ scale: isCardActive ? 1.02 : 1 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                    whileHover={{ y: -1.5 }}
                    onClick={() => handleSelectStep(stepNum)}
                    className={`text-left flex items-start gap-2.5 px-3.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isCardActive
                        ? 'bg-[#C47745]/20 border-[#C47745] ring-1 ring-[#C47745]/50 shadow-sm'
                        : isCardDone
                          ? 'bg-white/[0.06] border-[#C5A46D]/45'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="mt-0.5">
                      <FeatureIcon type={feat.icon} active={isCardActive} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-[11px] font-mono uppercase tracking-wider ${
                            isCardActive ? 'text-[#F8F5ED] font-semibold' : 'text-[#C5A46D]'
                          }`}
                        >
                          {feat.label}
                        </p>
                        {(isCardActive || isCardDone) && (
                          <span
                            className={`text-[10px] font-mono ${
                              isCardActive ? 'text-[#C47745] font-semibold' : 'text-[#C5A46D]/80'
                            }`}
                          >
                            {feat.statusTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#E8DFD0]/85 mt-0.5 leading-snug">
                        {feat.value}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Interactive Progress Strip */}
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          {phaseMarkers.map((phase) => {
            const isPhaseActive =
              activeStep >= phase.activeRange[0] && activeStep <= phase.activeRange[1];
            const isPhaseCompleted = activeStep > phase.activeRange[1];
            return (
              <button
                key={phase.label}
                type="button"
                onClick={() => handleSelectStep(phase.targetStep)}
                className={`transition-colors cursor-pointer ${
                  isPhaseActive
                    ? 'text-[#C47745] font-semibold'
                    : isPhaseCompleted
                      ? 'text-[#C5A46D]'
                      : 'text-[#E8DFD0]/45 hover:text-[#E8DFD0]/75'
                }`}
              >
                {phase.label}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-[#E8DFD0]/55">
          Select any card in the grid to inspect that stage
        </span>
      </div>
    </motion.div>
  );
}
