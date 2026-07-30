import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-hero-radial" />
      <div className="absolute inset-0 grid-bg radial-fade opacity-60" />

      <motion.div
        className="absolute -top-32 -left-24 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-secondary/20 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-[130px]"
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-x-0 top-16 h-72 opacity-70 blur-[90px] bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/15"
        animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/4 top-1/2 h-[18rem] w-[18rem] rounded-full bg-white/15 blur-[80px] opacity-70"
        animate={{ x: [0, 12, 0], y: [0, -16, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
