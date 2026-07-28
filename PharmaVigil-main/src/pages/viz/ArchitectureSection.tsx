import { motion } from 'framer-motion';
import {
  Database,
  Wand2,
  SlidersHorizontal,
  Brain,
  Cpu,
  Sparkles,
  BarChart3,
  MessageSquare,
  User,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { architectureModules } from '@/lib/vizData';
import { fadeUp } from '@/lib/motion';
import { Section } from '@/components/Section';

const iconMap: Record<string, LucideIcon> = {
  Database,
  Wand2,
  SlidersHorizontal,
  Brain,
  Cpu,
  Sparkles,
  BarChart3,
  MessageSquare,
  User,
};

const accents = [
  'from-primary/20 to-primary/0 text-primary',
  'from-secondary/20 to-secondary/0 text-secondary',
  'from-accent/20 to-accent/0 text-accent',
];

export function ArchitectureSection() {
  return (
    <Section className="py-10">
      <div className="space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Pipeline
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            End-to-end <span className="gradient-text-warm">system architecture</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Nine modules move adverse-event data from raw ingestion to an
            explainable, conversational interface for clinicians.
          </p>
        </div>

        {/* Horizontal flow (desktop) */}
        <div className="hidden flex-wrap justify-center gap-y-6 lg:flex">
          {architectureModules.map((mod, i) => {
            const Icon = iconMap[mod.icon];
            const accent = accents[i % accents.length];
            return (
              <div key={mod.name} className="flex items-center">
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="group relative w-52 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-5 backdrop-blur-xl transition-all hover:shadow-glow"
                >
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-70`} />
                  <div className="relative">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${accent} ring-1 ring-white/10`}>
                      <Icon className="h-5.5 w-5.5" />
                    </span>
                    <span className="mt-1 block font-display text-[10px] font-bold tracking-widest text-secondary">
                      0{i + 1}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-white">{mod.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{mod.desc}</p>
                  </div>
                </motion.div>
                {i < architectureModules.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="px-1.5 text-secondary/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical flow (mobile) */}
        <div className="relative ml-3 border-l border-white/10 lg:hidden">
          {architectureModules.map((mod, i) => {
            const Icon = iconMap[mod.icon];
            const accent = accents[i % accents.length];
            return (
              <motion.div
                key={mod.name}
                variants={fadeUp}
                className="relative mb-5 pl-6 last:mb-0"
              >
                <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full bg-brand-gradient ring-4 ring-background" />
                <div className="glass card-glow-hover rounded-xl p-4">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${accent} ring-1 ring-white/10`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-white">
                    <span className="text-secondary">0{i + 1}</span> · {mod.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{mod.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
