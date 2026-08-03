// @ts-nocheck
import { Float, RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { JSX } from 'react';
import * as THREE from 'three';
import type { FlowNodeDefinition } from './FlowData';
import type { Mesh } from 'three';

type FlowNodeProps = {
  node: FlowNodeDefinition;
  active: boolean;
  hovered: boolean;
  onHover: (node: FlowNodeDefinition | null) => void;
};

export function FlowNode({ node, active, hovered, onHover }: FlowNodeProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state: { clock: { elapsedTime: number } }) => {
    if (!meshRef.current) return;
    const pulse = active ? 1 + 0.08 * Math.sin(state.clock.elapsedTime * 5.5) : 1;
    meshRef.current.scale.setScalar(hovered ? pulse + 0.08 : pulse);
    meshRef.current.rotation.y += 0.008;
  });

  const label = node.title.length > 20 ? `${node.title.slice(0, 20)}…` : node.title;

  return (
    <Float speed={1.35} rotationIntensity={0.2} floatIntensity={0.35}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => onHover(node)}
          onPointerOut={() => onHover(null)}
          castShadow
          receiveShadow
        >
          <RoundedBox args={[1.7, 0.95, 0.25]} radius={0.16}>
            <meshPhysicalMaterial
              color={active ? '#1f6fff' : '#09152d'}
              emissive={active ? '#2acdfc' : '#071120'}
              emissiveIntensity={active ? 0.95 : 0.18}
              metalness={0.28}
              roughness={0.22}
              clearcoat={1}
              transmission={0.24}
              thickness={0.4}
              transparent
              opacity={0.95}
            />
          </RoundedBox>
        </mesh>
        <Text
          position={[0, 0, 0.18]}
          fontSize={0.13}
          color={active ? '#f6fbff' : '#dceeff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.0}
          textAlign="center"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}
