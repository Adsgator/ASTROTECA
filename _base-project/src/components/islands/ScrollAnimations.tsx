// ScrollAnimations — scroll suave (Lenis) + animações de entrada via GSAP ScrollTrigger.
//
// Funcionalidades:
//   - Smooth scroll gerenciado pelo Lenis com integração ao GSAP ticker
//   - Smooth scroll para âncoras internas (a[href^="#"]) com offset de -80px
//   - Animações de entrada individuais via [data-animate]
//   - Animações da esquerda via [data-animate-left]
//   - Animações da direita via [data-animate-right]
//   - Animação de escala via [data-animate-scale]
//   - Animações de grupo com stagger via [data-animate-group] + [data-animate-item]
//   - Contador numérico animado via [data-counter="150"]
//   - Parallax sutil via [data-parallax="0.3"]
//   - Desativado automaticamente quando prefers-reduced-motion está ativo
//
// Uso nas seções:
//   <div data-animate>...</div>
//   <div data-animate-left>...</div>
//   <div data-animate-right>...</div>
//   <div data-animate-scale>...</div>
//   <div data-animate-group>
//     <div data-animate-item>...</div>
//   </div>
//   <span data-counter="1500">0</span>
//   <div data-parallax="0.3">...</div>
//
// Deve ser usado com client:load no Layout.

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    // Importação dinâmica para evitar SSR — Lenis e GSAP são client-only
    (async () => {
      const { default: Lenis } = await import('lenis');
      const gsap = (await import('gsap')).default;
      const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');

      // Registrar plugin
      gsap.registerPlugin(ScrollTrigger);

      // Inicializar Lenis
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      // Integração GSAP ScrollTrigger com Lenis
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Smooth scroll para âncoras internas
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e: Event) => {
          e.preventDefault();
          const href = (anchor as HTMLAnchorElement).getAttribute('href');
          const target = href ? document.querySelector(href) : null;
          if (target) {
            lenis.scrollTo(target, { offset: -80 });
          }
        });
      });

      // Sem animações se o usuário prefere movimento reduzido
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // ── [data-animate] — entra de baixo ──────────────────────
      gsap.utils.toArray<Element>('[data-animate]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ── [data-animate-left] — entra da esquerda ──────────────
      gsap.utils.toArray<Element>('[data-animate-left]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ── [data-animate-right] — entra da direita ───────────────
      gsap.utils.toArray<Element>('[data-animate-right]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ── [data-animate-scale] — escala de 0.95 para 1 ─────────
      gsap.utils.toArray<Element>('[data-animate-scale]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ── [data-animate-group] — stagger nos filhos ─────────────
      gsap.utils.toArray<Element>('[data-animate-group]').forEach((group) => {
        const children = group.querySelectorAll('[data-animate-item]');
        gsap.fromTo(
          children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: group,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ── [data-counter="N"] — contador numérico animado ────────
      // Dispara quando entra na viewport; formata milhar se > 999
      gsap.utils.toArray<Element>('[data-counter]').forEach((el) => {
        const target = parseFloat((el as HTMLElement).dataset.counter ?? '0');
        const isInteger = Number.isInteger(target);
        const obj = { value: 0 };

        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate() {
            const current = isInteger ? Math.round(obj.value) : parseFloat(obj.value.toFixed(1));
            el.textContent =
              current > 999
                ? current.toLocaleString('pt-BR')
                : String(current);
          },
        });
      });

      // ── [data-parallax="factor"] — parallax sutil ─────────────
      // factor: 0.1 (sutil) a 0.5 (intenso). Movimento vertical no scroll.
      gsap.utils.toArray<Element>('[data-parallax]').forEach((el) => {
        const factor = parseFloat((el as HTMLElement).dataset.parallax ?? '0.2');
        const distance = window.innerHeight * factor;

        gsap.fromTo(
          el,
          { y: -distance / 2 },
          {
            y: distance / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    })();
  }, []);

  return null;
}
