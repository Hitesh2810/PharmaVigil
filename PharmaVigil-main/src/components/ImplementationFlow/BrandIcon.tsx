import type { FlowStep } from './FlowData';

export function BrandIcon({ step }: { step: FlowStep }) {
  const baseClass = 'h-6 w-6';

  if (step.logo === 'aws') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#FF9900" />
        <path d="M8.2 8.2h2.2v2.2H8.2zM13.6 8.2h2.2v2.2h-2.2zM8.2 13.6h2.2v2.2H8.2zM13.6 13.6h2.2v2.2h-2.2z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'snowflake') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#29B5E8" />
        <path d="M12 6.5l2.4 1.1v2.6l-2.4 1.1-2.4-1.1V7.6L12 6.5Zm-3.8 4.1 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Zm7.6 0 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Zm-3.8 4.1 2.4 1.1v2.6l-2.4 1.1-2.4-1.1v-2.6l2.4-1.1Z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'dataiku') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#1D4ED8" />
        <path d="M7 7h4v10H7zM13 10h4v7h-4z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'nextjs') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#111827" />
        <path d="M16.2 17 9.7 8.3h2.3L18 15.2 16.2 17Zm-2.3-8.7H18v8.7l-4.1-8.7Z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'flask') {
    return <svg viewBox="0 0 24 24" className={baseClass} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3h8" /><path d="M10 3v5l-3 7a2 2 0 0 0 1.8 3h6.4a2 2 0 0 0 1.8-3l-3-7V3" /></svg>;
  }

  if (step.logo === 'supabase') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#3B82F6" />
        <path d="M7 8h10v8H7z" fill="white" />
      </svg>
    );
  }

  if (step.logo === 'openrouter') {
    return (
      <svg viewBox="0 0 24 24" className={baseClass} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#7C3AED" />
        <path d="M8 8h8v8H8z" fill="white" />
      </svg>
    );
  }

  const Icon = step.icon;
  return <Icon className={baseClass} />;
}
