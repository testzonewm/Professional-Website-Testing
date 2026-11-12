import React from 'react';
import type { ModalMode } from './ActionModal';

interface EndSectionProps {
  onOpenModal: (mode: ModalMode) => void;
}

export const EndSection: React.FC<EndSectionProps> = ({ onOpenModal }) => {
  return (
    <section id="end" aria-labelledby="cta-heading">
      <div className="cta-panel glass reveal">
        <h2 id="cta-heading" className="cta-headline">
          Start Curating
          <br />
          <span className="serif-acc">Supply-Side</span> Now!
        </h2>
        <p className="lede cta-lede">
          Free to start. Your first curated deal can be live before your coffee goes cold.
        </p>
        <div className="cta-buttons">
          <button
            type="button"
            className="btn fill"
            onClick={() => onOpenModal({ kind: 'signup' })}
          >
            Get Started — it&apos;s Free
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => onOpenModal({ kind: 'call' })}
          >
            Book a Call
          </button>
        </div>
        <p className="cta-note">No card needed &nbsp;·&nbsp; Live in minutes &nbsp;·&nbsp; Cancel anytime</p>
      </div>

      <footer className="nl-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" className="logo footer-brand-logo">
              <span className="orb" aria-hidden="true" />
              <span>Nectarline</span>
            </a>
            <p className="footer-desc">
              The independent studio for curating programmatic supply, from first brief to live deal.
            </p>
            <div className="footer-status">
              <span className="chip">
                <span className="live-dot" aria-hidden="true" />
                All systems normal
              </span>
            </div>
          </div>

          <div>
            <div className="footer-col-title">PRODUCT</div>
            <div className="footer-links">
              <a href="#studio">Curation</a>
              <a href="#dash">Monetization</a>
              <a href="#packs">Forecasts</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">USE CASES</div>
            <div className="footer-links">
              <a href="#uses">Media Agency</a>
              <a href="#uses">Direct Advertiser</a>
              <a href="#uses">Publisher</a>
              <a href="#uses">Ad Tech</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">CHANNELS</div>
            <div className="footer-links">
              <a href="#packs">CTV</a>
              <a href="#packs">Display / Native</a>
              <a href="#packs">DOOH</a>
              <a href="#packs">Video / Audio</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">RESOURCES</div>
            <div className="footer-links">
              <a href="#studio">Partner Directory</a>
              <button
                type="button"
                onClick={() =>
                  onOpenModal({
                    kind: 'detail',
                    title: 'Documentation',
                    subtitle: 'OFFLINE REFERENCE · OPENRTB 2.6',
                    body: 'All deal packaging schemas, floor curves, and PMP extension keys are bundled locally in Nectarline Studio for uninterrupted offline planning.',
                  })
                }
              >
                Documentation
              </button>
              <a href="#end">System Status</a>
              <button type="button" onClick={() => onOpenModal({ kind: 'call' })}>
                Contact Us
              </button>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <div>©2026 Nectarline: Supply Side Studio®</div>
          <div className="footer-legal-links">
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Privacy Policy',
                  subtitle: 'NECTARLINE STUDIO · ZERO THIRD-PARTY TRACKING',
                  body: 'Nectarline operates self-contained and offline-ready with no third-party ad-tech beacons or external trackers.',
                })
              }
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Terms of Service',
                  subtitle: 'NECTARLINE SUPPLY SIDE STUDIO®',
                  body: 'Self-serve programmatic curation studio terms apply to workspace deal generation and forecast usage.',
                })
              }
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenModal({
                  kind: 'detail',
                  title: 'Opt Out Preferences',
                  subtitle: 'LOCAL PREFERENCE CONTROLS',
                  body: 'All studio sessions and assets run locally without external telemetry calls.',
                })
              }
            >
              Opt Out
            </button>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          Nectarline
        </div>
      </footer>
    </section>
  );
};
