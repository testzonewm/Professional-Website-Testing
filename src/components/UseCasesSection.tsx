import React from 'react';
import type { ModalMode } from './ActionModal';

interface UseCasesSectionProps {
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

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({ onOpenModal }) => {
  return (
    <section id="uses" aria-labelledby="uses-heading">
      <div className="uses-head">
        <h2 id="uses-heading" className="uses-headline reveal">
          Built for everyone
          <br />
          who <span className="serif-acc">touches</span> supply.
        </h2>
        <p className="lede uses-lede reveal">
          One workspace, four ways in. Every team gets the controls it needs, and nothing it doesn&apos;t.
        </p>
      </div>

      <div className="uses-staircase">
        <article className="role-card glass c1 reveal" style={{ transitionDelay: '0s' }}>
          <div className="role-top">
            <span className="role-tag">USE CASE</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <rect x="3" y="6.5" width="16" height="11" rx="2" stroke="#fff" strokeWidth="1.3" />
                <path d="M8 6.5 V5 a1.5 1.5 0 0 1 1.5-1.5 h3 A1.5 1.5 0 0 1 14 5 v1.5" stroke="#fff" strokeWidth="1.3" />
                <path d="M3 11 h16" stroke="#fff" strokeWidth="1.3" />
              </svg>
            </span>
          </div>
          <h3 className="role-title">Media Agency</h3>
          <p className="role-body">
            Programmatic without curation is just noise. Own the pipes, or let the pipes own you.
          </p>
          <div className="role-chips">
            <span className="chip">Multi-client seats</span>
            <span className="chip">Margin control</span>
          </div>
          <div className="role-foot">
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Media Agency Playbook',
                  subtitle: 'MULTI-CLIENT SEATS · MARGIN CONTROL',
                  body: 'Manage curated supply lines across every client seat with transparent fee structures, instant cross-DSP deal IDs, and shared taxonomy libraries.',
                })
              }
            >
              <span>Explore now</span>
              <ArrowIcon />
            </button>
          </div>
        </article>

        <article className="role-card glass c2 reveal" style={{ transitionDelay: '0.06s' }}>
          <div className="role-top">
            <span className="role-tag">USE CASE</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <path d="M4 12.5 V8.5 L15.5 4.5 V16.5 L4 12.5 Z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M7 13.5 L8.5 18 H10.5 L9.5 14.3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 8.5 c1 .8 1 3.2 0 4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <h3 className="role-title">Direct Advertiser</h3>
          <p className="role-body">
            Brands win when supply is shaped, not shuffled. Cut the clutter. Keep only what counts.
          </p>
          <div className="role-chips">
            <span className="chip">Brand safety</span>
            <span className="chip">Outcome KPIs</span>
          </div>
          <div className="role-foot">
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Direct Advertiser Workspace',
                  subtitle: 'BRAND SAFETY · OUTCOME KPIS',
                  body: 'Enforce strict inclusion lists, domain scoring, and carbon-light supply paths before auctions clear, ensuring every dollar works toward outcomes.',
                })
              }
            >
              <span>Explore now</span>
              <ArrowIcon />
            </button>
          </div>
        </article>

        <article className="role-card glass c3 reveal" style={{ transitionDelay: '0.12s' }}>
          <div className="role-top">
            <span className="role-tag">USE CASE</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <path d="M6 3.5 h7.5 L17 7 v11.5 a1.5 1.5 0 0 1-1.5 1.5 h-9.5 a1.5 1.5 0 0 1-1.5-1.5 V5 A1.5 1.5 0 0 1 6 3.5 Z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M13 3.5 V7.5 H17 M8 11 h6 M8 14.5 h4.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <h3 className="role-title">Publisher</h3>
          <p className="role-body">
            Stop funding buy-side margins. Keep them. Every hop takes a cut. Remove those hops.
          </p>
          <div className="role-chips">
            <span className="chip">O&amp;O packaging</span>
            <span className="chip">Audience extension</span>
          </div>
          <div className="role-foot">
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Publisher Packaging Suite',
                  subtitle: 'O&O PACKAGING · AUDIENCE EXTENSION',
                  body: 'Package first-party editorial and streaming cohorts into premium private marketplace deals with direct buyer forecasting and zero intermediary drag.',
                })
              }
            >
              <span>Explore now</span>
              <ArrowIcon />
            </button>
          </div>
        </article>

        <article className="role-card glass c4 reveal" style={{ transitionDelay: '0.18s' }}>
          <div className="role-top">
            <span className="role-tag">USE CASE</span>
            <span className="bare-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none">
                <path d="M7.5 7 L3 11 L7.5 15 M14.5 7 L19 11 L14.5 15 M12.2 5.5 L9.8 16.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <h3 className="role-title">Ad Tech</h3>
          <p className="role-body">
            Transparency isn&apos;t a feature, it&apos;s oxygen. Leaders don&apos;t wait on inventory. They shape it all.
          </p>
          <div className="role-chips">
            <span className="chip">Open API</span>
            <span className="chip">White-label</span>
          </div>
          <div className="role-foot">
            <button
              type="button"
              className="arrow-link"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Ad Tech Platform API',
                  subtitle: 'OPEN API · WHITE-LABEL',
                  body: 'Embed Nectarline curation pipelines directly into your trading interface or SSP stack with full OpenRTB 2.6 telemetry and custom deal routing.',
                })
              }
            >
              <span>Explore now</span>
              <ArrowIcon />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
