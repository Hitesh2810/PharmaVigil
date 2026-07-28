import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { features } from '@/lib/content';
import { fadeUp } from '@/lib/motion';
import { Section, SectionHeading } from '@/components/Section';

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  MessageSquare,
};

const accents = [
  'from-primary/20 to-primary/0 text-primary',
  'from-secondary/20 to-secondary/0 text-secondary',
  'from-accent/20 to-accent/0 text-accent',
  'from-primary/20 to-secondary/0 text-primary',
  'from-secondary/20 to-accent/0 text-secondary',
  'from-accent/20 to-primary/0 text-accent',
];

export function Features() {
  return (
    <Section className="py-20 sm:py-28" id="features">
      <SectionHeading
        eyebrow="Capabilities"
        title={
          <>
            Everything you need to{' '}
            <span className="gradient-text-warm">understand drug risk</span>
          </>
        }
        subtitle="A unified platform combining predictive machine learning, explainable AI, and conversational intelligence for modern pharmacovigilance teams."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = iconMap[feature.icon];
          return (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="glass card-glow-hover group relative overflow-hidden rounded-2xl p-6"
            >
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accents[i]} blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${accents[i]} ring-1 ring-white/10`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
