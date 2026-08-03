import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Bot,
  Cloud,
  Cpu,
  Database,
  DatabaseZap,
  FlaskConical,
  Globe,
  LayoutGrid,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

export type FlowStep = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  icon: LucideIcon;
  logo: 'aws' | 'snowflake' | 'dataiku' | 'nextjs' | 'flask' | 'supabase' | 'openrouter' | 'default';
  detailSteps?: string[];
};

export const flowSteps: FlowStep[] = [
  { id: 'dataset', title: 'Data Source', subtitle: 'Raw Pharmacovigilance Dataset', status: 'Loading dataset...', icon: Database, logo: 'default' },
  { id: 's3', title: 'Amazon S3', subtitle: 'Raw bucket storage', status: 'Uploading dataset...', icon: Cloud, logo: 'aws' },
  { id: 'snowflake-raw', title: 'Snowflake RAW', subtitle: 'Landing zone schema', status: 'Creating stage...', icon: DatabaseZap, logo: 'snowflake' },
  { id: 'dataiku', title: 'Dataiku DSS', subtitle: 'Data preparation studio', status: 'Cleaning data...', icon: Workflow, logo: 'dataiku', detailSteps: ['Data Cleaning', 'Data Preprocessing', 'Data Standardization', 'Missing Value Handling', 'Duplicate Removal', 'Data Quality Validation'] },
  { id: 'staging', title: 'Snowflake STAGING', subtitle: 'Validated working layer', status: 'Loading to Snowflake...', icon: DatabaseZap, logo: 'snowflake' },
  { id: 'curated', title: 'Snowflake CURATED', subtitle: 'Trusted analytics layer', status: 'Curating tables...', icon: ShieldCheck, logo: 'snowflake' },
  { id: 'star-schema', title: 'Star Schema', subtitle: 'Fact/dimension model', status: 'Designing schema...', icon: LayoutGrid, logo: 'default' },
  { id: 'sql', title: 'SQL Implementation', subtitle: 'Business logic and validation', status: 'Writing SQL...', icon: Database, logo: 'default' },
  { id: 'eda', title: 'EDA', subtitle: 'Exploratory data analysis', status: 'Profiling data...', icon: BarChart3, logo: 'default' },
  { id: 'feature-engineering', title: 'Feature Engineering', subtitle: 'Model signal creation', status: 'Building features...', icon: Sparkles, logo: 'default' },
  { id: 'ml-models', title: 'ML Models', subtitle: 'Predictive model stack', status: 'Training model...', icon: Cpu, logo: 'default' },
  { id: 'shap', title: 'SHAP Explainability', subtitle: 'Feature impact insight', status: 'Generating SHAP...', icon: ScanSearch, logo: 'default' },
  { id: 'output-tables', title: 'Snowflake Output Tables', subtitle: 'Predictions and scores', status: 'Saving predictions...', icon: Database, logo: 'snowflake' },
  { id: 'production', title: 'Production', subtitle: 'Operational deployment', status: 'Deploying workflow...', icon: Rocket, logo: 'default' },
  { id: 'nextjs', title: 'Next.js', subtitle: 'Frontend interface', status: 'Rendering insights...', icon: Globe, logo: 'nextjs' },
  { id: 'flask', title: 'Flask API', subtitle: 'Backend services', status: 'Serving endpoints...', icon: FlaskConical, logo: 'flask' },
  { id: 'openrouter', title: 'OpenRouter', subtitle: 'LLM orchestration', status: 'Starting AI Assistant...', icon: Bot, logo: 'openrouter' },
  { id: 'supabase', title: 'Supabase', subtitle: 'Persistent database', status: 'Syncing records...', icon: DatabaseZap, logo: 'supabase' },
  { id: 'final', title: 'Intelligent Pharmacovigilance Platform', subtitle: 'Enterprise AI platform', status: 'Ready for action.', icon: Activity, logo: 'default' },
];
