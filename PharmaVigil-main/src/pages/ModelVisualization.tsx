import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ChevronDown, Download, Expand, FileText, Maximize2, Search, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getVisualization } from '@/lib/api';

type Kind = 'classification' | 'causality' | 'regression';
type Row = Record<string, string>;
type Payload = { kind: Kind; model_info: Record<string, string | number>; metrics: Record<string, number>; report: string; predictions: Row[]; residuals: Row[]; plots: string[] };

const LABELS: Record<string, string> = {
  accuracy: 'Accuracy', precision: 'Precision', precision_macro: 'Precision', recall: 'Recall', recall_macro: 'Recall',
  f1_score: 'F1 Score', f1_macro: 'F1 Score', log_loss: 'Log Loss', roc_auc: 'ROC AUC', ROC_AUC: 'ROC AUC', RMSE: 'RMSE', MAE: 'MAE', MSE: 'MSE', R2: 'R² Score', adjusted_r2: 'Adjusted R²', 'Adjusted R2': 'Adjusted R²',
};
const descriptions: Record<string, string> = {
  roc: 'Receiver operating characteristic performance curve.', confusion: 'Observed versus predicted outcomes.', importance: 'Relative contribution of each feature.', actual: 'Distribution of observed target values.',
  residual: 'Prediction error diagnostic.', predicted: 'Actual values compared with model estimates.', shap: 'SHAP feature-attribution analysis.',
};

function pretty(value: string) { return value.replace(/[_-]/g, ' ').replace(/\.(png|jpe?g|svg)$/i, '').replace(/\b\w/g, c => c.toUpperCase()); }
function value(metric: number) { return Math.abs(metric) <= 1 ? `${(metric * 100).toFixed(2)}%` : metric.toFixed(4); }
function plotDescription(name: string) { const match = Object.entries(descriptions).find(([key]) => name.toLowerCase().includes(key)); return match?.[1] ?? 'Saved model visualization artifact.'; }
function isShap(name: string) { const lower = name.toLowerCase(); return lower.includes('shap') || (lower.startsWith('class_') && lower.includes('violin')); }

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-5"><h2 className="text-xl font-bold text-white">{title}</h2>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>;
}

function DataTable({ rows, filename }: { rows: Row[]; filename: string }) {
  const [query, setQuery] = useState(''); const [page, setPage] = useState(0); const [sort, setSort] = useState<string>('');
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const filtered = useMemo(() => rows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(query.toLowerCase()))).sort((a,b) => sort ? String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true }) : 0), [rows, query, sort]);
  const visible = filtered.slice(page * 8, page * 8 + 8);
  const download = () => { const csv = [headers.join(','), ...filtered.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = filename; a.click(); URL.revokeObjectURL(a.href); };
  if (!rows.length) return <div className="glass rounded-2xl p-6 text-sm text-muted">No saved table artifact is available for this model.</div>;
  return <div className="glass overflow-hidden rounded-2xl">
    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex max-w-sm items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-muted"><Search className="h-4 w-4"/><input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted" placeholder="Search saved predictions" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/></label><button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4"/> Export CSV</button></div>
    <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="sticky top-0 bg-surface text-xs uppercase tracking-wide text-muted"><tr>{headers.map(h => <th key={h} className="cursor-pointer whitespace-nowrap px-4 py-3" onClick={() => setSort(sort === h ? '' : h)}>{pretty(h)}</th>)}</tr></thead><tbody>{visible.map((row, i) => <tr key={i} className="border-t border-white/[.06] text-white/80">{headers.map(h => <td key={h} className="whitespace-nowrap px-4 py-3">{row[h]}</td>)}</tr>)}</tbody></table></div>
    <div className="flex items-center justify-between p-4 text-xs text-muted"><span>{filtered.length} records</span><div className="flex gap-2"><button disabled={!page} onClick={() => setPage(p => p - 1)} className="rounded border border-white/10 px-3 py-1 disabled:opacity-40">Previous</button><button disabled={(page + 1) * 8 >= filtered.length} onClick={() => setPage(p => p + 1)} className="rounded border border-white/10 px-3 py-1 disabled:opacity-40">Next</button></div></div>
  </div>;
}

function ImageModal({ kind, name, close }: { kind: Kind; name: string; close: () => void }) {
  const [zoom, setZoom] = useState(1); const src = `http://localhost:5000/api/visualization/${kind}/plot/${encodeURIComponent(name)}`;
  useEffect(() => { const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(); window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [close]);
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={close}><div className="flex h-full w-full max-w-6xl flex-col" onClick={e => e.stopPropagation()}><div className="mb-3 flex items-center justify-between text-white"><h3 className="font-semibold">{pretty(name)}</h3><div className="flex gap-2"><button onClick={() => setZoom(z => Math.max(.5, z-.2))} aria-label="Zoom out"><ZoomOut/></button><button onClick={() => setZoom(z => Math.min(3, z+.2))} aria-label="Zoom in"><ZoomIn/></button><a href={src} download={name} aria-label="Download"><Download/></a><button onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen"><Maximize2/></button><button onClick={close} aria-label="Close"><X/></button></div></div><div className="flex flex-1 items-center justify-center overflow-hidden"><motion.img drag dragConstraints={{ left: -600, right: 600, top: -400, bottom: 400 }} style={{ scale: zoom }} src={src} alt={pretty(name)} className="max-h-[82vh] max-w-full cursor-grab rounded-xl object-contain" /></div></div></div>;
}

function PlotCard({ kind, name, open }: { kind: Kind; name: string; open: () => void }) {
  const src = `http://localhost:5000/api/visualization/${kind}/plot/${encodeURIComponent(name)}`;
  return <motion.article whileHover={{ y: -4 }} className="glass group overflow-hidden rounded-2xl border border-white/[.08] transition-shadow hover:shadow-glow">
    <button onClick={open} className="block w-full overflow-hidden bg-black/20"><img loading="lazy" src={src} alt={pretty(name)} className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></button>
    <div className="p-4"><h3 className="font-semibold text-white">{pretty(name)}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-muted">{plotDescription(name)}</p><div className="mt-3 flex gap-2"><button onClick={open} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white"><Expand className="h-3.5 w-3.5"/> Expand</button><a href={src} download={name} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white"><Download className="h-3.5 w-3.5"/> Download</a><button onClick={open} className="ml-auto text-muted hover:text-white" aria-label="Fullscreen"><Maximize2 className="h-4 w-4"/></button></div></div>
  </motion.article>;
}

export default function ModelVisualization() {
  const routeKind = useParams().kind as Kind; const kind: Kind = ['classification', 'causality', 'regression'].includes(routeKind) ? routeKind : 'classification';
  const [data, setData] = useState<Payload | null>(null); const [error, setError] = useState(''); const [selected, setSelected] = useState<string | null>(null); const [reportOpen, setReportOpen] = useState(false);
  useEffect(() => { setData(null); setError(''); getVisualization(kind).then(r => setData(r.data)).catch(() => setError('The saved visualization artifacts could not be loaded. Please ensure the API is running.')); }, [kind]);
  const title = `${kind[0].toUpperCase()}${kind.slice(1)} Analytics`;
  if (error) return <div className="mx-auto max-w-7xl px-5 py-20"><div className="glass rounded-2xl p-8 text-center text-muted">{error}</div></div>;
  if (!data) return <div className="mx-auto max-w-7xl px-5 py-20"><div className="h-10 w-64 animate-pulse rounded bg-white/10"/><div className="mt-8 grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5"/>)}</div></div>;
  const metrics = Object.entries(data.metrics).filter(([key]) => LABELS[key]).filter(([key], i, all) => !(['precision_macro','recall_macro','f1_macro'].includes(key) && all.some(([other]) => other === key.replace('_macro',''))));
  const standardPlots = data.plots.filter(p => !isShap(p)); const shapPlots = data.plots.filter(isShap);
  return <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8"><div className="mb-9"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[.16em] text-muted"><BarChart3 className="h-3.5 w-3.5 text-secondary"/> Model artifacts</span><h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1><div className="mt-3 text-sm text-muted"><Link to="/visualizations" className="hover:text-white">Visualization</Link><span className="mx-2">/</span><span className="capitalize text-white">{kind}</span></div></div>
    <section className="mb-12"><SectionHeader title="Model information" subtitle="Metadata read directly from the saved model artifact."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(data.model_info).map(([label, item], i) => <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*.05 }} key={label} className="glass rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted">{pretty(label)}</p><p className="mt-2 break-words text-lg font-semibold text-white">{item}</p></motion.div>)}</div></section>
    <section className="mb-12"><SectionHeader title="Performance metrics"/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{metrics.map(([label, item], i) => <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*.05 }} key={label} className="glass rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted">{LABELS[label]}</p><p className="mt-2 text-2xl font-bold gradient-text-warm">{value(item)}</p></motion.div>)}</div></section>
    {kind !== 'regression' && <section className="mb-12"><SectionHeader title="Model report"/><div className="glass rounded-2xl"><button onClick={() => setReportOpen(v => !v)} className="flex w-full items-center justify-between p-5 text-left font-semibold text-white"><span className="flex items-center gap-2"><FileText className="h-5 w-5 text-secondary"/> Classification report</span><ChevronDown className={`transition ${reportOpen ? 'rotate-180' : ''}`}/></button>{reportOpen && <pre className="overflow-x-auto border-t border-white/10 p-5 text-xs leading-6 text-white/80">{data.report || 'No saved classification report is available.'}</pre>}</div></section>}
    {kind === 'regression' && <section className="mb-12"><SectionHeader title="Residual information" subtitle="Saved residual records and diagnostics."/><DataTable rows={data.residuals} filename="residuals.csv"/></section>}
    <section className="mb-12"><SectionHeader title={kind === 'regression' ? 'Regression visualizations' : 'Visualizations'} subtitle="Saved plots; opening a card enables zooming and panning."/><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{standardPlots.map(name => <PlotCard key={name} kind={kind} name={name} open={() => setSelected(name)}/>)}</div></section>
    <section className="mb-12"><SectionHeader title="SHAP analysis" subtitle="Available stored explainability visualizations."/><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{shapPlots.length ? shapPlots.map(name => <PlotCard key={name} kind={kind} name={name} open={() => setSelected(name)}/>) : <div className="glass rounded-2xl p-6 text-sm text-muted">No rendered SHAP plots are available. The original SHAP artifacts remain untouched.</div>}</div></section>
    <section><SectionHeader title="Prediction table" subtitle="Search, sort, page through, or export the saved prediction results."/><DataTable rows={data.predictions} filename={`${kind}_predictions.csv`}/></section>
    {selected && <ImageModal kind={kind} name={selected} close={() => setSelected(null)}/>}</div>;
}
