import React from 'react';
import type { ModalMode } from './ActionModal';

interface HeroSectionProps {
  onOpenModal: (mode: ModalMode) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal }) => {
  const scrollToStudio = () => {
    const studio = document.getElementById('studio');
    studio?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" aria-label="Nectarline Hero">
      <h1 className="hero-headline">
        <span className="hero-line-mask">
          <span data-in className="hero-line-1">
            Introducing
          </span>
        </span>
        <span className="hero-line-mask">
          <span data-in className="hero-line-2">
            Nectarline
          </span>
        </span>
      </h1>

      <p className="hero-subline" data-in>
        Supply Side Studio<sup>®</sup>
      </p>

      <div className="hero-buttons" data-in>
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

      <button
        type="button"
        className="scroll-card"
        data-in
        onClick={scrollToStudio}
        aria-label="Scroll down and discover Studio"
      >
        <span>
          Scroll down
          <br />
          &amp; discover
        </span>
        <svg
          className="scroll-card-arrow"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11 3 v15 M5 12 l6 6 6-6"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
};
