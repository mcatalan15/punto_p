import { gsap } from 'gsap';
import './style.css';

type Theme = 'red' | 'white';

const stage = document.getElementById('stage') as HTMLElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let busy = false;
let introActive = true;

/** The animatable pieces of one logo layer. */
function parts(layer: HTMLElement) {
  return {
    letters: layer.querySelectorAll<SVGPathElement>('.letter'),
    disc: layer.querySelector<SVGPathElement>('.disc')!,
    swirl: layer.querySelector<SVGPathElement>('.swirl')!,
    reveals: layer.querySelectorAll<HTMLElement>('.reveal'),
  };
}

/** Looping motion: the slice turns slowly and the letters bob in a wave. */
function startIdle(layer: HTMLElement) {
  if (reduceMotion) return;
  const { letters, swirl } = parts(layer);
  gsap.set(swirl, { transformOrigin: '50% 50%' });
  gsap.to(swirl, { rotation: '+=360', duration: 16, ease: 'none', repeat: -1 });
  gsap.to(letters, {
    y: -40,
    duration: 1.3,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: { each: 0.14 },
  });
}

/**
 * Intro:
 * 1. a big tomato spins in at the center,
 * 2. it shrinks away while the full logo drops down into place,
 * 3. the logo starts its idle motion and the colors flip to white.
 */
function playIntro(layer: HTMLElement) {
  const { letters, disc, swirl, reveals } = parts(layer);
  const bigTomato = layer.querySelector<SVGSVGElement>('.big-tomato')!;
  const bigSwirl = bigTomato.querySelector<SVGPathElement>('.big-swirl')!;
  gsap.set([disc, swirl, bigSwirl, bigTomato], { transformOrigin: '50% 50%' });

  gsap
    .timeline()
    .fromTo(
      bigTomato,
      { scale: 0, rotation: -360, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: 'elastic.out(1, 0.6)' },
    )
    .fromTo(bigSwirl, { rotation: -270 }, { rotation: 0, duration: 1.2, ease: 'power3.out' }, '<')
    .to({}, { duration: 0.5 })
    .to(bigTomato, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.in(1.7)' })
    .fromTo(
      letters,
      { y: -220, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.12 },
      '-=0.15',
    )
    .fromTo(
      disc,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.55)' },
      '-=0.6',
    )
    .fromTo(
      swirl,
      { rotation: -270, opacity: 0 },
      { rotation: 0, opacity: 1, duration: 1.4, ease: 'power3.out' },
      '<',
    )
    .fromTo(
      reveals,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.15 },
      '-=0.9',
    )
    .call(() => {
      bigTomato.remove();
      startIdle(layer);
    })
    .call(
      () => {
        introActive = false;
        swap();
      },
      undefined,
      '+=0.9',
    );
}

/**
 * Swaps red <-> white. A copy of the current screen is placed on top with the
 * new colors and revealed with a circle that grows out of the disc.
 */
function swap() {
  if (busy) return;
  const current = stage.querySelector<HTMLElement>(':scope > .layer');
  if (!current) return;

  const to: Theme = current.dataset.theme === 'red' ? 'white' : 'red';

  if (reduceMotion) {
    current.dataset.theme = to;
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const discRect = parts(current).disc.getBoundingClientRect();
  const x = discRect.left - stageRect.left + discRect.width / 2;
  const y = discRect.top - stageRect.top + discRect.height / 2;
  const radius = Math.hypot(
    Math.max(x, stageRect.width - x),
    Math.max(y, stageRect.height - y),
  );

  busy = true;
  gsap.killTweensOf(Array.from(current.querySelectorAll('*')));

  const next = current.cloneNode(true) as HTMLElement;
  next.dataset.theme = to;
  next.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  stage.appendChild(next);

  const reveal = { r: 0 };
  gsap.to(reveal, {
    r: radius,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      next.style.clipPath = `circle(${reveal.r}px at ${x}px ${y}px)`;
    },
    onComplete: () => {
      current.remove();
      next.style.clipPath = '';
      busy = false;
      startIdle(next);
    },
  });
}

stage.addEventListener('click', (event) => {
  if (introActive) return;
  if ((event.target as Element).closest('.logo-btn')) swap();
});

const first = stage.querySelector<HTMLElement>(':scope > .layer');
if (first) {
  if (reduceMotion) {
    introActive = false;
    first.querySelector('.big-tomato')?.remove();
    gsap.set(Array.from(first.querySelectorAll('.letter, .disc, .swirl, .reveal')), {
      opacity: 1,
    });
  } else {
    playIntro(first);
  }
}
