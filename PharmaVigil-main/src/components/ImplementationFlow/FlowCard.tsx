import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { FlowStep } from './FlowData';
import { BrandIcon } from './BrandIcon';

type FlowCardProps = {
  step: FlowStep;
  visible: boolean;
  active: boolean;
  complete: boolean;
  showStatus: boolean;
  dataikuDetailIndex: number;
};

const hoverTooltipMap: Record<string, string[]> = {
  dataset: [
    'Collected the Pharmacovigilance adverse event dataset.',
    'Contains patient, drug, batch, and adverse event information with 9000 rows.',
    'Serves as the primary input for the entire pipeline.',
  ],
  s3: [
    'Uploaded the raw dataset to an AWS S3 bucket.',
    'Used cloud storage for secure and scalable data management.',
    'Connected S3 with Snowflake for automated data ingestion.',
  ],
  'snowflake-raw': [
    'Loaded raw data from Amazon S3 into Snowflake.',
    'Preserved the original dataset without modifications.',
    'Used as the initial landing zone before preprocessing.',
  ],
  dataiku: [
    'Cleaned missing values and duplicate records.',
    'Standardized data formats and validated data quality.',
    'Prepared a clean dataset for analytics and machine learning.',
  ],
  staging: [
    'Stored cleaned and validated data.',
    'Performed transformation and validation checks.',
    'Prepared the dataset for warehouse modeling.',
  ],
  curated: [
    'Created analytics-ready datasets.',
    'Stored curated fact and dimension tables.',
    'Used as the source for machine learning models.',
  ],
  'star-schema': [
    'Designed one Fact table and five Dimension tables.',
    'Improved analytical query performance.',
    'Reduced redundancy through dimensional modeling.',
  ],
  sql: [
    'Created tables, views, and SQL transformations.',
    'Validated referential integrity and business rules.',
    'Generated optimized datasets for analysis.',
  ],
  eda: [
    'Analyzed feature distributions and class imbalance.',
    'Identified missing values and outliers.',
    'Generated insights for feature selection.',
  ],
  'feature-engineering': [
    'Encoded categorical variables.',
    'Created model-ready numerical features.',
    'Improved model performance through preprocessing.',
  ],
  'ml-models': [
    'Built models for Seriousness Prediction, Causality Prediction, and AE Volume Forecasting.',
    'Compared multiple algorithms to identify the best-performing model.',
    'Generated prediction results with confidence scores.',
  ],
  shap: [
    'Explained individual model predictions.',
    'Identified the most influential features.',
    'Improved transparency and trust in AI predictions.',
  ],
  'output-tables': [
    'Stored prediction results directly in Snowflake.',
    'Saved seriousness, causality, and forecasting outputs.',
    'Enabled easy reporting and downstream analysis.',
  ],
  production: [
    'Implemented batch inference for automated predictions.',
    'Configured scheduled scoring workflows.',
    'Added prediction drift monitoring for model reliability.',
  ],
  nextjs: [
    'Developed an interactive web interface.',
    'Displayed predictions and visual analytics.',
    'Improved user experience with a responsive dashboard.',
  ],
  flask: [
    'Built FAST APIs for machine learning inference.',
    'Connected frontend with backend prediction models.',
    'Returned prediction results in real time.',
  ],
  openrouter: [
    'Integrated Large Language Models (LLMs).',
    'Enabled AI-powered chatbot functionality.',
    'Generated intelligent responses to pharmacovigilance queries.',
  ],
  supabase: [
    'Managed user authentication securely.',
    'Stored chatbot conversation history.',
    'Maintained persistent backend database storage.',
  ],
  final: [
    'Integrated cloud, AI, machine learning, and web technologies.',
    'Automated adverse event analysis and prediction.',
    'Delivered a complete end-to-end pharmacovigilance solution.',
  ],
};

export function FlowCard({ step, visible, active, complete, showStatus, dataikuDetailIndex }: FlowCardProps) {
  const [hovered, setHovered] = useState(false);
  const tone = active
    ? 'border-cyan-400/30 bg-white/10 shadow-[0_30px_60px_rgba(34,211,238,0.12)]'
    : complete
    ? 'border-white/10 bg-slate-900/70'
    : 'border-white/10 bg-slate-950/30';

  const hoverBullets = useMemo(() => hoverTooltipMap[step.id] ?? [], [step.id]);

  return (
    <div className="group relative">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative overflow-hidden rounded-[2rem] border px-5 py-5 min-h-[155px] shadow-2xl transition duration-300 ${tone} ${hovered ? 'scale-[1.005] shadow-[0_35px_80px_rgba(15,23,42,0.22)]' : ''}`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-3xl border ${active ? 'border-cyan-300/50 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.12)]' : 'border-white/10 bg-slate-900 text-slate-200'}`}>
            <BrandIcon step={step} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-base font-semibold tracking-tight ${active ? 'text-white' : 'text-slate-100'}`}>{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.subtitle}</p>
          </div>
        </div>

        {active && showStatus ? (
          <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
            {step.status}
          </div>
        ) : null}

        {step.detailSteps && active ? (
          <div className="mt-5 space-y-2 rounded-[1.75rem] border border-slate-800/80 bg-slate-950/70 p-4 text-sm text-slate-300">
            {step.detailSteps.map((detail, index) => (
              <div key={detail} className={`flex items-center gap-3 ${index === dataikuDetailIndex ? 'text-cyan-200 font-semibold' : 'text-slate-500'}`}>
                <span className={`block h-2.5 w-2.5 rounded-full ${index === dataikuDetailIndex ? 'bg-cyan-300' : 'bg-slate-700'}`} />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>

      {hoverBullets.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 10 }}
          animate={hovered ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.95, x: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-full top-1/2 z-20 ml-4 w-[min(22rem,calc(100vw-3rem))] -translate-y-1/2 rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-[0_35px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="mb-3 text-xs uppercase tracking-[0.35em] text-slate-300">Details</div>
          <ul className="space-y-3 text-sm leading-6 text-slate-100">
            {hoverBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </div>
  );
}
