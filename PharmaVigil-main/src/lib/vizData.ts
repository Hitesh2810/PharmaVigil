// Sample data powering the Visualizations dashboard.
// Realistic-shaped values representing a FAERS-style pharmacovigilance dataset.

export const shapFeatures = [
  { feature: 'Patient Age', shap: 0.24, direction: 'positive' as const, value: '68 yrs' },
  { feature: 'Drug Dose', shap: -0.12, direction: 'negative' as const, value: 'High' },
  { feature: 'Concomitant Drugs', shap: 0.18, direction: 'positive' as const, value: '4' },
  { feature: 'Weight', shap: -0.07, direction: 'negative' as const, value: '52 kg' },
  { feature: 'Reporter Type', shap: 0.15, direction: 'positive' as const, value: 'Physician' },
  { feature: 'Reaction Duration', shap: 0.09, direction: 'positive' as const, value: '11 days' },
  { feature: 'Gender', shap: -0.03, direction: 'negative' as const, value: 'Female' },
  { feature: 'Prior Allergies', shap: 0.11, direction: 'positive' as const, value: 'Yes' },
];

export const shapSummary = [
  { feature: 'Patient Age', value: 0.42, abs: 0.42 },
  { feature: 'Concomitant Drugs', value: 0.35, abs: 0.35 },
  { feature: 'Reporter Type', value: 0.28, abs: 0.28 },
  { feature: 'Drug Dose', value: -0.22, abs: 0.22 },
  { feature: 'Prior Allergies', value: 0.19, abs: 0.19 },
  { feature: 'Reaction Duration', value: 0.16, abs: 0.16 },
  { feature: 'Weight', value: -0.12, abs: 0.12 },
  { feature: 'Gender', value: -0.05, abs: 0.05 },
];

export const shapWaterfall = [
  { feature: 'Base', value: -0.10, cumulative: -0.1 },
  { feature: 'Patient Age', value: 0.24, cumulative: 0.14 },
  { feature: 'Concomitant Drugs', value: 0.18, cumulative: 0.32 },
  { feature: 'Reporter Type', value: 0.15, cumulative: 0.47 },
  { feature: 'Prior Allergies', value: 0.11, cumulative: 0.58 },
  { feature: 'Reaction Duration', value: 0.09, cumulative: 0.67 },
  { feature: 'Drug Dose', value: -0.12, cumulative: 0.55 },
  { feature: 'Weight', value: -0.07, cumulative: 0.48 },
  { feature: 'Gender', value: -0.03, cumulative: 0.45 },
];

export const shapDependence = Array.from({ length: 30 }, (_, i) => ({
  age: 20 + i * 2,
  shap: -0.25 + (i / 30) * 0.7 + (Math.sin(i) * 0.05),
  dose: 10 + i * 3,
}));

export const shapDecision = [
  { step: 'Expected', value: -0.1 },
  { step: '+Age', value: 0.14 },
  { step: '+Drugs', value: 0.32 },
  { step: '+Reporter', value: 0.47 },
  { step: '+Allergies', value: 0.58 },
  { step: '+Duration', value: 0.67 },
  { step: '-Dose', value: 0.55 },
  { step: '-Weight', value: 0.48 },
  { step: 'Final', value: 0.45 },
];

// ML performance
export const rocCurve = Array.from({ length: 50 }, (_, i) => {
  const fpr = i / 49;
  const tpr = Math.pow(fpr, 0.32);
  return { fpr, tpr: Math.min(tpr, 1) };
});

export const prCurve = Array.from({ length: 40 }, (_, i) => {
  const recall = i / 39;
  const precision = Math.max(0.3, 1 - Math.pow(recall, 2.2));
  return { recall, precision };
});

export const confusionMatrix = [
  { actual: 'Serious', predicted: 'Serious', value: 1240, label: 'TP' },
  { actual: 'Serious', predicted: 'Non-Serious', value: 96, label: 'FN' },
  { actual: 'Non-Serious', predicted: 'Serious', value: 82, label: 'FP' },
  { actual: 'Non-Serious', predicted: 'Non-Serious', value: 1082, label: 'TN' },
];

export const mlFeatureImportance = [
  { feature: 'Patient Age', importance: 0.21 },
  { feature: 'Concomitant Drugs', importance: 0.18 },
  { feature: 'Drug Dose', importance: 0.15 },
  { feature: 'Reporter Type', importance: 0.12 },
  { feature: 'Reaction Duration', importance: 0.11 },
  { feature: 'Prior Allergies', importance: 0.09 },
  { feature: 'Weight', importance: 0.08 },
  { feature: 'Gender', importance: 0.06 },
];

export const mlMetrics = [
  { label: 'Accuracy', value: 95.2, suffix: '%', accent: 'primary' },
  { label: 'Precision', value: 93.8, suffix: '%', accent: 'secondary' },
  { label: 'Recall', value: 92.8, suffix: '%', accent: 'accent' },
  { label: 'F1 Score', value: 93.3, suffix: '%', accent: 'primary' },
  { label: 'AUC', value: 0.97, suffix: '', accent: 'secondary' },
];

// Pharmacovigilance analytics
export const adverseEventFreq = [
  { name: 'Nausea', count: 4820 },
  { name: 'Headache', count: 4120 },
  { name: 'Dizziness', count: 3380 },
  { name: 'Rash', count: 2960 },
  { name: 'Fatigue', count: 2540 },
  { name: 'Vomiting', count: 2210 },
  { name: 'Diarrhea', count: 1980 },
  { name: 'Dyspnea', count: 1640 },
];

export const drugReports = [
  { name: 'Metformin', reports: 4200 },
  { name: 'Atorvastatin', reports: 3680 },
  { name: 'Omeprazole', reports: 3120 },
  { name: 'Lisinopril', reports: 2760 },
  { name: 'Amlodipine', reports: 2410 },
  { name: 'Simvastatin', reports: 2030 },
];

export const countryReports = [
  { name: 'USA', value: 38 },
  { name: 'UK', value: 18 },
  { name: 'India', value: 16 },
  { name: 'Germany', value: 12 },
  { name: 'Japan', value: 9 },
  { name: 'Other', value: 7 },
];

export const reporterTypes = [
  { name: 'Physician', value: 42 },
  { name: 'Pharmacist', value: 24 },
  { name: 'Consumer', value: 21 },
  { name: 'Other HCP', value: 13 },
];

export const seriousSplit = [
  { name: 'Serious', value: 58 },
  { name: 'Non-Serious', value: 42 },
];

export const severityDist = [
  { name: 'Mild', value: 34 },
  { name: 'Moderate', value: 38 },
  { name: 'Severe', value: 21 },
  { name: 'Life-threatening', value: 7 },
];

export const monthlyTrends = [
  { month: 'Jan', serious: 820, nonSerious: 610 },
  { month: 'Feb', serious: 910, nonSerious: 640 },
  { month: 'Mar', serious: 1020, nonSerious: 700 },
  { month: 'Apr', serious: 980, nonSerious: 690 },
  { month: 'May', serious: 1120, nonSerious: 740 },
  { month: 'Jun', serious: 1240, nonSerious: 780 },
  { month: 'Jul', serious: 1310, nonSerious: 820 },
  { month: 'Aug', serious: 1280, nonSerious: 800 },
];

export const forecastTrend = Array.from({ length: 12 }, (_, i) => {
  const base = 900 + i * 70;
  return {
    month: `M${i + 1}`,
    actual: i < 8 ? base + Math.sin(i) * 60 : null,
    forecast: i >= 7 ? base + 90 : null,
    lower: i >= 7 ? base + 20 : null,
    upper: i >= 7 ? base + 160 : null,
  };
});

export const scatterAgeOutcome = Array.from({ length: 60 }, (_, i) => ({
  age: 18 + Math.floor(Math.random() * 70) + (i % 5),
  severity: (i % 4) + 1,
  outcome: Math.min(1, (i / 60) * 1.2 + Math.random() * 0.2),
}));

// Heatmap-style matrix (reporter × severity)
export const heatmap = [
  { reporter: 'Physician', mild: 12, moderate: 18, severe: 9, lt: 3 },
  { reporter: 'Pharmacist', mild: 8, moderate: 11, severe: 4, lt: 1 },
  { reporter: 'Consumer', mild: 14, moderate: 6, severe: 1, lt: 0 },
  { reporter: 'Other HCP', mild: 6, moderate: 7, severe: 3, lt: 1 },
];

// System architecture
export const architectureModules = [
  { name: 'Dataset', icon: 'Database', desc: 'FAERS-style adverse-event reports' },
  { name: 'Preprocessing', icon: 'Wand2', desc: 'Cleaning, dedup, normalization' },
  { name: 'Feature Engineering', icon: 'SlidersHorizontal', desc: 'Encoding & demographic vectors' },
  { name: 'ML Model', icon: 'Brain', desc: 'Random Forest + ensemble training' },
  { name: 'Prediction Engine', icon: 'Cpu', desc: 'Seriousness & causality scoring' },
  { name: 'SHAP Explainability', icon: 'Sparkles', desc: 'Shapley value attribution' },
  { name: 'Visualization Dashboard', icon: 'BarChart3', desc: 'Interactive charts & KPIs' },
  { name: 'AI Chatbot', icon: 'MessageSquare', desc: 'Conversational assistant' },
  { name: 'User', icon: 'User', desc: 'Clinicians & regulators' },
];
