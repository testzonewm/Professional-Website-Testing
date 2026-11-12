import React, { useEffect, useRef, useState } from 'react';
import { BID_REQUEST_TEXT } from '../utils/nectarlineMath';
import type { ModalMode } from './ActionModal';

interface PackagesSectionProps {
  onOpenModal: (mode: ModalMode) => void;
}

const ArrowIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 8 h11 M9 4 l4 4 -4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PackagesSection: React.FC<PackagesSectionProps> = ({ onOpenModal }) => {
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const [typedLength, setTypedLength] = useState(0);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(reduced);
    if (reduced) {
      setTypedLength(BID_REQUEST_TEXT.length);
      return;
    }

    const el = codeBlockRef.current;
    if (!el) return;

    let started = false;
    let timerId = 0;
    let cancelled = false;
    let idx = 0;

    const step = () => {
      if (cancelled) return;
      if (idx < BID_REQUEST_TEXT.length) {
        const ch = BID_REQUEST_TEXT[idx];
        idx += 1;
        setTypedLength(idx);
        const delay = ch === '\n' ? 120 : 22;
        timerId = window.setTimeout(step, delay);
      } else {
        timerId = window.setTimeout(() => {
          if (cancelled) return;
          idx = 0;
          setTypedLength(0);
          timerId = window.setTimeout(step, 22);
        }, 3200);
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            obs.disconnect();
            step();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );

    obs.observe(el);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      obs.disconnect();
    };
  }, []);

  const displayedText = BID_REQUEST_TEXT.slice(0, typedLength);

  return (
    <section id="packs" aria-labelledby="packs-heading">
      <div className="packs-split">
        <div className="reveal">
          <h2 id="packs-heading" className="packs-headline">
            Choose boldly, look ahead, shape supply, tune fast,{' '}
            <span className="accent">
              track <span className="serif-acc">truth.</span>
            </span>
          </h2>
          <p className="lede packs-lede">
            Start from a curated package, tune it to your brief, then push one deal ID to any buying platform you already use.
          </p>
          <div className="packs-buttons">
            <a href="#uses" className="btn white">
              Customer Stories
            </a>
            <button
              type="button"
              className="btn dk"
              onClick={() => onOpenModal({ kind: 'call' })}
            >
              Book a Call
            </button>
          </div>
        </div>

        <div ref={codeBlockRef} className="code-block reveal" aria-hidden="true">
          <div className="code-head">
            <span>bid_request.json</span>
            <span>OpenRTB 2.6</span>
          </div>
          <div className="code-area">
            {displayedText}
            {!isReduced && <span className="code-caret" />}
          </div>
          <div className="code-foot">
            <span>deal nl.pond.0428</span>
            <span className="code-foot-ready">
              <span className="live-dot" />
              <span>ready</span>
            </span>
          </div>
        </div>
      </div>

      <div className="packs-grid">
        <article className="pack-card glass lead reveal" style={{ transitionDelay: '0s' }}>
          <div className="pack-top">
            <span className="pack-idx">01</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="1.3" />
                <circle cx="11" cy="11" r="2" stroke="#fff" strokeWidth="1.3" />
                <path d="M11 2 v3 M11 17 v3 M2 11 h3 M17 11 h3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <div className="pack-eyebrow">AUDIENCE-LAYERED</div>
          <h3 className="pack-title">Reach Buyers Ready to Act Now</h3>
          <p className="pack-body">
            Publisher first-party signals plus trusted audiences, layered supply-side.
          </p>
          <div className="pack-meta">
            <div>
              <div className="pack-cap">Avg. reach lift</div>
              <div className="pack-metric">+24%</div>
            </div>
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Audience-Layered Packages',
                  subtitle: 'PACKAGE 01 · AVG. REACH LIFT +24%',
                  body: 'Combine publisher first-party signals with deterministic audience segments directly inside the supply path before a single bid request reaches your DSP.',
                })
              }
            >
              <span>Get these deals</span>
              <ArrowIcon />
            </button>
          </div>
        </article>

        <article className="pack-card glass reveal" style={{ transitionDelay: '0.08s' }}>
          <div className="pack-top">
            <span className="pack-idx">02</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <rect x="4" y="4.5" width="14" height="9" rx="1.8" stroke="#fff" strokeWidth="1.3" />
                <path d="M8 17.5 h6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <div className="pack-eyebrow">CTV PACKAGES</div>
          <h3 className="pack-title">Screens Watched</h3>
          <p className="pack-body">
            Streaming inventory tuned toward a given context or genre.
          </p>
          <div className="pack-meta">
            <div>
              <div className="pack-cap">Completion rate</div>
              <div className="pack-metric">96%</div>
            </div>
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'CTV Streaming Packages',
                  subtitle: 'PACKAGE 02 · 96% COMPLETION RATE',
                  body: 'Direct-to-publisher connected TV deals filtered by show genre, network tier, and real-time pod deduplication.',
                })
              }
            >
              <span>Get these deals</span>
              <ArrowIcon />
            </button>
          </div>
        </article>

        <article className="pack-card glass reveal" style={{ transitionDelay: '0.16s' }}>
          <div className="pack-top">
            <span className="pack-idx">03</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 16 L8.5 10.5 L12.5 14 L19 6.5 M14.5 6.5 H19 V11"
                  stroke="#fff"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="pack-eyebrow">PERFORMANCE</div>
          <h3 className="pack-title">Lift Conversion Now</h3>
          <p className="pack-body">
            Placements curated to steer toward the KPIs you care about.
          </p>
          <div className="pack-meta">
            <div>
              <div className="pack-cap">Avg. CPA change</div>
              <div className="pack-metric">−17%</div>
            </div>
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Performance Outcome Deals',
                  subtitle: 'PACKAGE 03 · AVG. CPA CHANGE −17%',
                  body: 'Continuously pruned placement lists weighted toward verified attention, viewability, and downstream conversion signals.',
                })
              }
            >
              <span>Get these deals</span>
              <ArrowIcon />
            </button>
          </div>
        </article>
      </div>

      <ol className="steps-strip reveal">
        <li className="step-item">
          <span className="step-num">01</span>
          <div>
            <strong>Pick a package, then tune it</strong>
            Layer audiences, context and quality rules.
          </div>
        </li>
        <li className="step-item">
          <span className="step-num">02</span>
          <div>
            <strong>Review the forecast</strong>
            See reach, floors and bidding guidance up front.
          </div>
        </li>
        <li className="step-item">
          <span className="step-num">03</span>
          <div>
            <strong>Generate deal IDs in seconds</strong>
            Activate on any buying platform, live in minutes.
          </div>
        </li>
      </ol>
    </section>
  );
};
