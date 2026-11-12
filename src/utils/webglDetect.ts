export interface SharedPointerState {
  u: number;
  v: number;
  tx: number;
  ty: number;
  inside: boolean;
}

export const sharedPointer: SharedPointerState = {
  u: 0.5,
  v: 0.5,
  tx: 0,
  ty: 0,
  inside: false,
};

let pointerListenersAttached = false;

export function ensureSharedPointerListeners(): void {
  if (pointerListenersAttached || typeof window === 'undefined') return;
  pointerListenersAttached = true;

  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const u = e.clientX / w;
      const v = 1 - e.clientY / h;
      sharedPointer.u = u;
      sharedPointer.v = v;
      sharedPointer.tx = u * 2 - 1;
      sharedPointer.ty = v * 2 - 1;
      sharedPointer.inside = true;
    },
    { passive: true },
  );

  document.documentElement.addEventListener(
    'pointerleave',
    () => {
      sharedPointer.inside = false;
      sharedPointer.tx = 0;
      sharedPointer.ty = 0;
    },
    { passive: true },
  );
}

let cachedSoftwareGl: boolean | null = null;

export function detectSoftwareGl(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = false;
    return false;
  }
}
