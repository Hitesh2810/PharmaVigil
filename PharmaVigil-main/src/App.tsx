import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { PageTransition } from '@/components/PageTransition';
import Home from '@/pages/Home';
import Chatbot from '@/pages/Chatbot';
import Visualizations from '@/pages/Visualizations';
import ModelVisualization from '@/pages/ModelVisualization';
import ModelComparison from '@/pages/ModelComparison';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import LiveShapAnalyzer from '@/pages/LiveShapAnalyzer';

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/chatbot" element={<PageTransition><Chatbot /></PageTransition>} />
          <Route path="/visualizations" element={<PageTransition><Visualizations /></PageTransition>} />
          <Route path="/visualization/:kind" element={<PageTransition><ModelVisualization /></PageTransition>} />
          <Route path="/model-comparison" element={<PageTransition><ModelComparison /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/live-shap" element={<PageTransition><LiveShapAnalyzer /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
