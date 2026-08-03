declare module '@react-three/fiber' {
  export function Canvas(props: any): any;
  export function useFrame(callback: any): void;
  export function useThree(): any;

  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
      meshPhysicalMaterial: any;
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

declare module '@react-three/drei' {
  export const Sparkles: any;
  export const Stars: any;
  export const Float: any;
  export const RoundedBox: any;
  export const Text: any;
  export const Line: any;
}
