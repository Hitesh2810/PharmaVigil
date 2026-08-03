import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquare, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div
          variants={fadeUp}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-muted backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          Explainable AI for Drug Safety
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl text-balance"
        >
          AI-Powered{' '}
          <span className="gradient-text animate-gradient">Pharmacovigilance</span>{' '}
          Analytics Platform
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg text-balance"
        >
          Predict adverse-event seriousness and causality using Explainable AI,
          visualize insights with SHAP, and interact through an intelligent AI
          chatbot.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/implementation-flow"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-cyan sm:w-auto"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/chatbot"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
          >
            <MessageSquare className="h-4 w-4" />
            Try AI Chatbot
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {[
            { icon: Activity, label: 'Real-time Prediction' },
            { icon: Sparkles, label: 'SHAP Explainability' },
            { icon: ShieldCheck, label: 'Causality Assessment' },
            { icon: MessageSquare, label: 'AI Assistant' },
          ].map((item) => (
            <div
              key={item.label}
              className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-secondary">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium leading-tight text-white/90">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
