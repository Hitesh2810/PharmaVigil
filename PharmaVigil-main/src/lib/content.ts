export interface NavLink {
  label: string;
  to: string;
}

export const navLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'AI Chatbot', to: '/chatbot' },
  { label: 'Visualizations', to: '/visualizations' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
}

export interface Tech {
  name: string;
}

export const features: Feature[] = [
  {
    icon: 'Brain',
    title: 'AI Prediction',
    description:
      'Random Forest & ensemble models classify adverse-event seriousness and assess causality with high confidence.',
  },
  {
    icon: 'Sparkles',
    title: 'Explainable AI',
    description:
      'Every prediction ships with a transparent rationale so clinicians can trust and audit the model output.',
  },
  {
    icon: 'BarChart3',
    title: 'SHAP Visualization',
    description:
      'Summary, waterfall, force, and dependence plots reveal exactly which features drive each prediction.',
  },
  {
    icon: 'LayoutDashboard',
    title: 'Interactive Dashboard',
    description:
      'A real-time analytics surface with ROC curves, confusion matrices, and pharmacovigilance trends.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Drug Safety Monitoring',
    description:
      'Continuous signal detection across drug reports helps regulators act on emerging safety concerns.',
  },
  {
    icon: 'MessageSquare',
    title: 'AI Chatbot',
    description:
      'A conversational assistant explains predictions, SHAP values, and pharmacovigilance concepts on demand.',
  },
];

export const workflow: WorkflowStep[] = [
  {
    step: '01',
    title: 'Upload Dataset',
    description: 'Adverse-event reports are ingested from FAERS-style CSV sources.',
  },
  {
    step: '02',
    title: 'Preprocessing',
    description: 'Cleaning, deduplication, normalization, and label encoding.',
  },
  {
    step: '03',
    title: 'ML Prediction',
    description: 'Ensemble models classify seriousness and causality in real time.',
  },
  {
    step: '04',
    title: 'SHAP Explanation',
    description: 'Shapley values attribute contribution to every input feature.',
  },
  {
    step: '05',
    title: 'Visualization',
    description: 'Interactive charts render insights across the dashboard.',
  },
  {
    step: '06',
    title: 'AI Chatbot',
    description: 'Conversational access to predictions, explanations, and data.',
  },
];

export const stats: Stat[] = [
  { label: 'Prediction Accuracy', value: 95.2, suffix: '%', decimals: 1 },
  { label: 'Drug Reports Analyzed', value: 100, suffix: 'K+' },
  { label: 'Visualizations', value: 50, suffix: '+' },
  { label: 'Explainable AI', value: 100, suffix: '%' },
];

export const technologies: Tech[] = [
  { name: 'Python' },
  { name: 'Scikit-learn' },
  { name: 'SHAP' },
  { name: 'React' },
  { name: 'Tailwind' },
  { name: 'Recharts' },
  { name: 'Pandas' },
  { name: 'NumPy' },
  { name: 'Matplotlib' },
  { name: 'OpenAI API' },
  { name: 'Gemini API' },
];
