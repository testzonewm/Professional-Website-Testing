import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildAreaChartData,
  buildSparklineGeometry,
} from '../utils/nectarlineMath';
import type { ModalMode } from './ActionModal';

export interface DealRow {
  id: string;
  name: string;
  channel: string;
  floor: string;
  winRate: string;
  status: 'Live' | 'Forecasting';
  bold?: boolean;
}

interface StudioSectionProps {
  deals: DealRow[];
  userInitials: string;
  onOpenModal: (mode: ModalMode) => void;
}

type Timeframe = '7D' | '30D' | '90D';

interface SidebarItem {
  id: string;
  label: string;
  count?: string;
}

const WORKSPACE_ITEMS: SidebarItem[] = [
  { id: 'Performance', label: 'Performance' },
  { id: 'Deals', label: 'Deals', count: '24' },
  { id: 'Forecasts', label: 'Forecasts' },
  { id: 'Team', label: 'Team' },
];

const LIBRARY_ITEMS: SidebarItem[] = [
  { id: 'Audience Layers', label: 'Audience Layers', count: '38' },
  { id: 'Contextual', label: 'Contextual', count: '61' },
  { id: 'Domain Scoring', label: 'Domain Scoring' },
  { id: 'CTV Packages', label: 'CTV Packages', count: '12' },
];

const FORMAT_MIX = [
  { label: 'CTV', pct: 38, color: '#9b8cff', fade: 'rgba(155, 140, 255, 0.67)' },
  { label: 'Display', pct: 27, color: '#7fd6ff', fade: 'rgba(127, 214, 255, 0.67)' },
  { label: 'Online video', pct: 19, color: '#ff8fd8', fade: 'rgba(255, 143, 216, 0.67)' },
  { label: 'Audio', pct: 10, color: '#ffc27a', fade: 'rgba(255, 194, 122, 0.67)' },
  { label: 'DOOH', pct: 6, color: '#7cf0bd', fade: 'rgba(124, 240, 189, 0.67)' },
] as const;

const TIMEFRAME_METRICS: Record<
  Timeframe,
  { spend: string; spendDelta: string; win: string; winDelta: string; ecpm: string; ecpmDelta: string; trend: string; scale: number }
> = {
  '7D': {
    spend: '$46.8K',
    spendDelta: '+9%',
    win: '30.4%',
    winDelta: '+1.8pt',
    ecpm: '$9.18',
    ecpmDelta: '−2%',
    trend: '▲ 11.2% vs last period',
    scale: 0.72,
  },
  '30D': {
    spend: '$184.2K',
    spendDelta: '+12%',
    win: '29.6%',
    winDelta: '+3.1pt',
    ecpm: '$9.42',
    ecpmDelta: '−4%',
    trend: '▲ 18.4% vs last period',
    scale: 1,
  },
  '90D': {
    spend: '$512.6K',
    spendDelta: '+24%',
    win: '28.9%',
    winDelta: '+4.6pt',
    ecpm: '$9.65',
    ecpmDelta: '−1%',
    trend: '▲ 26.8% vs last period',
    scale: 1.25,
  },
};

const SidebarIcon: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'Performance':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 12 L6 8 L9 10 L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Deals':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2.5" y="3.5" width="11" height="9" rx="1.8" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.5 6.5 H13.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'Forecasts':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 5 v3 l2.2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'Team':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6.2" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.5 13 c0-2 1.6-3.2 3.7-3.2 s3.7 1.2 3.7 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M11 6.5 c1.3 0 2.5.9 2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'Audience Layers':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2.5 L13.5 5.5 L8 8.5 L2.5 5.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M2.5 8.5 L8 11.5 L13.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Contextual':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 4.5 H13 M3 8 H10.5 M3 11.5 H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'Domain Scoring':
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2.5 L12.8 4.6 V8.2 C12.8 11 10.6 13 8 13.8 C5.4 13 3.2 11 3.2 8.2 V4.6 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2.2" y="3.5" width="11.6" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 13 H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
};

export const StudioSection: React.FC<StudioSectionProps> = ({
  deals,
  userInitials,
  onOpenModal,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [activeNav, setActiveNav] = useState<string>('Performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashRevealed, setDashRevealed] = useState(false);
  const dashRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = dashRef.current;
    if (!el) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setDashRevealed(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (el.classList.contains('in')) {
        setDashRevealed(true);
        observer.disconnect();
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    if (el.classList.contains('in')) setDashRevealed(true);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const tf = TIMEFRAME_METRICS[timeframe];
  const liveCount = useMemo(
    () => 24 + Math.max(0, deals.length - 3),
    [deals.length],
  );

  const sparklines = useMemo(() => {
    const s = tf.scale;
    return [
      { ...buildSparklineGeometry(14, 3, 20 * s, 7 * s, 10 * s), color: '#9b8cff', id: 'sp0' },
      { ...buildSparklineGeometry(14, 7, 18 * s, 6 * s, 9 * s), color: '#ff8fd8', id: 'sp1' },
      { ...buildSparklineGeometry(14, 11, 22 * s, 6 * s, -6 * s), color: '#7fd6ff', id: 'sp2' },
      { ...buildSparklineGeometry(14, 5, 12 * s, 4 * s, 14 * s), color: '#7cf0bd', id: 'sp3' },
    ];
  }, [tf.scale]);

  const areaChart = useMemo(() => buildAreaChartData(tf.scale), [tf.scale]);

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.channel.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q),
    );
  }, [deals, searchQuery]);

  const kpis = [
    { label: 'Spend', val: tf.spend, delta: tf.spendDelta, up: true, spark: sparklines[0] },
    { label: 'Win rate', val: tf.win, delta: tf.winDelta, up: true, spark: sparklines[1] },
    { label: 'eCPM', val: tf.ecpm, delta: tf.ecpmDelta, up: false, spark: sparklines[2] },
    { label: 'Deals live', val: String(liveCount), delta: `+${5 + Math.max(0, deals.length - 3)}`, up: true, spark: sparklines[3] },
  ];

  return (
    <section id="studio" aria-labelledby="studio-heading">
      <h2 id="studio-heading" className="studio-headline reveal">
        The leading independent <span className="accent">self-serve curation studio</span>
        <br />
        for all programmatic media buyers.
      </h2>

      <p className="lede studio-lede reveal">
        Shape supply before you bid. Package, forecast and launch private deals from one calm workspace.
      </p>

      <div className="studio-buttons reveal">
        <button
          type="button"
          className="btn fill"
          onClick={() => onOpenModal({ kind: 'signup' })}
        >
          Get started — it&apos;s free
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => onOpenModal({ kind: 'call' })}
        >
          Book a Call
        </button>
      </div>

      <div className="stats-row reveal">
        <div className="stat-cell">
          <div className="stat-num">2.4B</div>
          <div className="stat-cap">
            bid requests shaped
            <br />
            every day
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">48s</div>
          <div className="stat-cap">
            median time from brief
            <br />
            to live deal ID
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">120+</div>
          <div className="stat-cap">
            supply partners
            <br />
            in one workspace
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">0%</div>
          <div className="stat-cap">
            buy-side markup
            <br />
            on curated media
          </div>
        </div>
      </div>

      <div id="dash" ref={dashRef} className="reveal">
        <div className="dash-topbar">
          <div className="dash-logo">
            <span className="orb" aria-hidden="true" />
            <span>Nectarline</span>
          </div>
          <div className="dash-breadcrumb">
            {activeNav === 'Performance' ? 'Deals' : activeNav} &nbsp;/&nbsp;{' '}
            <strong>Spring Streaming Pack</strong>
          </div>
          <div className="dash-spacer" />
          <label className="dash-search" aria-label="Search deals">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals"
            />
            <span className="dash-kbd">⌘K</span>
          </label>
          <span className="chip">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
          <div className="dash-avatar" aria-label={`User ${userInitials}`}>
            {userInitials}
          </div>
        </div>

        <div className="dash-body">
          <aside className="dash-sidebar" aria-label="Dashboard navigation">
            <div className="dash-side-heading">WORKSPACE</div>
            {WORKSPACE_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dash-side-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <SidebarIcon id={item.id} />
                <span>{item.label}</span>
                {'count' in item && item.count && (
                  <span className="dash-side-count">
                    {item.id === 'Deals' ? liveCount : item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="dash-side-heading library">LIBRARY</div>
            {LIBRARY_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`dash-side-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <SidebarIcon id={item.id} />
                <span>{item.label}</span>
                {'count' in item && item.count && (
                  <span className="dash-side-count">{item.count}</span>
                )}
              </button>
            ))}
          </aside>

          <div className="dash-main">
            <div className="dash-header-row">
              <h3 className="dash-title">Deal performance</h3>
              <span className="chip up dash-trend-chip">{tf.trend}</span>
              <div className="dash-seg" role="group" aria-label="Timeframe">
                {(['7D', '30D', '90D'] as Timeframe[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={timeframe === opt ? 'active' : ''}
                    onClick={() => setTimeframe(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="dash-new-btn"
                onClick={() => onOpenModal({ kind: 'new-deal' })}
              >
                + New deal
              </button>
            </div>

            <div className="dash-kpis">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="dash-kpi">
                  <div className="dash-kpi-label">{kpi.label}</div>
                  <div className="dash-kpi-valrow">
                    <div className="dash-kpi-val">{kpi.val}</div>
                    <span className={`chip${kpi.up ? ' up' : ''}`}>{kpi.delta}</span>
                  </div>
                  <svg
                    className="dash-spark"
                    viewBox="0 0 200 30"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id={kpi.spark.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={kpi.spark.color} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={kpi.spark.color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={kpi.spark.areaPath}
                      fill={`url(#${kpi.spark.id})`}
                      className="draw-fade"
                    />
                    <path
                      d={kpi.spark.linePath}
                      fill="none"
                      stroke={kpi.spark.color}
                      strokeWidth="1.6"
                      vectorEffect="non-scaling-stroke"
                      pathLength={1}
                      className="draw-line"
                    />
                  </svg>
                </div>
              ))}
            </div>

            <div className="dash-charts-row">
              <div className="dash-pane">
                <div className="dash-pane-head">
                  <div className="dash-pane-title">Spend &amp; win rate</div>
                  <div className="dash-legend">
                    <span className="dash-legend-item">
                      <span className="dash-legend-swatch" style={{ background: '#9b8cff' }} />
                      Spend
                    </span>
                    <span className="dash-legend-item">
                      <span className="dash-legend-swatch" style={{ background: '#ff8fd8' }} />
                      Win rate
                    </span>
                  </div>
                </div>

                <svg
                  className="dash-area-svg"
                  viewBox="0 0 600 190"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="areaSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9b8cff" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#9b8cff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="areaWinGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff8fd8" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#ff8fd8" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {areaChart.gridYs.map((gy, idx) => (
                    <line
                      key={idx}
                      x1="0"
                      x2="600"
                      y1={gy}
                      y2={gy}
                      stroke="rgba(190,170,255,0.08)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  <path d={areaChart.spendArea} fill="url(#areaSpendGrad)" className="draw-fade" />
                  <path d={areaChart.winArea} fill="url(#areaWinGrad)" className="draw-fade" />

                  <path
                    d={areaChart.spendLine}
                    fill="none"
                    stroke="#9b8cff"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    className="draw-line"
                  />
                  <path
                    d={areaChart.winLine}
                    fill="none"
                    stroke="#ff8fd8"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    className="draw-line win-line"
                  />

                  <g className="draw-fade">
                    <line
                      x1={areaChart.markerPoint.x}
                      x2={areaChart.markerPoint.x}
                      y1="12"
                      y2="178"
                      stroke="rgba(220,210,255,0.25)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={areaChart.markerPoint.x}
                      cy={areaChart.markerPoint.y}
                      r="4.5"
                      fill="#1a1150"
                      stroke="#b9adff"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>

              <div className="dash-pane">
                <div className="dash-pane-head">
                  <div className="dash-pane-title">Format mix</div>
                </div>
                <div className="mix-bars">
                  {FORMAT_MIX.map((bar) => (
                    <div key={bar.label}>
                      <div className="mix-row-label">
                        <span>{bar.label}</span>
                        <span className="mix-row-val">{bar.pct}%</span>
                      </div>
                      <div className="mix-track">
                        <div
                          className="mix-fill"
                          style={{
                            width: dashRevealed ? `${(bar.pct / 38) * 100}%` : '0%',
                            background: `linear-gradient(90deg, ${bar.color}, ${bar.fade})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dash-table" role="table" aria-label="Curated deals">
              <div className="dash-row head" role="row">
                <div role="columnheader">Deal</div>
                <div role="columnheader">Channel</div>
                <div role="columnheader" className="col-floor">
                  Floor
                </div>
                <div role="columnheader" className="col-win">
                  Win rate
                </div>
                <div role="columnheader">Status</div>
              </div>
              {filteredDeals.length === 0 ? (
                <div className="dash-row" role="row">
                  <div role="cell">No matching deals found</div>
                </div>
              ) : (
                filteredDeals.map((deal) => (
                  <div key={deal.id} className="dash-row" role="row">
                    <div role="cell">
                      {deal.bold ? <strong>{deal.name}</strong> : deal.name}
                    </div>
                    <div role="cell">{deal.channel}</div>
                    <div role="cell" className="mono col-floor">
                      {deal.floor}
                    </div>
                    <div role="cell" className="mono col-win">
                      {deal.winRate}
                    </div>
                    <div role="cell">
                      {deal.status === 'Live' ? (
                        <span className="chip">
                          <span className="live-dot" aria-hidden="true" />
                          Live
                        </span>
                      ) : (
                        <span className="chip">Forecasting</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
