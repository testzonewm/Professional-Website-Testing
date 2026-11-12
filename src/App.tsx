import { useEffect, useState } from 'react';
import { ActionModal, type ModalMode, type NewDealInput } from './components/ActionModal';
import { EndSection } from './components/EndSection';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { PackagesSection } from './components/PackagesSection';
import { OfflineIndicator } from './components/PWAControls';
import { SceneBackdrop } from './components/SceneBackdrop';
import { StudioSection, type DealRow } from './components/StudioSection';
import { UseCasesSection } from './components/UseCasesSection';
import { computeUnitScale } from './utils/nectarlineMath';

const INITIAL_DEALS: DealRow[] = [
  {
    id: 'deal-1',
    name: 'Spring Streaming Pack',
    channel: 'CTV',
    floor: '$18.50',
    winRate: '31.2%',
    status: 'Live',
    bold: true,
  },
  {
    id: 'deal-2',
    name: 'Pondside In-Market Auto',
    channel: 'Display',
    floor: '$4.80',
    winRate: '27.9%',
    status: 'Live',
  },
  {
    id: 'deal-3',
    name: 'Quiet Hours Audio',
    channel: 'Audio',
    floor: '$6.20',
    winRate: '—',
    status: 'Forecasting',
  },
];

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [userInitials, setUserInitials] = useState('PM');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealRow[]>(() => {
    try {
      const saved = localStorage.getItem('nectarline_deals_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage read error
    }
    return INITIAL_DEALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nectarline_deals_v1', JSON.stringify(deals));
    } catch {
      // ignore storage write error
    }
  }, [deals]);

  // Scaling unit --u based on documentElement.clientWidth
  useEffect(() => {
    const updateUnit = () => {
      const w = document.documentElement.clientWidth || window.innerWidth;
      document.documentElement.style.setProperty('--u', `${computeUnitScale(w)}px`);
    };
    updateUnit();
    window.addEventListener('resize', updateUnit);
    return () => window.removeEventListener('resize', updateUnit);
  }, []);

  // Hero entrance timeline & scroll reveal observer
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;

    const failsafe = window.setTimeout(() => {
      html.classList.remove('anim');
    }, 3000);

    if (isReduced) {
      html.classList.remove('anim');
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return () => window.clearTimeout(failsafe);
    }

    const easing = 'cubic-bezier(0.2, 0.75, 0.2, 1)';
    const specs: Array<{
      selector: string;
      from: Keyframe;
      delay: number;
      duration: number;
    }> = [
      {
        selector: '.nl-nav',
        from: { opacity: 0, transform: 'translateY(-14px)' },
        delay: 0,
        duration: 900,
      },
      {
        selector: '.hero-line-1',
        from: { opacity: 0, transform: 'translateY(105%)' },
        delay: 250,
        duration: 1100,
      },
      {
        selector: '.hero-line-2',
        from: { opacity: 0, transform: 'translateY(105%)' },
        delay: 370,
        duration: 1100,
      },
      {
        selector: '.hero-subline',
        from: { opacity: 0, transform: 'translateY(12px)' },
        delay: 620,
        duration: 900,
      },
      {
        selector: '.hero-buttons',
        from: { opacity: 0, transform: 'translateY(14px)' },
        delay: 740,
        duration: 900,
      },
      {
        selector: '.scroll-card',
        from: { opacity: 0, transform: 'translateY(40px) scale(0.96)' },
        delay: 880,
        duration: 1100,
      },
    ];

    specs.forEach(({ selector, from, delay, duration }) => {
      const el = document.querySelector(selector);
      if (el && typeof el.animate === 'function') {
        el.animate([from, { opacity: 1, transform: 'none' }], {
          delay,
          duration,
          easing,
          fill: 'backwards',
        });
      }
    });

    const rafId = requestAnimationFrame(() => {
      html.classList.remove('anim');
    });

    // Scroll reveal observer
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => observer.observe(el));

    return () => {
      window.clearTimeout(failsafe);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const handleLoginSuccess = (initials: string, email: string) => {
    setUserInitials(initials);
    setUserEmail(email);
  };

  const handleCreateDeal = (input: NewDealInput) => {
    const newDeal: DealRow = {
      id: `deal-${Date.now()}`,
      name: input.name,
      channel: input.channel,
      floor: input.floor,
      winRate: '28.4%',
      status: 'Live',
      bold: true,
    };
    setDeals((prev) => [newDeal, ...prev]);
  };

  return (
    <>
      <SceneBackdrop onNavScrolledChange={setNavScrolled} />
      <Navbar
        scrolled={navScrolled}
        userEmail={userEmail}
        onOpenModal={setModal}
      />
      <main id="top" className="nl-main">
        <HeroSection onOpenModal={setModal} />
        <StudioSection
          deals={deals}
          userInitials={userInitials}
          onOpenModal={setModal}
        />
        <PackagesSection onOpenModal={setModal} />
        <UseCasesSection onOpenModal={setModal} />
        <EndSection onOpenModal={setModal} />
      </main>
      <ActionModal
        modal={modal}
        onClose={() => setModal(null)}
        onLoginSuccess={handleLoginSuccess}
        onCreateDeal={handleCreateDeal}
      />
      <OfflineIndicator />
    </>
  );
}
