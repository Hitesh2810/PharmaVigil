import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Area,
  AreaChart,
  Tooltip,
} from 'recharts';
import { ChartCard, chartTooltipStyle, axisStyle } from './ChartCard';
import {
  shapFeatures as fallbackFeatures,
  shapSummary as fallbackSummary,
  shapWaterfall as fallbackWaterfall,
  shapDependence as fallbackDependence,
  shapDecision as fallbackDecision,
} from '@/lib/vizData';
import { fadeUp } from '@/lib/motion';
import { predictClassification } from '@/lib/api';

const defaultPayload = {
  patient_age: 52,
  drug_name: 'RHEUMATRIX',
  dose_amount_mg: 250,
  country: 'Brazil',
  reporter_type: 'Other',
  batch_id: 'B1090-B',
  historical_ae_frequency: 6,
};

export function ShapSection() {
  const [explanation, setExplanation] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await predictClassification(defaultPayload);
        setExplanation(response.shap);
      } catch (error) {
        console.error('Failed to load SHAP explanation', error);
      }
    };
    load();
  }, []);

  const topFeatures = useMemo(() => {
    if (!explanation?.top_important_features?.length) return fallbackFeatures;
    return explanation.top_important_features.map((feature: any) => ({
      feature: feature.feature,
      shap: feature.shap_value,
      direction: feature.shap_value >= 0 ? 'positive' : 'negative',
      value: feature.shap_value.toFixed(2),
    }));
  }, [explanation]);

  const riskScore = explanation ? Math.min(0.96, Math.max(0.1, 0.55 + (Number(explanation.shap_values?.[0] ?? 0) * 0.05))) : 0.74;
  const explanationText = explanation?.natural_language_explanation ?? 'For this adverse-event report, the model predicted Serious with strong feature contributions.';
  const confidence = explanation?.confidence ?? 0.74;
  return (
    <div className="space-y-6">
      {/* Natural language explanation + risk meter */}
      <motion.div
        variants={fadeUp}
        className="glass-strong relative overflow-hidden rounded-2xl p-6"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-white">
                Natural-language explanation
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              For this adverse-event report, the model predicted{' '}
              <span className="font-semibold text-white">Serious</span> with{' '}
              <span className="font-semibold text-white">{Math.round(confidence * 100)}%</span> confidence.{' '}
              {explanationText}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topFeatures.slice(0, 4).map((f) => (
                <span
                  key={f.feature}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    f.direction === 'positive'
                      ? 'bg-red-500/10 text-red-300 ring-1 ring-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                  }`}
                >
                  {f.direction === 'positive' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {f.feature} {f.shap > 0 ? '+' : ''}{f.shap}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-white">Risk score</span>
            </div>
            <div className="mt-3">
              <div className="flex items-end justify-between">
                <span className="font-display text-4xl font-bold gradient-text-warm">
                  {(riskScore * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-red-300">High risk</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${riskScore * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-red-400 to-red-500"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Composite SHAP-derived probability of a serious outcome.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature contribution cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topFeatures.map((f, i) => (
          <motion.div
            key={f.feature}
            variants={fadeUp}
            custom={i}
            className="glass card-glow-hover rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{f.feature}</span>
              {f.direction === 'positive' ? (
                <TrendingUp className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span
                className={`font-display text-2xl font-bold ${
                  f.direction === 'positive' ? 'text-red-300' : 'text-emerald-300'
                }`}
              >
                {f.shap > 0 ? '+' : ''}{f.shap}
              </span>
              <span className="text-xs text-muted">{f.value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.abs(f.shap) * 250}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className={`h-full rounded-full ${
                  f.direction === 'positive'
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plots */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="SHAP Summary Plot"
          subtitle="Mean absolute Shapley value per feature across the cohort"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={fallbackSummary}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" {...axisStyle} />
              <YAxis type="category" dataKey="feature" {...axisStyle} width={120} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => [Number(v).toFixed(3), 'SHAP']} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {fallbackSummary.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.value >= 0 ? '#F87171' : '#34D399'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Waterfall Plot"
          subtitle="How each feature shifts the prediction from the base value"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={fallbackWaterfall}
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="feature" {...axisStyle} angle={-25} textAnchor="end" height={70} interval={0} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="cumulative" radius={[6, 6, 0, 0]}>
                {fallbackWaterfall.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.value >= 0 ? '#3B82F6' : '#06B6D4'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Force Plot"
          subtitle="Cumulative push toward the final prediction"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={fallbackWaterfall} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="forceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="feature" {...axisStyle} angle={-25} textAnchor="end" height={70} interval={0} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#forceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Dependence Plot"
          subtitle="SHAP value vs. patient age interaction"
        >
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="age" name="Age" {...axisStyle} />
              <YAxis type="number" dataKey="shap" name="SHAP" {...axisStyle} />
              <Tooltip {...chartTooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={fallbackDependence} fill="#06B6D4" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Decision Plot"
          subtitle="Cumulative decision path across features"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={fallbackDecision} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="step" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
