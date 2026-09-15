import { useEffect, useRef } from "react";
import showroomAsset from "@/assets/about/ervitex-showroom.jpg.asset.json";
import depthAsset from "@/assets/about/ervitex-showroom-depth.png.asset.json";

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

    float depth = texture2D(u_depth, uv).r;
    float parallax = (depth - 0.5) * u_shift;
    vec2 displaced = clamp(uv + vec2(parallax * 0.42, parallax), 0.002, 0.998);
    vec3 color = texture2D(u_image, displaced).rgb;
    color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), 0.18);
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

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const DepthMapScene = () => {
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let disposed = false;
    let frame = 0;
    let currentShift = 0;
    let targetShift = 0;

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
      const ratio = Math.min(window.devicePixelRatio, 1.75);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const updateScroll = () => {
      const scene = canvas.closest(".abandoned-story-scene");
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      targetShift = (progress - 0.5) * 0.085;
    };

    Promise.all([loadImage(showroomAsset.url), loadImage(depthAsset.url)]).then(([image, depth]) => {
      if (disposed) return;
      addTexture(image, 0, "u_image");
      addTexture(depth, 1, "u_depth");
      gl.uniform2f(gl.getUniformLocation(program, "u_imageSize"), image.width, image.height);

      const render = () => {
        if (disposed) return;
        resize();
        currentShift += (targetShift - currentShift) * 0.065;
        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, "u_shift"), currentShift);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        frame = requestAnimationFrame(render);
      };
      updateScroll();
      render();
    }).catch(() => undefined);

    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("scroll", updateScroll);
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label="Ervitex tekstila ekspozīcija" />;
};

export default DepthMapScene;