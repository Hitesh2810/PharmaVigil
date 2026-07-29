import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, FileSpreadsheet, Sparkles, UploadCloud } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface ReportData {
  model_used?: string;
  rows?: number;
  columns?: number;
  missing_values?: number;
  duplicate_rows?: number;
  average_confidence?: number;
  feature_names?: string[];
  predictions?: Array<{ prediction?: string; confidence?: number; probability?: number }>;
  plots?: Record<string, string>;
}

export default function LiveShapAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState('classification');
  const [featureName, setFeatureName] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [report, setReport] = useState<ReportData | null>(null);
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
      if (featureName) formData.append('feature_name', featureName);
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

  const hexToBase64 = (hex: string) => {
    const normalized = hex.replace(/\s+/g, '');
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  };

  const previewSummary = useMemo(() => preview ? [
    { label: 'Rows', value: preview.rows },
    { label: 'Columns', value: preview.columns },
    { label: 'Missing Values', value: preview.missing_values },
    { label: 'Duplicate Rows', value: preview.duplicate_rows },
  ] : [], [preview]);

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

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Prediction Table</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-left text-white/80">
                <thead><tr className="border-b border-white/10 text-muted"><th className="px-3 py-2">Prediction</th><th className="px-3 py-2">Confidence</th><th className="px-3 py-2">Probability</th></tr></thead>
                <tbody>{(report.predictions || []).map((row, index) => <tr key={index} className="border-b border-white/10"><td className="px-3 py-2">{row.prediction}</td><td className="px-3 py-2">{(row.confidence ?? 0).toFixed(4)}</td><td className="px-3 py-2">{(row.probability ?? 0).toFixed(4)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {report.plots?.summary_plot ? <img src={`data:image/png;base64,${hexToBase64(report.plots.summary_plot)}`} alt="SHAP summary plot" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.feature_importance ? <img src={`data:image/png;base64,${hexToBase64(report.plots.feature_importance)}`} alt="Feature importance plot" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.beeswarm_plot ? <img src={`data:image/png;base64,${hexToBase64(report.plots.beeswarm_plot)}`} alt="Beeswarm plot" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.heatmap ? <img src={`data:image/png;base64,${hexToBase64(report.plots.heatmap)}`} alt="Heatmap" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.waterfall_plot ? <img src={`data:image/png;base64,${hexToBase64(report.plots.waterfall_plot)}`} alt="Waterfall plot" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.dependence_plot ? <img src={`data:image/png;base64,${hexToBase64(report.plots.dependence_plot)}`} alt="Dependence plot" className="w-full rounded-2xl border border-white/10" /> : null}
            {report.plots?.decision_plot ? <img src={`data:image/png;base64,${hexToBase64(report.plots.decision_plot)}`} alt="Decision plot" className="w-full rounded-2xl border border-white/10" /> : null}
          </div>
        </motion.div>
      )}
    </div>
  );
}
