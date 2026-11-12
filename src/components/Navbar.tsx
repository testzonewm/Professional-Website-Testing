import React, { useEffect, useRef, useState } from 'react';
import { PWAInstallButton } from './PWAControls';
import type { ModalMode } from './ActionModal';

interface NavbarProps {
  scrolled: boolean;
  userEmail: string | null;
  onOpenModal: (mode: ModalMode) => void;
}

type DropdownKey = 'product' | 'channels' | 'resources' | null;

const ChevronDown: React.FC = () => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 3.5 l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ scrolled, userEmail, onOpenModal }) => {
  const [openMenu, setOpenMenu] = useState<DropdownKey>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('click', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const scrollTo = (id: string) => {
    setOpenMenu(null);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`nl-nav${scrolled ? ' scrolled' : ''}`} data-in aria-label="Primary navigation">
      <a href="#top" className="logo">
        <span className="orb" aria-hidden="true" />
        <span>Nectarline</span>
      </a>

      <div ref={menuWrapRef} className="nav-center">
        <div className="nav-item-wrap">
          <button
            type="button"
            className="nav-item"
            aria-expanded={openMenu === 'product'}
            onClick={() => setOpenMenu((m) => (m === 'product' ? null : 'product'))}
          >
            <span>Product</span>
            <ChevronDown />
          </button>
          {openMenu === 'product' && (
            <div className="nav-dropdown" role="menu">
              <button type="button" role="menuitem" onClick={() => scrollTo('studio')}>
                Curation Studio
              </button>
              <button type="button" role="menuitem" onClick={() => scrollTo('dash')}>
                Live Deal Performance
              </button>
              <button type="button" role="menuitem" onClick={() => scrollTo('packs')}>
                OpenRTB Deal Builder
              </button>
            </div>
          )}
        </div>

        <div className="nav-item-wrap">
          <button
            type="button"
            className="nav-item"
            aria-expanded={openMenu === 'channels'}
            onClick={() => setOpenMenu((m) => (m === 'channels' ? null : 'channels'))}
          >
            <span>Channels</span>
            <ChevronDown />
          </button>
          {openMenu === 'channels' && (
            <div className="nav-dropdown" role="menu">
              <button type="button" role="menuitem" onClick={() => scrollTo('packs')}>
                CTV &amp; Streaming
              </button>
              <button type="button" role="menuitem" onClick={() => scrollTo('packs')}>
                Audience-Layered Display
              </button>
              <button type="button" role="menuitem" onClick={() => scrollTo('packs')}>
                Performance &amp; Audio
              </button>
            </div>
          )}
        </div>

        <div className="nav-item-wrap">
          <button
            type="button"
            className="nav-item"
            aria-expanded={openMenu === 'resources'}
            onClick={() => setOpenMenu((m) => (m === 'resources' ? null : 'resources'))}
          >
            <span>Resources</span>
            <ChevronDown />
          </button>
          {openMenu === 'resources' && (
            <div className="nav-dropdown" role="menu">
              <button type="button" role="menuitem" onClick={() => scrollTo('uses')}>
                Team Playbooks
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  onOpenModal({
                    kind: 'detail',
                    title: 'OpenRTB 2.6 Specification',
                    subtitle: 'DEAL CURATION SCHEMA · OFFLINE READY',
                    body: 'Every Nectarline deal ID compiles cleanly into standard OpenRTB 2.6 pmp.deals objects with floor enforcement, auction-type flags, and supply-side priority routing.',
                  });
                }}
              >
                Documentation
              </button>
              <button type="button" role="menuitem" onClick={() => scrollTo('end')}>
                System Status
              </button>
            </div>
          )}
        </div>

        <a href="#uses" className="nav-item" onClick={() => setOpenMenu(null)}>
          Customer Stories
        </a>
      </div>

      <div className="nav-right">
        <PWAInstallButton />
        <button
          type="button"
          className="nav-login"
          onClick={() => onOpenModal({ kind: 'login' })}
        >
          {userEmail ? userEmail.split('@')[0] : 'Login'}
        </button>
        <button
          type="button"
          className="nav-pill grey"
          onClick={() => onOpenModal({ kind: 'call' })}
        >
          Book a Call
        </button>
        <button
          type="button"
          className="nav-pill dark"
          onClick={() => onOpenModal({ kind: 'signup' })}
        >
          Get Started — it&apos;s Free
        </button>
      </div>
    </nav>
  );
};
