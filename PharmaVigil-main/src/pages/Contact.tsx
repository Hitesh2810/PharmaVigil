import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Send,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fadeUp } from '@/lib/motion';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'contact@pharmavigil.ai', href: 'mailto:contact@pharmavigil.ai' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: MapPin, label: 'Location', value: 'Department of Computer Science, India', href: null },
  { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/pharmavigil', href: 'https://linkedin.com' },
  { icon: Github, label: 'GitHub', value: 'github.com/pharmavigil', href: 'https://github.com' },
];

const faqs = [
  {
    q: 'What is Pharmacovigilance?',
    a: 'Pharmacovigilance is the science of detecting, assessing, understanding, and preventing adverse drug effects — defined by the WHO as a critical part of the medicines lifecycle after market approval.',
  },
  {
    q: 'How accurate is the model?',
    a: 'The ensemble model achieves approximately 95.2% prediction accuracy on seriousness classification, with an AUC of 0.97 and balanced precision/recall across both classes.',
  },
  {
    q: 'Which algorithm is used?',
    a: 'The primary model is a Random Forest classifier, supported by gradient-boosted trees. Random Forest was chosen for robustness to noisy adverse-event data and natural compatibility with SHAP tree explainers.',
  },
  {
    q: 'How is SHAP generated?',
    a: 'SHAP (SHapley Additive exPlanations) values are computed using TreeSHAP, an exact algorithm for tree ensembles. Each feature receives a contribution value that sums to the difference between the prediction and the expected base value.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FormValues) => {
    if (!supabase) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) {
      setStatus('error');
      return;
    }
    setStatus('success');
    reset();
    setTimeout(() => setStatus('idle'), 4000);
  };

  const inputClass = `w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-muted transition-colors focus:outline-none focus:ring-1 ${
    errors.message ? 'border-red-500/50 focus:ring-red-500/40'
      : 'border-white/10 focus:border-primary/40 focus:ring-primary/30'
  }`;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Get in touch
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Let's talk <span className="gradient-text-warm">drug safety</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base text-balance">
          Have a question about the project, a collaboration idea, or feedback?
          We'd love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="glass-strong relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:col-span-3"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <h2 className="relative text-lg font-semibold text-white">Send a message</h2>
          <p className="relative mt-1 text-sm text-muted">
            Fill out the form and we'll get back to you shortly.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="relative mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Name</label>
                <input
                  className={inputClass}
                  placeholder="Your name"
                  {...register('name', { required: true })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">Name is required.</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">A valid email is required.</p>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Subject</label>
              <input
                className={inputClass}
                placeholder="What's this about?"
                {...register('subject', { required: true })}
              />
              {errors.subject && <p className="mt-1 text-xs text-red-400">Subject is required.</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Message</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Tell us more…"
                {...register('message', { required: true, minLength: 10 })}
              />
              {errors.message && <p className="mt-1 text-xs text-red-400">Please enter at least 10 characters.</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'submitting' || status === 'success' || !isSupabaseConfigured}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-cyan disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {status === 'idle' && <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              {status === 'error' && <Send className="h-4 w-4" />}
              {status === 'submitting'
                ? 'Sending…'
                : status === 'success'
                ? 'Message sent!'
                : status === 'error'
                ? 'Try again'
                : isSupabaseConfigured
                ? 'Send message'
                : 'Contact form unavailable'}
            </button>

            {!isSupabaseConfigured && (
              <p className="text-sm text-amber-400">
                Supabase is not configured yet, so the contact form is currently unavailable.
              </p>
            )}

            <AnimatePresence>
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Thanks! Your message has been received.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-400"
                >
                  Something went wrong. Please try again in a moment.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Contact info + map */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4 lg:col-span-2"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white">Contact information</h3>
            <ul className="mt-4 space-y-3">
              {contactInfo.map((item) => {
                const content = (
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-secondary ring-1 ring-white/10">
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="text-sm font-medium text-white">{item.value}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="block transition-opacity hover:opacity-80">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="glass relative h-48 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative grid h-full place-items-center text-center">
              <div>
                <span className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-brand-gradient shadow-glow">
                  <MapPin className="h-6 w-6 text-white" />
                </span>
                <p className="mt-3 text-sm font-medium text-white">Find us on the map</p>
                <p className="text-xs text-muted">Department of Computer Science</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Quick answers about the platform and how it works.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
