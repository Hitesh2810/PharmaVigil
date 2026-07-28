import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { fadeUp, staggerContainer } from '@/lib/motion';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <motion.section
      id={id}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={`relative mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: SectionHeadingProps) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl text-balance"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-base leading-relaxed text-muted sm:text-lg text-balance"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
