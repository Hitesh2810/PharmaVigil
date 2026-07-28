import { motion } from 'framer-motion';
import { stats } from '@/lib/content';
import { fadeUp } from '@/lib/motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Section } from '@/components/Section';

export function Stats() {
  return (
    <Section className="py-20 sm:py-24">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="text-center"
            >
              <div className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  className="gradient-text-warm"
                />
              </div>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
