import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { ChartCard, chartTooltipStyle, axisStyle } from './ChartCard';
import {
  adverseEventFreq,
  drugReports,
  countryReports,
  reporterTypes,
  seriousSplit,
  severityDist,
  monthlyTrends,
  forecastTrend,
  scatterAgeOutcome,
  heatmap,
} from '@/lib/vizData';
import { fadeUp } from '@/lib/motion';
import { getDashboard, getDatasetSummary } from '@/lib/api';

const PIE_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#F87171'];

export function AnalyticsSection() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResponse, summaryResponse] = await Promise.all([getDashboard(), getDatasetSummary()]);
        setDashboard(dashboardResponse.dashboard);
        setSummary(summaryResponse.summary);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      }
    };
    load();
  }, []);

  const kpis = useMemo(() => {
    if (!dashboard || !summary) {
      return [
        { label: 'Total Reports', value: '104,420', delta: '+12.4%', up: true },
        { label: 'Serious Cases', value: '60,564', delta: '+8.1%', up: true },
        { label: 'Signals Detected', value: '238', delta: '+5 new', up: true },
        { label: 'Avg. Time to Triage', value: '2.3d', delta: '-0.4d', up: false },
      ];
    }
    const stats = dashboard.dataset_statistics ?? {};
    return [
      { label: 'Total Reports', value: summary.rows?.toLocaleString() ?? '0', delta: 'Live dataset', up: true },
      { label: 'Serious Cases', value: stats.serious_count?.toLocaleString() ?? '0', delta: 'From backend', up: true },
      { label: 'Non-Serious Cases', value: stats.non_serious_count?.toLocaleString() ?? '0', delta: 'From backend', up: true },
      { label: 'Columns', value: summary.columns?.toLocaleString() ?? '0', delta: 'Features loaded', up: true },
    ];
  }, [dashboard, summary]);
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={fadeUp}
            custom={i}
            className="glass card-glow-hover rounded-2xl p-5"
          >
            <p className="text-xs font-medium text-muted">{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-2xl font-bold text-white">{kpi.value}</span>
              <span className={`text-xs font-semibold ${kpi.up ? 'text-emerald-400' : 'text-secondary'}`}>
                {kpi.delta}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Adverse event frequency */}
        <ChartCard title="Adverse Event Frequency" subtitle="Most reported reactions across the dataset">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={adverseEventFreq} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" {...axisStyle} angle={-25} textAnchor="end" height={70} interval={0} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Drug-wise reports */}
        <ChartCard title="Drug-wise Reports" subtitle="Top drugs by adverse-event report count">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={drugReports} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" {...axisStyle} />
              <YAxis type="category" dataKey="name" {...axisStyle} width={90} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="reports" radius={[0, 6, 6, 0]} fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Country-wise */}
        <ChartCard title="Country-wise Reports" subtitle="Geographic distribution of reports">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={countryReports}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {countryReports.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v) => `${Number(v)}%`} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Reporter type */}
        <ChartCard title="Reporter Type Distribution" subtitle="Who is submitting the reports">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={reporterTypes}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {reporterTypes.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[(idx + 2) % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v) => `${Number(v)}%`} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Serious vs non */}
        <ChartCard title="Serious vs Non-Serious Cases" subtitle="Outcome severity split">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={seriousSplit}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                stroke="none"
              >
                <Cell fill="#F87171" />
                <Cell fill="#06B6D4" />
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v) => `${Number(v)}%`} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Severity distribution */}
        <ChartCard title="Severity Distribution" subtitle="Breakdown of case severity grades">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={severityDist} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" {...axisStyle} angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => `${Number(v)}%`} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {severityDist.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly trends */}
        <ChartCard title="Monthly Trends" subtitle="Serious vs non-serious cases over time">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyTrends} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="seriousGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="nonSeriousGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
              <Area type="monotone" dataKey="serious" stroke="#F87171" fill="url(#seriousGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="nonSerious" stroke="#06B6D4" fill="url(#nonSeriousGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Forecast trend */}
        <ChartCard title="Forecast Trend" subtitle="Projected serious-case volume with confidence band">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={forecastTrend} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(5,8,22,0.6)" />
              <Line type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="5 5" dot={false} connectNulls={false} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter: age vs severity */}
        <ChartCard title="Age vs. Outcome Severity" subtitle="Individual report distribution">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="age" name="Age" {...axisStyle} />
              <YAxis type="number" dataKey="severity" name="Severity" {...axisStyle} domain={[0, 4]} />
              <Tooltip {...chartTooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterAgeOutcome} fill="#8B5CF6" fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Heatmap style */}
        <ChartCard title="Reporter × Severity Heatmap" subtitle="Report density across reporter types and severities">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-muted">Reporter</th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted">Mild</th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted">Moderate</th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted">Severe</th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted">Life-thr.</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => {
                  const max = Math.max(row.mild, row.moderate, row.severe, row.lt);
                  return (
                    <tr key={row.reporter}>
                      <td className="whitespace-nowrap px-2 py-1.5 font-medium text-white">{row.reporter}</td>
                      {[row.mild, row.moderate, row.severe, row.lt].map((val, idx) => {
                        const intensity = max ? val / max : 0;
                        return (
                          <td key={idx} className="px-1 py-1.5">
                            <div
                              className="grid h-9 place-items-center rounded-lg font-semibold text-white"
                              style={{
                                background: `rgba(59, 130, 246, ${0.15 + intensity * 0.7})`,
                              }}
                            >
                              {val}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
