import { type ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({ title, subtitle, children, className = '', action }: ChartCardProps) {
  return (
    <div className={`glass card-glow-hover rounded-2xl p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(11, 17, 32, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#fff',
    backdropFilter: 'blur(8px)',
  },
  labelStyle: { color: '#94A3B8', marginBottom: '4px' },
  itemStyle: { color: '#fff' },
};

export const axisStyle = {
  tick: { fill: '#94A3B8', fontSize: 11 },
  axisLine: { stroke: 'rgba(255,255,255,0.08)' },
  tickLine: { stroke: 'rgba(255,255,255,0.08)' },
};
