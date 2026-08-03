import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

const classificationData = [
  ['Logistic Regression', '0.470588', '0.466387', '0.470588', '0.466873', '0.277778', false],
  ['Random Forest', '0.470588', '0.473856', '0.470588', '0.470588', '0.541667', true],
  ['XGBoost', '0.352941', '0.355392', '0.352941', '0.352941', '0.416667', false],
];

const causalityData = [
  ['Multinomial Logistic Regression', '0.235294', '0.166667', '0.166667', '0.160000', '1.860716', true],
  ['XGBoost Multi-class', '0.235294', '0.110000', '0.166667', '0.132143', '2.994502', false],
];

const regressionData = [
  ['Poisson Regression', '0.346498', '0.210407', '-0.038989', true],
  ['XGBoost Regressor', '0.527190', '0.339768', '-1.405157', false],
];

function SummaryCard({ title, model, score, accent }: { title: string; model: string; score: string; accent?: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-4 shadow-lg ${accent ?? 'bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500'}`}>
      <div className="rounded-full bg-white/10 p-3">
        <CheckCircle2 className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="text-xs text-white/80 uppercase tracking-wider">{title}</div>
        <div className="mt-1 flex items-baseline gap-3">
          <div className="text-lg font-semibold text-white">{model}</div>
          <div className="text-sm text-white/80">{score}</div>
        </div>
      </div>
    </div>
  );
}

export default function ModelComparison() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">🏆 Model Comparison (MC)</h1>
        <p className="mt-2 text-sm text-muted">A concise comparison of classification, causality and regression models.</p>
      </div>

      <div className="space-y-8">
        {/* Classification Section: summary card above full-width table */}
        <div className="space-y-4">
          <SummaryCard title="Best Classification" model="Random Forest" score="ROC-AUC: 0.541667" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">📊 Classification Models</h3>
                <p className="text-xs text-slate-400">Performance metrics across classification models.</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-gradient-to-r from-blue-800 to-purple-700 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Model</th>
                    <th className="px-3 py-2 text-right">Accuracy</th>
                    <th className="px-3 py-2 text-right">Precision</th>
                    <th className="px-3 py-2 text-right">Recall</th>
                    <th className="px-3 py-2 text-right">F1 Score</th>
                    <th className="px-3 py-2 text-right">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  {classificationData.map((row, idx) => {
                    const isBest = row[6] as boolean;
                    return (
                      <tr key={row[0] as string} className={`${idx % 2 === 0 ? 'bg-white/3' : 'bg-white/2'} ${isBest ? 'transform scale-102 ring-4 ring-yellow-400/20 shadow-lg' : ''}`}>
                        <td className={`px-3 py-3 font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                          <div className="flex items-center gap-2">
                            {isBest && <div className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 p-2"><Trophy className="h-4 w-4 text-white" /></div>}
                            <span className={isBest ? 'font-bold' : ''}>{row[0]}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[1]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[2]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[3]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[4]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-500' : 'text-white/80'}`}>{row[5]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Causality Section */}
        <div className="space-y-4">
          <SummaryCard title="Best Causality" model="Multinomial Logistic" score="Log Loss: 1.860716" accent="bg-gradient-to-r from-yellow-600 via-amber-500 to-rose-500" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">🧠 Causality Models</h3>
                <p className="text-xs text-slate-400">Macro-averaged metrics for causality classification.</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-gradient-to-r from-blue-800 to-purple-700 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Model</th>
                    <th className="px-3 py-2 text-right">Accuracy</th>
                    <th className="px-3 py-2 text-right">Precision (Macro)</th>
                    <th className="px-3 py-2 text-right">Recall (Macro)</th>
                    <th className="px-3 py-2 text-right">F1 Score (Macro)</th>
                    <th className="px-3 py-2 text-right">Log Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {causalityData.map((row, idx) => {
                    const isBest = row[6] as boolean;
                    return (
                      <tr key={row[0] as string} className={`${idx % 2 === 0 ? 'bg-white/3' : 'bg-white/2'} ${isBest ? 'transform scale-102 ring-4 ring-yellow-400/20 shadow-lg' : ''}`}>
                        <td className={`px-3 py-3 font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                          <div className="flex items-center gap-2">
                            {isBest && <div className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 p-2"><Trophy className="h-4 w-4 text-white" /></div>}
                            <span className={isBest ? 'font-bold' : ''}>{row[0]}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[1]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[2]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[3]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[4]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-500' : 'text-white/80'}`}>{row[5]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Regression Section */}
        <div className="space-y-4">
          <SummaryCard title="Best Regression" model="Poisson Regression" score="RMSE: 0.346498" accent="bg-gradient-to-r from-emerald-600 via-lime-500 to-yellow-400" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">📈 Regression Models</h3>
                <p className="text-xs text-slate-400">Key regression metrics.</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-gradient-to-r from-blue-800 to-purple-700 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Model</th>
                    <th className="px-3 py-2 text-right">RMSE</th>
                    <th className="px-3 py-2 text-right">MAE</th>
                    <th className="px-3 py-2 text-right">R² Score</th>
                  </tr>
                </thead>
                <tbody>
                  {regressionData.map((row, idx) => {
                    const isBest = row[4] as boolean;
                    return (
                      <tr key={row[0] as string} className={`${idx % 2 === 0 ? 'bg-white/3' : 'bg-white/2'} ${isBest ? 'transform scale-102 ring-4 ring-yellow-400/20 shadow-lg' : ''}`}>
                        <td className={`px-3 py-3 font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
                          <div className="flex items-center gap-2">
                            {isBest && <div className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 p-2"><Trophy className="h-4 w-4 text-white" /></div>}
                            <span className={isBest ? 'font-bold' : ''}>{row[0]}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-500' : 'text-white/80'}`}>{row[1]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[2]}</td>
                        <td className={`px-3 py-3 text-right ${isBest ? 'font-bold text-green-400' : 'text-white/80'}`}>{row[3]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
