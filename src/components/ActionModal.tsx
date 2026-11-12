import React, { useEffect, useState } from 'react';

export type ModalMode =
  | { kind: 'signup' }
  | { kind: 'call' }
  | { kind: 'login' }
  | { kind: 'new-deal' }
  | { kind: 'detail'; title: string; subtitle: string; body: string }
  | null;

export interface NewDealInput {
  name: string;
  channel: 'CTV' | 'Display' | 'Audio' | 'DOOH';
  floor: string;
}

interface ActionModalProps {
  modal: ModalMode;
  onClose: () => void;
  onLoginSuccess: (initials: string, email: string) => void;
  onCreateDeal: (deal: NewDealInput) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  modal,
  onClose,
  onLoginSuccess,
  onCreateDeal,
}) => {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [dealName, setDealName] = useState('');
  const [dealChannel, setDealChannel] = useState<NewDealInput['channel']>('CTV');
  const [dealFloor, setDealFloor] = useState('14.20');
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSubmittedMsg(null);
    setErrorMsg(null);
    setEmail('');
    setCompany('');
    setDealName('');
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, onClose]);

  if (!modal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (modal.kind === 'new-deal') {
      const trimmed = dealName.trim();
      const numFloor = parseFloat(dealFloor);
      if (!trimmed) {
        setErrorMsg('Please enter a deal package name.');
        return;
      }
      if (Number.isNaN(numFloor) || numFloor <= 0) {
        setErrorMsg('Please enter a valid positive floor price.');
        return;
      }
      onCreateDeal({
        name: trimmed,
        channel: dealChannel,
        floor: `$${numFloor.toFixed(2)}`,
      });
      onClose();
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    if (modal.kind === 'login') {
      const localPart = cleanEmail.split('@')[0] || 'NL';
      const initials = localPart.slice(0, 2).toUpperCase();
      onLoginSuccess(initials, cleanEmail);
      onClose();
      return;
    }

    if (modal.kind === 'signup') {
      setSubmittedMsg(`Workspace provisioned for ${cleanEmail}. Ready offline & online.`);
      return;
    }

    if (modal.kind === 'call') {
      setSubmittedMsg(
        `Session request queued for ${cleanEmail}${company.trim() ? ` (${company.trim()})` : ''}.`,
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060318]/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nl-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[rgba(205,190,255,0.22)] bg-[#171042]/95 p-6 text-[#f4f2ff] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[rgba(220,214,255,0.5)]">
              Nectarline Studio
            </p>
            <h2 id="nl-modal-title" className="mt-1 text-2xl font-normal tracking-tight">
              {modal.kind === 'signup' && 'Create your curation workspace'}
              {modal.kind === 'call' && 'Book a studio walkthrough'}
              {modal.kind === 'login' && 'Sign in to Nectarline'}
              {modal.kind === 'new-deal' && 'Create curated deal ID'}
              {modal.kind === 'detail' && modal.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg border border-[rgba(205,190,255,0.18)] px-2.5 py-1 text-xs text-[rgba(236,232,255,0.72)] transition hover:bg-white/10 hover:text-white"
          >
            Esc
          </button>
        </div>

        {modal.kind === 'detail' ? (
          <div className="mt-4 space-y-4">
            <p className="font-mono text-xs text-[#8d94ff]">{modal.subtitle}</p>
            <p className="text-sm leading-relaxed text-[rgba(236,232,255,0.78)]">{modal.body}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#6f78ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8d94ff]"
              >
                Done
              </button>
            </div>
          </div>
        ) : submittedMsg ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[rgba(80,220,160,0.28)] bg-[rgba(80,220,160,0.1)] p-4 text-sm text-[#7cf0bd]">
              {submittedMsg}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-[#6f78ff] py-2.5 text-sm font-medium text-white transition hover:bg-[#8d94ff]"
            >
              Return to Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {modal.kind === 'new-deal' ? (
              <>
                <div>
                  <label htmlFor="nl-deal-name" className="block text-xs text-[rgba(220,214,255,0.65)]">
                    Deal Name
                  </label>
                  <input
                    id="nl-deal-name"
                    type="text"
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                    placeholder="e.g. Dusk CTV Context Pack"
                    className="mt-1.5 w-full rounded-xl border border-[rgba(190,170,255,0.22)] bg-[#0f0930] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#8d94ff]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nl-deal-channel" className="block text-xs text-[rgba(220,214,255,0.65)]">
                      Channel
                    </label>
                    <select
                      id="nl-deal-channel"
                      value={dealChannel}
                      onChange={(e) => setDealChannel(e.target.value as NewDealInput['channel'])}
                      className="mt-1.5 w-full rounded-xl border border-[rgba(190,170,255,0.22)] bg-[#0f0930] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8d94ff]"
                    >
                      <option value="CTV">CTV</option>
                      <option value="Display">Display</option>
                      <option value="Audio">Audio</option>
                      <option value="DOOH">DOOH</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nl-deal-floor" className="block text-xs text-[rgba(220,214,255,0.65)]">
                      Floor CPM ($)
                    </label>
                    <input
                      id="nl-deal-floor"
                      type="number"
                      step="0.10"
                      value={dealFloor}
                      onChange={(e) => setDealFloor(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[rgba(190,170,255,0.22)] bg-[#0f0930] px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-[#8d94ff]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="nl-email" className="block text-xs text-[rgba(220,214,255,0.65)]">
                    Work Email
                  </label>
                  <input
                    id="nl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@agency.com"
                    className="mt-1.5 w-full rounded-xl border border-[rgba(190,170,255,0.22)] bg-[#0f0930] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#8d94ff]"
                  />
                </div>
                {modal.kind !== 'login' && (
                  <div>
                    <label htmlFor="nl-company" className="block text-xs text-[rgba(220,214,255,0.65)]">
                      Organization (optional)
                    </label>
                    <input
                      id="nl-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Media Trading Desk"
                      className="mt-1.5 w-full rounded-xl border border-[rgba(190,170,255,0.22)] bg-[#0f0930] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#8d94ff]"
                    />
                  </div>
                )}
              </>
            )}

            {errorMsg && (
              <p role="alert" className="text-xs text-[#ff8fd8]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#6f78ff] py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-[#8d94ff]"
            >
              {modal.kind === 'signup' && "Get Started — it's Free"}
              {modal.kind === 'call' && 'Request Call'}
              {modal.kind === 'login' && 'Sign In'}
              {modal.kind === 'new-deal' && 'Launch Deal ID'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
