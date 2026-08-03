// @ts-nocheck
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Camera } from 'three';

type CameraAnimationProps = {
  target: [number, number, number];
  paused: boolean;
};

export function CameraAnimation({ target, paused }: CameraAnimationProps) {
  const { camera } = useThree();
  const basePosition = useMemo(() => new THREE.Vector3(0, 5, 18), []);
  const targetPosition = useMemo(() => new THREE.Vector3(...target), [target]);

  useFrame((state: { clock: { elapsedTime: number } }, delta: number) => {
    if (paused) return;

    const t = state.clock.elapsedTime * 0.2;
    const drift = new THREE.Vector3(
      Math.sin(t) * 0.7,
      3.6 + Math.cos(t * 0.8) * 0.8,
      16 + Math.sin(t * 0.5) * 2.2,
    );

    const lookAtTarget = new THREE.Vector3(targetPosition.x, targetPosition.y + 0.2, targetPosition.z);
    const desired = new THREE.Vector3().copy(basePosition).add(drift).add(new THREE.Vector3(targetPosition.x * 0.04, 0, 0));

    camera.position.lerp(desired, 0.02 + delta * 0.25);
    camera.lookAt(lookAtTarget);
    camera.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.025;
  });

  return null;
}
