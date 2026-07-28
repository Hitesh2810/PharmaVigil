import { type SuggestedPrompt } from './chat';

export const suggestedPrompts: SuggestedPrompt[] = [
  { icon: 'Pill', prompt: 'What is Pharmacovigilance?', category: 'Concepts' },
  { icon: 'Sparkles', prompt: 'Explain SHAP.', category: 'Explainable AI' },
  { icon: 'Brain', prompt: 'How does the prediction work?', category: 'Model' },
  { icon: 'Trees', prompt: 'Explain Random Forest.', category: 'Model' },
  { icon: 'ClipboardCheck', prompt: 'What is Causality Assessment?', category: 'Concepts' },
  { icon: 'AlertTriangle', prompt: 'What is Seriousness Prediction?', category: 'Model' },
  { icon: 'Database', prompt: 'What dataset does the project use?', category: 'Data' },
  { icon: 'LineChart', prompt: 'What visualizations are available?', category: 'Dashboard' },
  { icon: 'Rocket', prompt: 'What is the future scope of the project?', category: 'Project' },
];

type Knowledge = Record<string, string>;

const knowledge: Knowledge = {
  'what is pharmacovigilance?':
    'Pharmacovigilance (PV) is the science and activities relating to the detection, assessment, understanding, and prevention of adverse effects or any other drug-related problem. It is defined by the WHO as a critical part of the medicines lifecycle that ensures the continued safety of pharmaceutical products after they reach the market. Core activities include adverse-event report collection, signal detection, risk evaluation, and benefit-risk assessment.',
  'explain shap.':
    "SHAP (SHapley Additive exPlanations) is a game-theoretic approach to explain the output of any machine learning model. It assigns each feature an importance value for a particular prediction by computing Shapley values from cooperative game theory. In PharmaVigil AI, SHAP attributes how much each patient or drug feature — such as age, dose, or reporter type — pushed a prediction toward 'Serious' or 'Non-Serious', producing a transparent, auditable rationale.",
  'how does the prediction work?':
    'The prediction engine ingests cleaned adverse-event reports, engineers features (patient demographics, drug attributes, reaction codes), and feeds them into an ensemble of tree-based classifiers — primarily Random Forest with gradient boosting support. The model outputs two outcomes: (1) Seriousness classification (Serious vs Non-Serious) and (2) Causality assessment (certain, probable, possible, doubtful). Each prediction is paired with SHAP values so clinicians see exactly which features drove the decision.',
  'explain random forest.':
    'Random Forest is an ensemble learning method that constructs a multitude of decision trees during training and outputs the mode of the classes (classification) or mean prediction (regression) of the individual trees. It reduces overfitting by averaging many decorrelated trees built on random subsets of data and features. We chose Random Forest for pharmacovigilance because it handles mixed feature types, is robust to noise in adverse-event reports, and — critically — pairs naturally with SHAP for tree-based explanations.',
  'what is causality assessment?':
    'Causality assessment evaluates the likelihood that a specific drug caused an observed adverse event. PharmaVigil AI uses a structured approach inspired by the WHO-UMC system, classifying causality into four categories: Certain, Probable, Possible, and Doubtful. The model considers temporal relationship, dechallenge/rechallenge, alternative causes, and plausibility — then explains its assessment with SHAP feature contributions.',
  'what is seriousness prediction?':
    "Seriousness prediction classifies an adverse event as 'Serious' or 'Non-Serious' per ICH E2D criteria. A serious event is one that results in death, is life-threatening, requires hospitalization or prolongation, causes persistent disability, or is a congenital anomaly. Accurate automated seriousness classification helps regulators triage thousands of reports and prioritize follow-up on the most consequential cases.",
  'what dataset does the project use?':
    'The project uses FAERS-style (FDA Adverse Event Reporting System) adverse-event reports containing patient demographics, drug information, reaction terms (MedDRA), outcomes, and reporter metadata. Records are deduplicated, normalized, and label-encoded. The synthetic sample dashboard represents over 100,000 reports across multiple countries and reporter types.',
  'what visualizations are available?':
    'The Visualizations page covers four areas: (1) SHAP Explainability — summary, waterfall, force, dependence, and decision plots with natural-language explanations; (2) ML Performance — ROC curve, precision-recall, confusion matrix, and metric cards; (3) Pharmacovigilance Analytics — adverse-event frequency, drug-wise and country-wise reports, reporter distribution, serious vs non-serious split, monthly trends, and forecast; (4) System Architecture — an animated end-to-end pipeline diagram.',
  'what is the future scope of the project?':
    'Future enhancements include live hospital EHR integration, cloud deployment with autoscaling, real-time streaming signal detection, deep learning models (LSTM/Transformer) for sequence-aware adverse-event prediction, retrieval-augmented generation (RAG) for the chatbot over medical literature, and a voice assistant for hands-free clinical queries.',
};

const fallback =
  "I'm PharmaVigil AI's assistant, focused on pharmacovigilance, adverse-event prediction, SHAP explainability, and this project. I can explain concepts like Pharmacovigilance, SHAP, causality assessment, Random Forest, seriousness prediction, the dataset, available visualizations, and future scope. Could you rephrase your question around one of those topics?";

export function getBotResponse(prompt: string): string {
  const normalized = prompt.toLowerCase().trim();
  const direct = knowledge[normalized];
  if (direct) return direct;

  for (const key of Object.keys(knowledge)) {
    const keywords = key.replace('what is ', '').replace('explain ', '').replace('?', '').split(' ');
    if (keywords.some((kw) => kw.length > 3 && normalized.includes(kw))) {
      return knowledge[key];
    }
  }

  if (normalized.includes('hi') || normalized.includes('hello') || normalized.includes('hey')) {
    return "Hello! I'm PharmaVigil AI. Ask me about pharmacovigilance, SHAP, our prediction models, causality assessment, the dataset, or the project's future scope.";
  }
  if (normalized.includes('accuracy')) {
    return 'The ensemble model achieves approximately 95.2% prediction accuracy on the seriousness classification task, with strong precision and recall balanced across both classes — see the ML Performance section on the Visualizations page for the full metrics and ROC curve.';
  }
  if (normalized.includes('who') && normalized.includes('built')) {
    return 'PharmaVigil AI is a Final Year B.Tech Capstone project exploring how explainable machine learning can improve pharmacovigilance workflows.';
  }

  return fallback;
}
