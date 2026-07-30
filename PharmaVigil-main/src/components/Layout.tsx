import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { AnimatedBackground } from './AnimatedBackground';
import { ThemeToggle } from './ThemeToggle';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <ThemeToggle />
      <Navbar />
      <div className="pt-24">{children}</div>
      <Footer />
      <BackToTop />
    </div>
  );
}
