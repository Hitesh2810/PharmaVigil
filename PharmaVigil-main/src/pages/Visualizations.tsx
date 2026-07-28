import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Gauge,
  BarChart3,
  Network,
  type LucideIcon,
} from 'lucide-react';
import { ShapSection } from './viz/ShapSection';
import { MlSection } from './viz/MlSection';
import { AnalyticsSection } from './viz/AnalyticsSection';
import { ArchitectureSection } from './viz/ArchitectureSection';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  component: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'shap',
    label: 'SHAP Explainability',
    icon: Sparkles,
    description: 'Shapley value attributions and natural-language explanations',
    component: <ShapSection />,
  },
  {
    id: 'ml',
    label: 'ML Performance',
    icon: Gauge,
    description: 'ROC, precision-recall, confusion matrix & metrics',
    component: <MlSection />,
  },
  {
    id: 'analytics',
    label: 'PV Analytics',
    icon: BarChart3,
    description: 'Adverse-event, drug, country & severity analytics',
    component: <AnalyticsSection />,
  },
  {
    id: 'architecture',
    label: 'System Architecture',
    icon: Network,
    description: 'End-to-end pipeline from data to chatbot',
    component: <ArchitectureSection />,
  },
];

export default function Visualizations() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Dashboard
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Interactive <span className="gradient-text-warm">Visualizations</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base text-balance">
          Explore explainability, model performance, pharmacovigilance analytics,
          and the system architecture powering PharmaVigil AI.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-72 lg:flex-col lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`group relative flex min-w-[200px] items-center gap-3 rounded-xl p-4 text-left transition-all lg:min-w-0 ${
                  isActive
                    ? 'glass-strong ring-1 ring-primary/30'
                    : 'glass hover:bg-white/[0.06]'
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-glow'
                      : 'bg-white/5 text-muted group-hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {tab.label}
                  </span>
                  <span className="hidden text-xs text-muted lg:block">{tab.description}</span>
                </span>
                {isActive && (
                  <motion.span
                    layoutId="viz-active"
                    className="absolute -left-px top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-brand-gradient lg:block"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {current.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
