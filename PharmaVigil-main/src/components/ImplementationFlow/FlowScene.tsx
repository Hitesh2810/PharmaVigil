// @ts-nocheck
import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import { useMemo } from 'react';
import type { JSX } from 'react';
import { CameraAnimation } from './CameraAnimation';
import { FlowConnection } from './FlowConnection';
import { FlowNode } from './FlowNode';
import { flowConnections, flowNodes, type FlowNodeDefinition } from './FlowData';

type FlowSceneProps = {
  activeNode: FlowNodeDefinition | null;
  hoveredNode: FlowNodeDefinition | null;
  onHover: (node: FlowNodeDefinition | null) => void;
  paused: boolean;
};

export function FlowScene({ activeNode, hoveredNode, onHover, paused }: FlowSceneProps) {
  const activeIndex = useMemo(() => {
    if (!activeNode) return 0;
    return flowNodes.findIndex((node) => node.id === activeNode.id);
  }, [activeNode]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <Canvas camera={{ position: [0, 4, 18], fov: 52 }} dpr={[1, 2]}>
        <color attach="background" args={['#040816']} />
        <fog attach="fog" args={['#040816', 18, 34]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 10, 6]} intensity={1.8} color="#7ae7ff" />
        <pointLight position={[0, 0, 0]} intensity={1.4} color="#73a8ff" />
        <Stars radius={50} depth={70} count={2200} factor={4} saturation={0} fade speed={0.7} />
        <Sparkles count={180} scale={20} size={2.4} position={[0, 2, 0]} speed={0.35} opacity={0.7} />
        <CameraAnimation target={activeNode?.position ?? [0, 1.6, 0]} paused={paused} />
        {flowConnections.map((connection, index) => {
          const from = flowNodes.find((node) => node.id === connection.fromId)?.position ?? [0, 0, 0];
          const to = flowNodes.find((node) => node.id === connection.toId)?.position ?? [0, 0, 0];
          const active = index <= activeIndex;
          return (
            <FlowConnection
              key={`${connection.fromId}-${connection.toId}`}
              from={from as [number, number, number]}
              to={to as [number, number, number]}
              active={active}
              branch={connection.branch}
            />
          );
        })}
        {flowNodes.map((node) => {
          const active = activeIndex >= 0 && node.id === flowNodes[activeIndex]?.id;
          return (
            <FlowNode
              key={node.id}
              node={node}
              active={active}
              hovered={hoveredNode?.id === node.id}
              onHover={onHover}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
