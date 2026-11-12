export interface Point2D {
  x: number;
  y: number;
}

export interface KoiPose {
  x: number;
  y: number;
  s: number;
  yaw: number;
  pitch: number;
  roll: number;
}

export type PoseKey = 'hero' | 'statement' | 'dash' | 'packs' | 'uses' | 'end';

export interface SectionAnchor {
  key: PoseKey;
  scrollPos: number;
}

export interface CrossfadeState {
  toViolet: number;
  toNight: number;
  dayOpacity: number;
  dayScale: number;
  dayTranslateY: number;
  violetOpacity: number;
  nightOpacity: number;
  navScrolled: boolean;
  videoShouldPlay: boolean;
}

export const DESKTOP_KOI_POSES: Record<PoseKey, KoiPose> = {
  hero: { x: 0.02, y: 0.16, s: 0.72, yaw: 0.18, pitch: -0.92, roll: 0.05 },
  statement: { x: -0.66, y: -0.6, s: 0.42, yaw: 0.5, pitch: 0.2, roll: -0.1 },
  dash: { x: 0.5, y: -0.5, s: 0.46, yaw: -0.35, pitch: 0.32, roll: 0.1 },
  packs: { x: 0.4, y: -0.78, s: 0.5, yaw: 0.55, pitch: -0.05, roll: 0.08 },
  uses: { x: -0.42, y: -0.42, s: 0.6, yaw: 3.0, pitch: 0.12, roll: -0.06 },
  end: { x: -0.7, y: 0.56, s: 0.48, yaw: 0.3, pitch: -0.14, roll: 0.05 },
};

export const MOBILE_KOI_OVERRIDES: Record<PoseKey, Pick<KoiPose, 'x' | 'y' | 's'>> = {
  hero: { x: 0.12, y: 0.38, s: 0.46 },
  statement: { x: 0.42, y: -0.72, s: 0.3 },
  dash: { x: -0.35, y: -0.74, s: 0.3 },
  packs: { x: 0.38, y: -0.74, s: 0.3 },
  uses: { x: -0.3, y: -0.76, s: 0.32 },
  end: { x: 0.3, y: -0.74, s: 0.32 },
};

export const BID_REQUEST_TEXT = [
  '  "id": "7f3a9c1e00b24d6e8a51c0ffee42d0e1",',
  '  "at": 2,',
  '  "tmax": 120,',
  '  "imp": [{',
  '    "id": "1",',
  '    "pmp": {',
  '      "private_auction": 1,',
  '      "deals": [{',
  '        "id": "nl.pond.0428",',
  '        "bidfloor": 4.8,',
  '        "at": 1,',
  '        "ext": { "priority": 1 }',
].join('\n');

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function smoothstep(edge0: number, edge1: number, v: number): number {
  if (edge1 === edge0) return v >= edge1 ? 1 : 0;
  const t = clamp((v - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return a + (b - a) * t;
}

export function computeUnitScale(clientWidth: number): number {
  const safeW = Math.max(1, clientWidth);
  return safeW > 820 ? safeW / 1440 : safeW / 390;
}

export function computeSceneCrossfade(
  scrollY: number,
  viewportHeight: number,
  endTop: number,
): CrossfadeState {
  const h = Math.max(1, viewportHeight);
  const y = Math.max(0, scrollY);
  const toViolet = smoothstep(0.15 * h, 1.05 * h, y);
  const toNight = smoothstep(endTop - 1.1 * h, endTop - 0.1 * h, y);

  return {
    toViolet,
    toNight,
    dayOpacity: 1 - toViolet,
    dayScale: 1 + 0.08 * toViolet,
    dayTranslateY: -0.06 * y,
    violetOpacity: toViolet * (1 - toNight),
    nightOpacity: toNight,
    navScrolled: y > 0.5 * h,
    videoShouldPlay: toViolet < 0.999,
  };
}

export function getPoseForKey(key: PoseKey, isMobile: boolean): KoiPose {
  const base = DESKTOP_KOI_POSES[key];
  if (!isMobile) return { ...base };
  const over = MOBILE_KOI_OVERRIDES[key];
  return { ...base, ...over };
}

export function interpolateKoiPose(
  scrollY: number,
  anchors: SectionAnchor[],
  isMobile: boolean,
): KoiPose {
  if (anchors.length === 0) return getPoseForKey('hero', isMobile);
  const sorted = [...anchors].sort((a, b) => a.scrollPos - b.scrollPos);

  if (scrollY <= sorted[0].scrollPos) {
    return getPoseForKey(sorted[0].key, isMobile);
  }
  const lastIdx = sorted.length - 1;
  if (scrollY >= sorted[lastIdx].scrollPos) {
    return getPoseForKey(sorted[lastIdx].key, isMobile);
  }

  for (let i = 0; i < lastIdx; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    if (scrollY >= curr.scrollPos && scrollY <= next.scrollPos) {
      const span = Math.max(1, next.scrollPos - curr.scrollPos);
      const t = easeInOutCubic((scrollY - curr.scrollPos) / span);
      const p0 = getPoseForKey(curr.key, isMobile);
      const p1 = getPoseForKey(next.key, isMobile);
      return {
        x: lerp(p0.x, p1.x, t),
        y: lerp(p0.y, p1.y, t),
        s: lerp(p0.s, p1.s, t),
        yaw: lerp(p0.yaw, p1.yaw, t),
        pitch: lerp(p0.pitch, p1.pitch, t),
        roll: lerp(p0.roll, p1.roll, t),
      };
    }
  }

  return getPoseForKey(sorted[lastIdx].key, isMobile);
}

export function generateSeries(
  n: number,
  seed: number,
  base: number,
  amp: number,
  trend: number,
): number[] {
  let s = seed;
  const out: number[] = [];
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const v = base + (trend * i) / denom + Math.sin(i * 0.9 + seed) * amp * 0.5 + (r - 0.5) * amp;
    out.push(v);
  }
  return out;
}

export function buildSmoothCurvePath(points: Point2D[]): string {
  if (points.length === 0) return '';
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const q = points[i - 1];
    const p = points[i];
    const midX = ((q.x + p.x) * 0.5).toFixed(2);
    d += ` C${midX},${q.y.toFixed(2)} ${midX},${p.y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }
  return d;
}

export function buildSparklineGeometry(
  n: number,
  seed: number,
  base: number,
  amp: number,
  trend: number,
): { linePath: string; areaPath: string } {
  const vals = generateSeries(n, seed, base, amp, trend);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = Math.max(1e-6, max - min);

  const pts: Point2D[] = vals.map((v, i) => ({
    x: (i * 200) / Math.max(1, n - 1),
    y: 28 - ((v - min) / range) * 24,
  }));

  const linePath = buildSmoothCurvePath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${linePath} L${last.x.toFixed(2)},30 L${first.x.toFixed(2)},30 Z`;
  return { linePath, areaPath };
}

export function buildAreaChartData(scaleFactor = 1): {
  spendLine: string;
  spendArea: string;
  winLine: string;
  winArea: string;
  markerPoint: Point2D;
  gridYs: number[];
} {
  const spendVals = generateSeries(30, 2, 90 * scaleFactor, 26 * scaleFactor, 60 * scaleFactor);
  const winVals = generateSeries(30, 9, 70 * scaleFactor, 22 * scaleFactor, 30 * scaleFactor);
  const max = Math.max(...spendVals, ...winVals) + 10;

  const toPoints = (arr: number[]): Point2D[] =>
    arr.map((v, i) => ({
      x: (i * 600) / 29,
      y: 190 - 12 - (v / max) * 160,
    }));

  const spendPts = toPoints(spendVals);
  const winPts = toPoints(winVals);

  const spendLine = buildSmoothCurvePath(spendPts);
  const spendArea = `${spendLine} L600,190 L0,190 Z`;

  const winLine = buildSmoothCurvePath(winPts);
  const winArea = `${winLine} L600,190 L0,190 Z`;

  const gridYs = [0, 1, 2, 3, 4].map((i) => 12 + i * 41.5);

  return {
    spendLine,
    spendArea,
    winLine,
    winArea,
    markerPoint: spendPts[22],
    gridYs,
  };
}
