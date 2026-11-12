import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="nav-pill grey"
        aria-label="Install Nectarline App"
      >
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="nav-pill grey"
          aria-label="Install Nectarline on iOS"
        >
          Install App
        </button>
        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[rgba(205,190,255,0.22)] bg-[#140e3e]/95 p-6 text-[#f4f2ff] shadow-2xl">
              <h3 id="ios-install-title" className="text-lg font-medium">
                Install Nectarline on iPhone / iPad
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(236,232,255,0.75)]">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#6f78ff] py-2.5 text-sm font-medium text-white transition hover:bg-[#8d94ff]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-[rgba(205,190,255,0.28)] bg-[#160f46]/95 px-3 py-1.5 font-mono text-xs text-[#f4f2ff] shadow-xl"
    >
      <span className="h-2 w-2 rounded-full bg-[#7cf0bd]" />
      Offline Mode — Running locally
    </div>
  );
};
