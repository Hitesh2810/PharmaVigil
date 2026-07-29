import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, FileSpreadsheet, Sparkles, UploadCloud } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface PredictionRow {
  prediction?: string;
  confidence?: number;
  probability?: number;
  probabilities?: Record<string, number>;
}

interface ReportData {
  model_used?: string;
  rows?: number;
  columns?: number;
  missing_values?: number;
  duplicate_rows?: number;
  average_confidence?: number;
  feature_names?: string[];
  raw_shap_values?: number[][];
  raw_feature_values?: Array<Record<string, any>>;
  predictions_all?: PredictionRow[];
  base_value?: number | number[] | null;
  shap_importance?: number[];
  predictions?: PredictionRow[];
  plots?: Record<string, string>;
}

export default function LiveShapAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState('classification');
  const [preview, setPreview] = useState<any>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [selectedSample, setSelectedSample] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = async (selected?: File | null) => {
    if (!selected) return;
    setFile(selected);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', selected);
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/live-shap/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const payload = response.data?.data || response.data;
      setPreview(payload);
      setSuccess('Dataset validated successfully.');
    } catch (err: any) {
      setPreview(null);
      setError(err?.response?.data?.error || 'Unable to read the selected file.');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    if (!preview || !file) {
      setError('Please upload a valid dataset first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);
      const response = await axios.post(`${API_BASE}/live-shap/generate`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const payload = response.data?.data || response.data;
      setReport(payload);
      setSuccess('SHAP analysis generated successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to generate SHAP analysis.');
    } finally {
      setLoading(false);
    }
  };


  const previewSummary = useMemo(() => preview ? [
    { label: 'Rows', value: preview.rows },
    { label: 'Columns', value: preview.columns },
    { label: 'Missing Values', value: preview.missing_values },
    { label: 'Duplicate Rows', value: preview.duplicate_rows },
  ] : [], [preview]);

  const normalizedFeatureNames = useMemo(() => report?.feature_names ?? [], [report]);
  const shapMatrix = useMemo(() => report?.raw_shap_values ?? [], [report]);
  const featureValues = useMemo(() => report?.raw_feature_values ?? [], [report]);

  const chartLayoutDefaults = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#f8fafc' },
    legend: { font: { color: '#f8fafc' } },
    hoverlabel: { bgcolor: '#111827', bordercolor: '#374151', font: { color: '#f8fafc' } },
  };

  const summaryPlot = useMemo(() => {
    if (!report?.feature_names || !report?.shap_importance) return null;
    const labels = report.feature_names;
    const values = report.shap_importance;
    return (
      <Plot
        data={[{
          x: values,
          y: labels,
          type: 'bar',
          orientation: 'h',
          marker: { color: values, colorscale: 'Viridis', reversescale: true },
          hovertemplate: '%{y}<br>Mean |SHAP|: %{x:.4f}<extra></extra>',
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: 'Global mean |SHAP| importance',
          margin: { l: 180, r: 24, t: 40, b: 40 },
          height: 440,
          xaxis: { title: 'Mean |SHAP|', tickfont: { color: '#cbd5e1' } },
          yaxis: { automargin: true, tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [report]);

  const heatmapPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length) return null;
    return (
      <Plot
        data={[{
          z: shapMatrix,
          x: normalizedFeatureNames,
          y: shapMatrix.map((_, idx) => `Sample ${idx + 1}`),
          type: 'heatmap',
          colorscale: 'Picnic',
          reversescale: true,
          colorbar: { title: 'SHAP Value', tickfont: { color: '#f8fafc' }, titlefont: { color: '#f8fafc' } },
          hovertemplate: '%{y}<br>%{x}<br>SHAP: %{z:.4f}<extra></extra>',
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: 'SHAP heatmap across all samples',
          margin: { l: 120, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { tickangle: -45, tickfont: { color: '#cbd5e1' } },
          yaxis: { automargin: true, tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix]);

  const waterfallPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length || !featureValues.length) return null;
    const sample = shapMatrix[selectedSample] ?? [];
    const featurePairs = normalizedFeatureNames.map((name, idx) => ({ name, value: sample[idx] ?? 0 }));
    const sorted = featurePairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 12);
    return (
      <Plot
        data={[{
          x: sorted.map((item) => item.name),
          y: sorted.map((item) => item.value),
          type: 'bar',
          marker: { color: sorted.map((item) => (item.value >= 0 ? '#22c55e' : '#f97316')) },
          hovertemplate: '%{x}<br>SHAP: %{y:.4f}<extra></extra>',
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: `Top feature contributions for sample ${selectedSample + 1}`,
          margin: { l: 120, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { tickangle: -45, tickfont: { color: '#cbd5e1' } },
          yaxis: { title: 'SHAP value', tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix, selectedSample, featureValues]);

  const dependencePlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length || !featureValues.length || !selectedFeature) return null;
    const index = normalizedFeatureNames.indexOf(selectedFeature);
    if (index === -1) return null;
    const featureVals = featureValues.map((row) => row[selectedFeature]);
    const shapVals = shapMatrix.map((row) => row[index] ?? 0);
    return (
      <Plot
        data={[{
          x: featureVals,
          y: shapVals,
          mode: 'markers',
          marker: { color: shapVals, colorscale: 'Portland', showscale: true, colorbar: { title: 'SHAP' } },
          hovertemplate: `${selectedFeature}: %{x}<br>SHAP: %{y:.4f}<extra></extra>`,
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: `Dependence plot for ${selectedFeature}`,
          margin: { l: 80, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { title: `${selectedFeature} value`, tickangle: -45, tickfont: { color: '#cbd5e1' } },
          yaxis: { title: 'SHAP value', tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix, featureValues, selectedFeature]);

  const decisionPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length) return null;
    const sample = shapMatrix[selectedSample] ?? [];
    const cumulative = sample.reduce<number[]>((acc, value, idx) => {
      const next = (acc[idx - 1] ?? 0) + value;
      return [...acc, next];
    }, []);
    return (
      <Plot
        data={[{
          x: ['base', ...normalizedFeatureNames],
          y: [0, ...cumulative],
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: '#38bdf8', width: 3 },
          marker: { color: '#22d3ee', size: 8 },
          hovertemplate: '%{x}<br>Cumulative SHAP: %{y:.4f}<extra></extra>',
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: `Decision path for sample ${selectedSample + 1}`,
          margin: { l: 100, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { tickangle: -45, tickfont: { color: '#cbd5e1' } },
          yaxis: { title: 'Cumulative SHAP', tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix, selectedSample]);

  const forcePlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length) return null;
    const sample = shapMatrix[selectedSample] ?? [];
    const sortedFeatures = normalizedFeatureNames.map((name, idx) => ({
      name,
      shap: sample[idx] ?? 0,
    })).sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap)).slice(0, 12);
    return (
      <Plot
        data={[{
          x: sortedFeatures.map((item) => item.shap),
          y: sortedFeatures.map((item) => item.name),
          type: 'bar',
          orientation: 'h',
          marker: {
            color: sortedFeatures.map((item) => (item.shap >= 0 ? '#22c55e' : '#fb7185')),
          },
          hovertemplate: '%{y}<br>SHAP: %{x:.4f}<extra></extra>',
        }]}
        layout={{
          ...chartLayoutDefaults,
          title: `Force-style contribution for sample ${selectedSample + 1}`,
          margin: { l: 180, r: 24, t: 40, b: 40 },
          height: 440,
          xaxis: { title: 'SHAP contribution', tickfont: { color: '#cbd5e1' } },
          yaxis: { automargin: true, tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix, selectedSample]);

  const decisionOverviewPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length) return null;
    const sampleLimit = Math.min(shapMatrix.length, 10);
    const traces = Array.from({ length: sampleLimit }, (_, sampleIndex) => {
      const values = shapMatrix[sampleIndex];
      const cumulative = values.reduce<number[]>((acc, value, idx) => {
        const next = (acc[idx - 1] ?? 0) + value;
        return [...acc, next];
      }, []);
      const shade = 0.2 + 0.8 * (sampleIndex / Math.max(1, sampleLimit - 1));
      return {
        x: [0, ...cumulative],
        y: ['base', ...normalizedFeatureNames],
        mode: 'lines+markers',
        line: { color: `rgba(59, 130, 246, ${shade})`, width: 2 },
        marker: { size: 4, color: `rgba(59, 130, 246, ${shade})` },
        hovertemplate: `Sample ${sampleIndex + 1}<br>%{y}: %{x:.4f}<extra></extra>`,
        showlegend: false,
      };
    });
    return (
      <Plot
        data={traces}
        layout={{
          ...chartLayoutDefaults,
          title: 'SHAP decision overview across samples',
          margin: { l: 120, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { title: 'Model output value', tickfont: { color: '#cbd5e1' }, zerolinecolor: '#718096' },
          yaxis: { type: 'category', automargin: true, tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix]);

  const violinPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length) return null;
    const traces = normalizedFeatureNames.map((name, idx) => ({
      type: 'violin',
      x: shapMatrix.map((row) => row[idx] ?? 0),
      y: Array(shapMatrix.length).fill(name),
      orientation: 'h',
      name,
      box: { visible: true },
      meanline: { visible: true },
      points: 'outliers',
      hovertemplate: `${name}<br>SHAP: %{x:.4f}<extra></extra>`,
      marker: { color: `rgba(${40 + (idx * 20) % 215}, ${180 - (idx * 8) % 140}, ${220 - (idx * 6) % 160}, 0.6)` },
      line: { color: '#cbd5e1' },
    }));
    return (
      <Plot
        data={traces}
        layout={{
          ...chartLayoutDefaults,
          title: 'SHAP distribution by feature',
          margin: { l: 180, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { title: 'SHAP value (impact on model output)', tickfont: { color: '#cbd5e1' } },
          yaxis: { automargin: true, tickfont: { color: '#cbd5e1' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix]);

  const beeswarmPlot = useMemo(() => {
    if (!shapMatrix.length || !normalizedFeatureNames.length || !featureValues.length) return null;
    const traces = normalizedFeatureNames.map((name, idx) => ({
      x: shapMatrix.map((row) => row[idx] ?? 0),
      y: shapMatrix.map((_, sampleIndex) => `${name}`),
      text: featureValues.map((row, sampleIndex) => `Sample ${sampleIndex + 1}`),
      type: 'scatter',
      mode: 'markers',
      name,
      marker: {
        size: 6,
        color: shapMatrix.map((row) => row[idx] ?? 0),
        colorscale: 'RdBu',
        cmin: -Math.max(...(shapMatrix.map((row) => Math.abs(row[idx] ?? 0)))),
        cmax: Math.max(...(shapMatrix.map((row) => Math.abs(row[idx] ?? 0)))),
        showscale: false,
      },
      hovertemplate: `${name}<br>SHAP: %{x:.4f}<br>%{text}<extra></extra>`,
    }));
    return (
      <Plot
        data={traces}
        layout={{
          ...chartLayoutDefaults,
          title: 'Beeswarm-style SHAP distribution',
          margin: { l: 120, r: 24, t: 40, b: 120 },
          height: 440,
          xaxis: { title: 'SHAP value', tickfont: { color: '#cbd5e1' } },
          yaxis: { automargin: true, showticklabels: false, tickfont: { color: '#cbd5e1' } },
          legend: { orientation: 'h', y: -0.2, x: 0, font: { color: '#f8fafc' } },
        }}
        useResizeHandler
        style={{ width: '100%', minHeight: 440 }}
      />
    );
  }, [normalizedFeatureNames, shapMatrix, featureValues]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          Live SHAP Analyzer
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Explain predictions with your existing trained models</h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted sm:text-base">Upload a CSV or Excel file and generate SHAP summaries, feature importance, waterfall plots, and prediction tables using the already saved PharmaVigil models.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-gradient p-3 text-white"><UploadCloud className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold text-white">Upload Dataset</h2>
              <p className="text-sm text-muted">CSV or Excel (.xlsx)</p>
            </div>
          </div>
          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-12 text-center transition hover:border-primary/40 hover:bg-white/[0.05]">
            <FileSpreadsheet className="h-10 w-10 text-secondary" />
            <span className="mt-3 text-sm font-semibold text-white">Drop your file here or click to choose</span>
            <span className="mt-1 text-xs text-muted">Supported formats: CSV, XLSX</span>
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
          </label>
          {file && <p className="mt-3 text-sm text-white/70">Selected: {file.name}</p>}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Select Model</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {['classification', 'causality', 'regression'].map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                  <input type="radio" name="model" value={option} checked={model === option} onChange={() => setModel(option)} />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={generateAnalysis} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5">
            <BarChart3 className="h-4 w-4" /> Generate SHAP Analysis
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-secondary"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold text-white">Dataset Preview</h2>
              <p className="text-sm text-muted">Preview, validate, and inspect the uploaded data</p>
            </div>
          </div>
          {error && <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
          {success && <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</div>}
          {previewSummary.length > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-2">{previewSummary.map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p><p className="mt-1 text-2xl font-semibold text-white">{item.value}</p></div>)}</div>}
          {preview?.column_names && <div className="mt-6"><h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Columns</h3><div className="mt-3 flex flex-wrap gap-2">{preview.column_names.map((name: string) => <span key={name} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-white/80">{name}</span>)}</div></div>}
        </motion.div>
      </div>

      {report && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl border border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Analysis Report</h2>
              <p className="text-sm text-muted">Model: <span className="capitalize text-white">{report.model_used}</span></p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">Average Confidence: {report.average_confidence ?? 0}</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: 'Rows', value: report.rows },
            { label: 'Columns', value: report.columns },
            { label: 'Missing Values', value: report.missing_values },
            { label: 'Duplicate Rows', value: report.duplicate_rows },
          ].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p><p className="mt-1 text-xl font-semibold text-white">{item.value}</p></div>)}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {summaryPlot && (
              <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Global Summary</h3>
                  <div className="mt-4">{summaryPlot}</div>
                </div>
              </section>
            )}

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">SHAP Beeswarm</h3>
                  <p className="text-xs text-slate-400">Hover to inspect feature contributions per sample.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80">Interactive</div>
              </div>
              <div className="mt-4 flex-1">{beeswarmPlot || <p className="text-sm text-muted">Beeswarm plot data is unavailable for this dataset.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">SHAP Heatmap</h3>
                  <p className="text-xs text-slate-400">Visualize feature attribution across all samples.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80">Interactive</div>
              </div>
              <div className="mt-4 flex-1">{heatmapPlot || <p className="text-sm text-muted">Heatmap data is unavailable for this dataset.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Waterfall Explanation</h3>
                  <p className="text-xs text-slate-400">Top contributors for a selected sample.</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-muted">Sample</label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, shapMatrix.length)}
                    value={selectedSample + 1}
                    onChange={(event) => setSelectedSample(Math.max(0, Math.min(shapMatrix.length - 1, Number(event.target.value) - 1)))}
                    className="w-20 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex-1">{waterfallPlot || <p className="text-sm text-muted">Waterfall plot is unavailable for this dataset.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Decision Plot</h3>
                  <p className="text-xs text-slate-400">Cumulative SHAP path for the selected sample.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80">Interactive</div>
              </div>
              <div className="mt-4 flex-1">{decisionPlot || <p className="text-sm text-muted">Decision plot data is unavailable for this dataset.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Force Plot</h3>
                  <p className="text-xs text-slate-400">Feature contributions pushing the prediction up or down.</p>
                </div>
                <select
                  value={selectedFeature}
                  onChange={(event) => setSelectedFeature(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
                >
                  <option value="">Choose feature</option>
                  {normalizedFeatureNames.map((feature) => (
                    <option key={feature} value={feature}>{feature}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex-1">{forcePlot || <p className="text-sm text-muted">Select a feature or sample to render the force plot.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Decision Overview</h3>
                  <p className="text-xs text-slate-400">Compare decision paths for the first few samples.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80">Interactive</div>
              </div>
              <div className="mt-4 flex-1">{decisionOverviewPlot || <p className="text-sm text-muted">Decision overview data is unavailable for this dataset.</p>}</div>
            </section>

            <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">SHAP Violin</h3>
                  <p className="text-xs text-slate-400">Feature SHAP density distribution across samples.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80">Interactive</div>
              </div>
              <div className="mt-4 flex-1">{violinPlot || <p className="text-sm text-muted">Violin plot data is unavailable for this dataset.</p>}</div>
            </section>
          </div>
        </motion.div>
      )}
    </div>
  );
}
