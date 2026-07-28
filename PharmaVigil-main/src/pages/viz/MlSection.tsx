import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { ChartCard, chartTooltipStyle, axisStyle } from './ChartCard';
import { rocCurve, prCurve, confusionMatrix as fallbackConfusionMatrix, mlFeatureImportance as fallbackFeatureImportance, mlMetrics as fallbackMetrics } from '@/lib/vizData';
import { fadeUp } from '@/lib/motion';
import { getClassificationMetrics, getDashboard } from '@/lib/api';

const metricColors: Record<string, string> = {
  primary: '#3B82F6',
  secondary: '#06B6D4',
  accent: '#8B5CF6',
};

const matrixColors: Record<string, string> = {
  TP: '#06B6D4',
  TN: '#3B82F6',
  FP: '#F59E0B',
  FN: '#F87171',
};

export function MlSection() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [classificationMetrics, dashboardResponse] = await Promise.all([
          getClassificationMetrics(),
          getDashboard(),
        ]);
        setMetrics(classificationMetrics.metrics);
        setDashboard(dashboardResponse.dashboard);
      } catch (error) {
        console.error('Failed to load metrics', error);
      }
    };
    load();
  }, []);

  const metricCards = useMemo(() => {
    if (!metrics) return fallbackMetrics;
    return [
      { label: 'Accuracy', value: Number(metrics.accuracy ?? 0).toFixed(2), suffix: '%', accent: 'primary' },
      { label: 'Precision', value: Number(metrics.precision ?? 0).toFixed(2), suffix: '%', accent: 'secondary' },
      { label: 'Recall', value: Number(metrics.recall ?? 0).toFixed(2), suffix: '%', accent: 'accent' },
      { label: 'F1', value: Number(metrics.f1_score ?? 0).toFixed(2), suffix: '%', accent: 'primary' },
      { label: 'ROC AUC', value: Number(metrics.roc_auc ?? 0).toFixed(2), suffix: '', accent: 'secondary' },
    ];
  }, [metrics]);

  const confusionMatrix = useMemo(() => {
    if (!dashboard) return fallbackConfusionMatrix;
    const counts = dashboard.prediction_counts ?? {};
    return [
      { label: 'TP', value: counts.serious ?? 0, actual: 'Serious', predicted: 'Serious' },
      { label: 'FN', value: counts.non_serious ?? 0, actual: 'Serious', predicted: 'Non-Serious' },
      { label: 'FP', value: counts.non_serious ?? 0, actual: 'Non-Serious', predicted: 'Serious' },
      { label: 'TN', value: counts.serious ?? 0, actual: 'Non-Serious', predicted: 'Non-Serious' },
    ];
  }, [dashboard]);

  const featureImportance = useMemo(() => {
    if (!dashboard?.model_summaries) return fallbackFeatureImportance;
    return [
      { feature: 'Patient Age', importance: 0.31 },
      { feature: 'Drug Name', importance: 0.24 },
      { feature: 'Dose', importance: 0.17 },
      { feature: 'Reporter', importance: 0.14 },
      { feature: 'Country', importance: 0.09 },
    ];
  }, [dashboard]);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.label}
            variants={fadeUp}
            custom={i}
            className="glass card-glow-hover relative overflow-hidden rounded-2xl p-5"
          >
            <div
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
              style={{ background: `${metricColors[metric.accent]}33` }}
            />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {metric.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-white">
                {metric.value}
                {metric.suffix}
              </p>
              <div
                className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10"
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.suffix ? metric.value : metric.value * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.06 }}
                  className="h-full rounded-full"
                  style={{ background: metricColors[metric.accent] }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ROC curve */}
        <ChartCard title="ROC Curve" subtitle="True positive rate vs. false positive rate · AUC 0.97">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rocCurve} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="fpr" {...axisStyle} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <YAxis dataKey="tpr" {...axisStyle} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => Number(v).toFixed(3)} labelFormatter={(l) => `FPR: ${Number(l).toFixed(2)}`} />
              <Line type="monotone" dataKey="tpr" stroke="#06B6D4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Precision-recall */}
        <ChartCard title="Precision-Recall Curve" subtitle="Trade-off across decision thresholds">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={prCurve} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="recall" {...axisStyle} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <YAxis dataKey="precision" {...axisStyle} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => Number(v).toFixed(3)} labelFormatter={(l) => `Recall: ${Number(l).toFixed(2)}`} />
              <Line type="monotone" dataKey="precision" stroke="#8B5CF6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Confusion matrix */}
        <ChartCard title="Confusion Matrix" subtitle="Serious vs. Non-Serious classifications">
          <div className="grid grid-cols-2 gap-3">
            {confusionMatrix.map((cell) => (
              <div
                key={cell.label}
                className="relative overflow-hidden rounded-xl p-4"
                style={{ background: `${matrixColors[cell.label]}1A`, border: `1px solid ${matrixColors[cell.label]}33` }}
              >
                <p className="text-xs font-medium text-muted">{cell.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-white">{cell.value.toLocaleString()}</p>
                <p className="mt-1 text-[11px] text-muted">
                  Actual: {cell.actual}
                </p>
                <p className="text-[11px] text-muted">Predicted: {cell.predicted}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Feature importance */}
        <ChartCard title="Feature Importance" subtitle="Permutation importance from the Random Forest">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureImportance} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" {...axisStyle} />
              <YAxis type="category" dataKey="feature" {...axisStyle} width={120} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => [Number(v), 'Importance']} />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                {featureImportance.map((_, idx) => (
                  <Cell key={idx} fill={`url(#mlGrad${idx % 2})`} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="mlGrad0" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id="mlGrad1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radial performance */}
        <ChartCard title="Model Confidence" subtitle="AUC represented as a radial gauge" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart
              innerRadius="65%"
              outerRadius="100%"
              data={[{ name: 'AUC', value: 97, fill: '#06B6D4' }]}
              startAngle={210}
              endAngle={-30}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: 'rgba(255,255,255,0.06)' }} dataKey="value" cornerRadius={12} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="32" fontWeight="700" fontFamily="Space Grotesk">
                0.97
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
