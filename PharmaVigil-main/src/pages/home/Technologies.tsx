import { motion } from 'framer-motion';
import { technologies } from '@/lib/content';
import { fadeUp } from '@/lib/motion';
import { Section, SectionHeading } from '@/components/Section';

export function Technologies() {
  return (
    <Section className="py-20 sm:py-28" id="technologies">
      <SectionHeading
        eyebrow="Tech Stack"
        title={
          <>
            Built on a foundation of{' '}
            <span className="gradient-text-warm">modern tools</span>
          </>
        }
        subtitle="An end-to-end stack spanning data science, machine learning, explainability, and a premium web frontend."
      />

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {technologies.map((tech, i) => (
          <motion.span
            key={tech.name}
            variants={fadeUp}
            whileHover={{ y: -4, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="glass cursor-default rounded-xl px-5 py-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
            {tech.name}
          </motion.span>
        ))}
      </div>
    </Section>
  );
}
