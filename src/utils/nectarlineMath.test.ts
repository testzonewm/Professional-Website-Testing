import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BID_REQUEST_TEXT,
  buildAreaChartData,
  buildSparklineGeometry,
  computeSceneCrossfade,
  computeUnitScale,
  DESKTOP_KOI_POSES,
  easeInOutCubic,
  generateSeries,
  interpolateKoiPose,
  MOBILE_KOI_OVERRIDES,
  smoothstep,
  type SectionAnchor,
} from './nectarlineMath';

test('computeUnitScale follows desktop (>820) and mobile (<=820) rules', () => {
  assert.equal(computeUnitScale(1440), 1);
  assert.equal(computeUnitScale(720), 720 / 390);
  assert.equal(computeUnitScale(820), 820 / 390);
  assert.equal(computeUnitScale(821), 821 / 1440);
  assert.equal(computeUnitScale(390), 1);
});

test('smoothstep and easeInOutCubic handle boundaries smoothly', () => {
  assert.equal(smoothstep(100, 200, 50), 0);
  assert.equal(smoothstep(100, 200, 250), 1);
  assert.equal(smoothstep(100, 200, 150), 0.5);

  assert.equal(easeInOutCubic(-1), 0);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(2), 1);
});

test('computeSceneCrossfade computes day -> violet -> night layers accurately', () => {
  const h = 900;
  const endTop = 4500;

  const atTop = computeSceneCrossfade(0, h, endTop);
  assert.equal(atTop.toViolet, 0);
  assert.equal(atTop.dayOpacity, 1);
  assert.equal(atTop.violetOpacity, 0);
  assert.equal(atTop.nightOpacity, 0);
  assert.equal(atTop.navScrolled, false);
  assert.equal(atTop.videoShouldPlay, true);

  const mid = computeSceneCrossfade(1500, h, endTop);
  assert.equal(mid.toViolet, 1);
  assert.equal(mid.dayOpacity, 0);
  assert.equal(mid.violetOpacity, 1);
  assert.equal(mid.nightOpacity, 0);
  assert.equal(mid.navScrolled, true);
  assert.equal(mid.videoShouldPlay, false);

  const atEnd = computeSceneCrossfade(4500, h, endTop);
  assert.equal(atEnd.toNight, 1);
  assert.equal(atEnd.violetOpacity, 0);
  assert.equal(atEnd.nightOpacity, 1);
});

test('interpolateKoiPose matches desktop and mobile poses at anchors and midpoints', () => {
  const anchors: SectionAnchor[] = [
    { key: 'hero', scrollPos: 0 },
    { key: 'statement', scrollPos: 1000 },
    { key: 'dash', scrollPos: 1800 },
    { key: 'packs', scrollPos: 2800 },
    { key: 'uses', scrollPos: 3800 },
    { key: 'end', scrollPos: 4800 },
  ];

  const heroDesktop = interpolateKoiPose(0, anchors, false);
  assert.deepEqual(heroDesktop, DESKTOP_KOI_POSES.hero);

  const usesDesktop = interpolateKoiPose(3800, anchors, false);
  assert.deepEqual(usesDesktop, DESKTOP_KOI_POSES.uses);

  const midDesktop = interpolateKoiPose(500, anchors, false);
  assert.ok(Math.abs(midDesktop.x - (DESKTOP_KOI_POSES.hero.x + DESKTOP_KOI_POSES.statement.x) / 2) < 1e-9);

  const heroMobile = interpolateKoiPose(0, anchors, true);
  assert.equal(heroMobile.x, MOBILE_KOI_OVERRIDES.hero.x);
  assert.equal(heroMobile.y, MOBILE_KOI_OVERRIDES.hero.y);
  assert.equal(heroMobile.s, MOBILE_KOI_OVERRIDES.hero.s);
  assert.equal(heroMobile.yaw, DESKTOP_KOI_POSES.hero.yaw);
});

test('deterministic series and SVG chart generators produce stable geometry', () => {
  const s1 = generateSeries(14, 3, 20, 7, 10);
  const s2 = generateSeries(14, 3, 20, 7, 10);
  assert.equal(s1.length, 14);
  assert.deepEqual(s1, s2);

  const spark = buildSparklineGeometry(14, 3, 20, 7, 10);
  assert.ok(spark.linePath.startsWith('M0.00,'));
  assert.ok(spark.areaPath.endsWith('L0.00,30 Z'));

  const area = buildAreaChartData(1);
  assert.equal(area.gridYs.length, 5);
  assert.ok(area.markerPoint.x > 400 && area.markerPoint.x < 500);
});

test('BID_REQUEST_TEXT preserves exact two-space indentation and deal id', () => {
  assert.ok(BID_REQUEST_TEXT.includes('"id": "nl.pond.0428"'));
  assert.ok(BID_REQUEST_TEXT.includes('"bidfloor": 4.8'));
  assert.equal(BID_REQUEST_TEXT.split('\n').length, 12);
});
