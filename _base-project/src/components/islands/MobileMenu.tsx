// MobileMenu — hambúrguer + overlay fullscreen para navegação mobile.
//
// Funcionalidades:
//   - Bloqueia scroll do body quando aberto
//   - Fecha com tecla Escape
//   - Focus trap acessível (Tab / Shift+Tab fica no modal)
//   - Animações via Framer Motion com respeito a prefers-reduced-motion
//   - Renderizado via portal no document.body (escapa do stacking context do header)
//
// Props:
//   links     — array de { label, href } para os itens de navegação
//   ctaLabel  — texto do botão CTA de WhatsApp no fundo do menu
//   ctaHref   — link do WhatsApp (use WA_LINK do projeto)
//
// TODO: o logo dentro do overlay aponta para um asset do projeto.
//       Substitua a importação de `logoImg` pelo logo real do cliente.

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// TODO: substitua pela imagem real do logo do cliente
// import logoImg from '../../assets/images/logo.webp';

interface NavLink {
  label: string;
  href: string;
}

interface Props {
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  // TODO: passe logoSrc como prop vindo do Header da biblioteca, ou importe aqui
  logoSrc?: string;
  logoAlt?: string;
}

export default function MobileMenu({ links, ctaLabel, ctaHref, logoSrc, logoAlt = 'Logo' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      firstLinkRef.current?.focus();
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [isOpen]);

  // Fechar com Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const linkVariants = {
    closed: { opacity: 0, y: prefersReduced ? 0 : 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: prefersReduced ? 0 : 0.1 + i * 0.05, duration: 0.35, ease: 'easeOut' },
    }),
  };

  return (
    <div className="lg:hidden">
      {/* Botão hambúrguer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="relative w-10 h-10 flex flex-col justify-center items-center gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <motion.span
          className="block w-6 h-[1.5px] bg-text-main origin-center"
          animate={isOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.25 }}
        />
        <motion.span
          className="block w-6 h-[1.5px] bg-text-main"
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
        />
        <motion.span
          className="block w-6 h-[1.5px] bg-text-main origin-center"
          animate={isOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.25 }}
        />
      </button>

      {/* Overlay fullscreen — portal para document.body para escapar do stacking context do header */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed inset-0 z-[100] bg-[#1d1d1c] flex flex-col px-8 py-8"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: prefersReduced ? 0 : 0.3 }}
          >
            {/* Cabeçalho do overlay */}
            <div className="flex items-center justify-between mb-16">
              {/* TODO: substitua pelo logo real do cliente */}
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-16 w-auto"
                />
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="3" x2="17" y2="17" />
                  <line x1="17" y1="3" x2="3" y2="17" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-2 flex-1" aria-label="Menu mobile">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                  className="font-serif text-4xl text-white/80 hover:text-white transition-colors py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            {/* CTA no fundo */}
            <motion.a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              custom={links.length + 1}
              variants={linkVariants}
              initial="closed"
              animate="open"
              id="btn-mobile-menu-wa"
              data-tracking="click-whatsapp-menu-mobile"
              data-section="mobile-menu"
              className="btn-secondary-gold-mobile flex items-center justify-center gap-3 w-full py-4 text-text-main font-sans font-medium text-base rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.075.528 4.025 1.456 5.732L0 24l6.458-1.427C8.137 23.497 10.025 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.86 0-3.629-.476-5.182-1.314l-.371-.218-3.831.847.86-3.726-.24-.386A9.927 9.927 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {ctaLabel}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

    </div>
  );
}
