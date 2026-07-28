import { motion } from 'framer-motion';
import {
  Target,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Brain,
  Sparkles,
  BarChart3,
  MessageSquare,
  LayoutDashboard,
  Database,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import { Section, SectionHeading } from '@/components/Section';
import { fadeUp } from '@/lib/motion';

const objectives = [
  { icon: ShieldCheck, title: 'Improve drug safety', desc: 'Surface serious adverse events earlier so regulators can act faster.' },
  { icon: Brain, title: 'Predict adverse events', desc: 'Classify seriousness and causality with ensemble machine learning.' },
  { icon: Sparkles, title: 'Explain AI decisions', desc: 'Pair every prediction with SHAP-based, auditable explanations.' },
  { icon: BarChart3, title: 'Provide visual insights', desc: 'Translate raw reports into interactive dashboards and trends.' },
  { icon: MessageSquare, title: 'Enable AI assistance', desc: 'Let clinicians query predictions and concepts conversationally.' },
  { icon: LayoutDashboard, title: 'Modern UI', desc: 'Deliver a premium, responsive experience across all devices.' },
];

const techGrid = [
  'React', 'Tailwind', 'Python', 'Scikit-learn', 'SHAP', 'Pandas',
  'NumPy', 'Matplotlib', 'Flask', 'FastAPI', 'OpenAI', 'Gemini',
];

const future = [
  { icon: Database, title: 'Live hospital integration', desc: 'Direct ingestion from hospital information systems.' },
  { icon: ShieldCheck, title: 'Electronic Health Records', desc: 'Structured EHR data for richer feature engineering.' },
  { icon: Rocket, title: 'Cloud deployment', desc: 'Autoscaling, containerized deployment on managed cloud.' },
  { icon: Brain, title: 'Real-time monitoring', desc: 'Streaming signal detection on live report feeds.' },
  { icon: Sparkles, title: 'Deep learning models', desc: 'LSTMs and Transformers for sequence-aware prediction.' },
  { icon: MessageSquare, title: 'LLMs & RAG', desc: 'Retrieval-augmented chatbot over medical literature.' },
];

const conceptCards: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Pharmacovigilance',
    desc: 'The WHO-defined science of detecting, assessing, and preventing adverse drug effects after market approval.',
  },
  {
    icon: Brain,
    title: 'Why AI',
    desc: 'Machine learning triages thousands of reports at scale, surfacing serious cases far faster than manual review.',
  },
  {
    icon: Sparkles,
    title: 'Explainable AI',
    desc: 'Transparent rationale for every prediction so clinicians can audit and trust model decisions.',
  },
  {
    icon: BarChart3,
    title: 'SHAP',
    desc: 'Shapley values attribute each feature\'s contribution to a prediction, grounded in cooperative game theory.',
  },
  {
    icon: Target,
    title: 'Predictive analytics',
    desc: 'Using historical adverse-event patterns to anticipate the seriousness and causality of new reports.',
  },
];

export default function About() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      {/* Hero */}
      <Section className="pb-8 pt-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            About the project
          </span>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl text-balance"
          >
            Demystifying drug safety with{' '}
            <span className="gradient-text">Explainable AI</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted sm:text-lg text-balance"
          >
            PharmaVigil AI is a Final Year B.Tech capstone that fuses machine
            learning, explainability, and conversational AI to modernize how
            adverse drug events are predicted, explained, and explored.
          </motion.p>
        </div>
      </Section>

      {/* About project / concepts */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="About the project"
          title="The science behind pharmacovigilance"
          subtitle="Five foundational concepts that shape everything this platform does."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {conceptCards.map((c, i) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
              className="glass card-glow-hover group relative overflow-hidden rounded-2xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.desc}</p>
            </motion.div>
          ))}
          <motion.div
            variants={fadeUp}
            custom={5}
            className="glass-strong relative flex flex-col justify-center overflow-hidden rounded-2xl p-6"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <Code2 className="h-8 w-8 text-accent" />
            <p className="mt-3 text-sm font-medium text-white">
              A research-driven capstone
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Built to demonstrate that explainable, auditable AI can make
              pharmacovigilance workflows faster and more transparent.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Objectives */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="Objectives"
          title="What we set out to achieve"
          subtitle="Six concrete goals guiding the project from research to product."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((o, i) => (
            <motion.div
              key={o.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
              className="glass card-glow-hover rounded-2xl p-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-secondary">
                  <o.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-white">{o.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{o.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Key features */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="Key features"
          title="Capabilities at a glance"
          subtitle="From prediction to explanation to conversation — all in one platform."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'AI Prediction', 'SHAP Explainability', 'Interactive Dashboard',
            'AI Chatbot', 'Analytics', 'Modern UI',
          ].map((f, i) => (
            <motion.div
              key={f}
              variants={fadeUp}
              custom={i}
              className="glass flex items-center gap-3 rounded-xl p-4"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
              <span className="text-sm font-medium text-white">{f}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Technologies */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="Technologies"
          title="The tools that power it"
          subtitle="A full-stack blend of data science, ML, and modern web engineering."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {techGrid.map((t, i) => (
            <motion.div
              key={t}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4 }}
              className="glass card-glow-hover grid place-items-center rounded-xl px-4 py-5 text-center"
            >
              <span className="font-display text-sm font-semibold text-white">{t}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Future enhancements */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="Future scope"
          title="Where PharmaVigil AI is heading"
          subtitle="The roadmap from a capstone demo toward a production-grade clinical tool."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {future.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
              className="glass card-glow-hover group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:bg-accent/20" />
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-accent ring-1 ring-white/10">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 text-base font-semibold text-white">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
