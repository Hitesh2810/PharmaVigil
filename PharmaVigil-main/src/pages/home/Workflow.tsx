import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { workflow } from '@/lib/content';
import { fadeUp } from '@/lib/motion';
import { Section, SectionHeading } from '@/components/Section';

export function Workflow() {
  return (
    <Section className="py-20 sm:py-28" id="workflow">
      <SectionHeading
        eyebrow="Workflow"
        title={
          <>
            From raw reports to{' '}
            <span className="gradient-text-warm">explainable insight</span>
          </>
        }
        subtitle="A six-stage pipeline that transforms adverse-event data into auditable predictions and visual narratives."
      />

      <div className="mt-14">
        {/* Horizontal timeline (desktop) */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="relative flex items-center justify-between">
            {workflow.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div className="glass card-glow-hover group relative h-32 w-full max-w-[200px] rounded-2xl p-4">
                  <span className="font-display text-xs font-bold text-secondary">
                    STEP {step.step}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-snug text-muted">
                    {step.description}
                  </p>
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-12 bg-gradient-to-r from-transparent via-secondary to-transparent" />
                </div>
                {i < workflow.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-secondary/60"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vertical timeline (mobile) */}
        <div className="relative ml-3 border-l border-white/10 lg:hidden">
          {workflow.map((step) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              className="relative mb-6 pl-6 last:mb-0"
            >
              <span className="absolute -left-[7px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-gradient ring-4 ring-background" />
              <div className="glass card-glow-hover rounded-xl p-4">
                <span className="font-display text-xs font-bold text-secondary">
                  STEP {step.step}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
