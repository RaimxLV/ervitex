import { useEffect, useRef } from "react";
import heroImage from "@/assets/hero/screenprint-hero.jpg";
import heroDepth from "@/assets/hero/screenprint-hero-depth.png";

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_image;
  uniform sampler2D u_depth;
  uniform vec2 u_resolution;
  uniform vec2 u_imageSize;
  uniform float u_shift;

  void main() {
    vec2 uv = v_uv;
    float screenAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageSize.x / u_imageSize.y;

    if (screenAspect > imageAspect) {
      float scale = imageAspect / screenAspect;
      uv.y = uv.y * scale + (1.0 - scale) * 0.5;
    } else {
      float scale = screenAspect / imageAspect;
      uv.x = uv.x * scale + (1.0 - scale) * 0.5;
    }

    // Keep an overscan reserve so stronger displacement never exposes or
    // stretches the image edges.
    uv = (uv - 0.5) * 0.88 + 0.5;
    float depth = texture2D(u_depth, uv).r;
    float depthOffset = (depth - 0.5) * u_shift;
    vec2 displaced = clamp(uv + vec2(depthOffset * 0.16, depthOffset), 0.002, 0.998);
    vec3 color = texture2D(u_image, displaced).rgb;
    gl_FragColor = vec4(color, 1.0);

  }
`;

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const EASING = 0.18;
const SETTLED = 0.00008;

const HeroDepthScene = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false });
    if (!canvas || !gl) return;

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uShift = gl.getUniformLocation(program, "u_shift");

    let disposed = false;
    let frame: number | null = null;
    let ready = false;
    let currentShift = 0;
    let targetShift = 0;
    let isVisible = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const addTexture = (image: HTMLImageElement, unit: number, uniform: string) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, uniform), unit);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 1.25);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = () => {
      frame = null;
      if (!ready || disposed || !isVisible) return;
      resize();
      currentShift += (targetShift - currentShift) * EASING;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uShift, currentShift);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (Math.abs(targetShift - currentShift) > SETTLED) {
        frame = requestAnimationFrame(draw);
      } else {
        currentShift = targetShift;
      }
    };

    const requestDraw = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      targetShift = reduceMotion.matches ? 0 : progress * 0.12;
      requestDraw();
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        onScroll();
      } else if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }, { rootMargin: "120px 0px" });
    visibilityObserver.observe(canvas);

    Promise.all([loadImage(heroImage), loadImage(heroDepth)])
      .then(([image, depth]) => {
        if (disposed) return;
        addTexture(image, 0, "u_image");
        addTexture(depth, 1, "u_depth");
        gl.uniform2f(
          gl.getUniformLocation(program, "u_imageSize"),
          image.width,
          image.height,
        );
        ready = true;
        onScroll();
        canvas.style.opacity = "1";
        requestDraw();
      })
      .catch(() => undefined);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduceMotion.addEventListener("change", onScroll);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduceMotion.removeEventListener("change", onScroll);
      visibilityObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      <img
        src={`${import.meta.env.BASE_URL}hero-poster.jpg`}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="sync"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-500"
      />
    </div>
  );
};

export default HeroDepthScene;
