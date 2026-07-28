import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { fadeUp } from '@/lib/motion';

interface ButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-brand-gradient text-white shadow-glow hover:shadow-glow-cyan hover:-translate-y-0.5',
  outline:
    'border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-md',
  ghost: 'text-muted hover:text-white hover:bg-white/5',
};

export function Button({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  const inner = (
    <motion.span
      whileTap={{ scale: 0.97 }}
      className="inline-flex w-full items-center justify-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {inner}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <motion.span
      variants={fadeUp}
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted ${className}`}
    >
      {children}
    </motion.span>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: CardProps) {
  return (
    <div className={`glass rounded-2xl ${className}`}>{children}</div>
  );
}
