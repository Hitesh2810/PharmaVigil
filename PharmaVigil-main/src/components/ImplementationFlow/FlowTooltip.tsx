import { AnimatePresence, motion } from 'framer-motion';
import type { FlowNodeDefinition } from './FlowData';

type FlowTooltipProps = {
  node: FlowNodeDefinition | null;
};

export function FlowTooltip({ node }: FlowTooltipProps) {
  return (
    <AnimatePresence mode="wait">
      {node ? (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm rounded-2xl border border-cyan-400/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_80px_rgba(34,211,238,0.16)] backdrop-blur-xl"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-cyan-300/90">{node.technology}</p>
          <h3 className="mt-1 text-base font-semibold text-white">{node.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{node.description}</p>
          <p className="mt-2 text-xs text-slate-400">{node.purpose}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
