import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowCard } from './FlowCard';
import { flowSteps, type FlowStep } from './FlowData';

const STEP_DURATION_MS = 1200;
const STATUS_DURATION_MS = 1000;
const DATAIKU_DETAIL_MS = 900;

export function ImplementationFlowPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dataikuDetailIndex, setDataikuDetailIndex] = useState(0);
  const [showStatus, setShowStatus] = useState(true);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  const activeStep = flowSteps[Math.min(activeIndex, flowSteps.length - 1)];

  useEffect(() => {
    setShowStatus(true);
    const statusTimer = window.setTimeout(() => {
      setShowStatus(false);
    }, STATUS_DURATION_MS);
    return () => window.clearTimeout(statusTimer);
  }, [activeIndex]);

  useEffect(() => {
    if (paused || hasCompleted) return;
    if (activeStep.id === 'dataiku' && activeStep.detailSteps && dataikuDetailIndex < activeStep.detailSteps.length - 1) return;

    const stepTimer = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= flowSteps.length - 1) {
          setHasCompleted(true);
          return current;
        }
        return current + 1;
      });
    }, STEP_DURATION_MS);

    return () => window.clearTimeout(stepTimer);
  }, [activeIndex, activeStep, dataikuDetailIndex, paused, hasCompleted]);

  useEffect(() => {
    if (paused || hasCompleted) return;
    if (activeStep.id !== 'dataiku' || !activeStep.detailSteps) return;

    const detailTimer = window.setTimeout(() => {
      setDataikuDetailIndex((current) => Math.min(current + 1, activeStep.detailSteps!.length - 1));
    }, DATAIKU_DETAIL_MS);

    return () => window.clearTimeout(detailTimer);
  }, [activeIndex, activeStep, dataikuDetailIndex, paused, hasCompleted]);

  useEffect(() => {
    if (activeStep.id !== 'dataiku') {
      setDataikuDetailIndex(0);
    }
  }, [activeStep.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/visualizations');
      }
      if (event.key === ' ') {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleReplay = () => {
    setActiveIndex(0);
    setDataikuDetailIndex(0);
    setShowStatus(true);
    setPaused(false);
    setHasCompleted(false);
  };

  const rows: FlowStep[][] = [
    flowSteps.slice(0, 5),
    flowSteps.slice(5, 10),
    flowSteps.slice(10, 15),
    flowSteps.slice(15, 19),
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_rgba(5,9,23,0.98),_rgba(13,24,42,0.96))] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-[2rem] border border-white/10 bg-slate-950/60 p-3 shadow-[0_40px_150px_rgba(3,7,19,0.65)] backdrop-blur-xl sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-900/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300">Enterprise Architecture</p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Implementation Flow</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMuted((value) => !value)} className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:bg-white/10">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setPaused((value) => !value)} className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:bg-white/10">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/55 p-5 shadow-[0_45px_140px_rgba(7,14,32,0.5)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Animated workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Enterprise architecture flow</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                A premium left-to-right implementation diagram with persistent stage cards, glowing connectors, and rich tooltip details.
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-[0_15px_50px_rgba(34,211,238,0.12)]">
              Step {activeIndex + 1} of {flowSteps.length}
            </div>
          </div>

          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="">
                <div>
                  <div
                    className="grid gap-6 items-start"
                    style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
                  >
                    {row.map((step, index) => {
                      const baseIndex = rows.slice(0, rowIndex).reduce((s, r) => s + r.length, 0);
                      const globalIndex = baseIndex + index;
                      const visible = globalIndex <= activeIndex;
                      const active = globalIndex === activeIndex;
                      const complete = globalIndex < activeIndex;

                      return (
                        <div key={step.id} className="relative flex justify-center">
                          <FlowCard
                            step={step}
                            visible={visible}
                            active={active}
                            complete={complete}
                            showStatus={showStatus}
                            dataikuDetailIndex={dataikuDetailIndex}
                          />

                          {index < row.length - 1 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={visible ? { opacity: 1 } : { opacity: 0 }}
                              transition={{ duration: 0.45 }}
                              className="pointer-events-none absolute right-[-2.25rem] top-1/2 hidden h-3 w-24 -translate-y-1/2 items-center justify-center lg:flex"
                            >
                                <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-cyan-400/35 shadow-[0_0_18px_rgba(34,211,238,0.2)]" />
                                <span className="relative inline-block h-4 w-4 translate-x-3 rotate-45 border-t border-r border-cyan-200" />
                            </motion.div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasCompleted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40" />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function BrandIcon({ step }: { step: FlowStep }) {
  const baseClass = 'h-5 w-5';

  if (step.logo === 'aws') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#FF9900" />
        <path d="M8.2 8.2h2.2v2.2H8.2zM13.6 8.2h2.2v2.2h-2.2zM8.2 13.6h2.2v2.2H8.2zM13.6 13.6h2.2v2.2h-2.2z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'snowflake') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#29B5E8" />
        <path d="M12 6.5l2.4 1.1v2.6l-2.4 1.1-2.4-1.1V7.6L12 6.5Zm-3.8 4.1 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Zm7.6 0 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Zm-3.8 4.1 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'dataiku') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#1D4ED8" />
        <path d="M7 7h4v10H7zM13 10h4v7h-4z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'nextjs') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#111827" />
        <path d="M16.2 17 9.7 8.3h2.3L18 15.2 16.2 17Zm-2.3-8.7H18v8.7l-4.1-8.7Z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'flask') {
    return <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3h8" /><path d="M10 3v5l-3 7a2 2 0 0 0 1.8 3h6.4a2 2 0 0 0 1.8-3l-3-7V3" /></svg>;
  }

  if (step.logo === 'supabase') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#3B82F6" />
        <path d="M7 8h10v8H7z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'openrouter') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#7C3AED" />
        <path d="M8 8h8v8H8z" fill="white" />
      </svg>
    );
  }

  const Icon = step.icon;
  return <Icon className={baseClass} />;
}
