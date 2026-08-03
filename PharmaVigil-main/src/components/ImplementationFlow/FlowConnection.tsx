// @ts-nocheck
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { JSX } from 'react';
import * as THREE from 'three';
import type { Group } from 'three';

type FlowConnectionProps = {
  from: [number, number, number];
  to: [number, number, number];
  active: boolean;
  branch?: boolean;
};

export function FlowConnection({ from, to, active, branch }: FlowConnectionProps) {
  const start = useMemo(() => new THREE.Vector3(...from), [from]);
  const end = useMemo(() => new THREE.Vector3(...to), [to]);
  const sphereRef = useRef<Group>(null);
  const progressRef = useRef(0);

  useFrame((_: unknown, delta: number) => {
    if (!sphereRef.current) return;

    progressRef.current = active
      ? (progressRef.current + delta * 0.55) % 1
      : 0;

    const point = new THREE.Vector3().lerpVectors(start, end, progressRef.current);
    sphereRef.current.position.copy(point);
    sphereRef.current.scale.setScalar(active ? 1 : 0.2);
  });

  return (
    <group>
      <Line
        points={[start, end]}
        color={active ? '#3ddcff' : branch ? '#7f8cff' : '#5b7bff'}
        lineWidth={active ? 2.2 : branch ? 1.1 : 0.8}
        transparent
        opacity={active ? 0.95 : 0.38}
      />
      <group ref={sphereRef}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={active ? '#e8fdff' : '#7ff7ff'} />
        </mesh>
      </group>
    </group>
  );
}
