// CookieBanner — aviso de cookies com suporte ao Google Consent Mode v2.
//
// Fluxo:
//   1. Na primeira visita exibe o banner (estado "pending")
//   2. Aceitar → salva em localStorage + dispara gtag consent update "granted"
//   3. Recusar → salva em localStorage + dispara gtag consent update "denied"
//   4. Em visitas seguintes, lê localStorage e aplica o consentimento silenciosamente
//
// Deve ser usado com client:idle no Layout.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type ConsentState = 'pending' | 'accepted' | 'rejected';

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored as ConsentState);
      if (stored === 'accepted') updateConsent(true);
    }
  }, []);

  function updateConsent(granted: boolean) {
    const value = granted ? 'granted' : 'denied';
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: value,
        analytics_storage: value,
        ad_user_data: value,
        ad_personalization: value,
      });
    }
  }

  function handleAccept() {
    localStorage.setItem('cookie-consent', 'accepted');
    updateConsent(true);
    setConsent('accepted');
  }

  function handleReject() {
    localStorage.setItem('cookie-consent', 'rejected');
    updateConsent(false);
    setConsent('rejected');
  }

  if (consent !== 'pending') return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label="Aviso de cookies"
        aria-live="polite"
        className="fixed bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-[200] bg-dark text-white rounded p-5 shadow-float"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <p className="font-sans text-sm text-white/80 leading-relaxed mb-4">
          Usamos cookies para melhorar sua experiência e para fins de análise e publicidade. Você pode aceitar ou recusar.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-primary text-white font-sans text-sm font-medium py-2.5 rounded-sm hover:bg-primary-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Aceitar
          </button>
          <button
            onClick={handleReject}
            className="flex-1 border border-white/20 text-white/60 font-sans text-sm py-2.5 rounded-sm hover:text-white hover:border-white/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Recusar
          </button>
        </div>
        <a
          href="/politica-de-privacidade"
          className="block mt-3 font-sans text-xs text-white/30 hover:text-white/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Política de privacidade
        </a>
      </motion.div>
    </AnimatePresence>
  );
}

declare global {
  interface Window { gtag: (...args: unknown[]) => void; }
}
