import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { navLinks } from '@/lib/content';

const socials = [
  { label: 'GitHub', href: 'https://github.com/Hitesh2810', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hiteshkumars/', icon: Linkedin },
  { label: 'Email', href: 'mailto:hiteshkumarsairam@gmail.com', icon: Mail },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow">
                <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                PharmaVigil<span className="gradient-text-warm"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              An AI-powered pharmacovigilance analytics platform that predicts
              adverse-event seriousness and causality with explainable,
              auditable machine learning.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted transition-all hover:-translate-y-0.5 hover:text-white hover:shadow-glow"
                  aria-label={s.label}
                >
                  <s.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a href="mailto:hiteshkumarsairam@gmail.com" className="hover:text-white">
                  hiteshkumarsairam@gmail.com
                </a>
              </li>
              <li>Hosur</li>
              <li>Final Year B.Tech Capstone</li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-muted sm:flex-row"
        >
          <p>© {new Date().getFullYear()} PharmaVigil AI. All rights reserved.</p>
          <p>Built for a Final Year B.Tech Capstone Project.</p>
        </motion.div>
      </div>
    </footer>
  );
}
