import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronDown, Menu, X } from 'lucide-react';
import { navLinks } from '@/lib/content';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
          scrolled
            ? 'mt-3 rounded-2xl border border-white/[0.06] bg-surface/80 py-3 backdrop-blur-xl'
            : 'mt-0 border border-transparent py-5'
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            PharmaVigil<span className="gradient-text-warm"> AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => link.label === 'Visualizations' ? (
            <div key={link.to} className="group relative">
              <NavLink to={link.to} className={({ isActive }) => `flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${(isActive || location.pathname.startsWith('/visualization/')) ? 'text-white' : 'text-muted hover:text-white'}`}>
                Visualization <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </NavLink>
              <div className="invisible absolute left-0 top-full w-48 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border border-white/10 bg-surface/95 p-2 shadow-xl backdrop-blur-xl">
                  {['classification', 'causality', 'regression'].map(kind => <Link key={kind} to={`/visualization/${kind}`} className="block rounded-lg px-3 py-2 text-sm capitalize text-muted transition hover:bg-white/5 hover:text-white">{kind}</Link>)}
                </div>
              </div>
            </div>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/chatbot"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-cyan"
          >
            Launch Console
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-5 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 p-3 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((link) => link.label === 'Visualizations' ? <div key={link.to}><NavLink to={link.to} className="block rounded-lg px-4 py-3 text-sm font-medium text-muted">Visualization</NavLink>{['classification', 'causality', 'regression'].map(kind => <Link key={kind} to={`/visualization/${kind}`} className="block rounded-lg py-2 pl-8 text-sm capitalize text-muted hover:text-white">{kind}</Link>)}</div> : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/5 text-white' : 'text-muted hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/chatbot"
              className="mt-2 block rounded-xl bg-brand-gradient px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Launch Console
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
