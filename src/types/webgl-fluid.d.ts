declare module "webgl-fluid" {
  type FluidConfig = Record<string, unknown>;
  export default function WebGLFluid(
    canvas: HTMLCanvasElement,
    config?: FluidConfig,
  ): void;
}
