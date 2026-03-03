declare module "maath/random/dist/maath-random.esm" {
    export function inSphere(
        array: Float32Array,
        options?: { radius?: number; center?: number[] }
    ): Float32Array;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            group: any;
            mesh: any;
            icosahedronGeometry: any;
            meshStandardMaterial: any;
            ambientLight: any;
            pointLight: any;
        }
    }
}
