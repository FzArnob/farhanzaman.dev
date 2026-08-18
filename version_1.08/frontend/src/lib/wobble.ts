/**
 * Per-letter wobble — the site's signature hover flourish.
 *
 * This used to also run on every scroll event, rewriting each matched element's
 * text into `<span>`s as it went. That was a DOM write storm on scroll and it
 * destroyed the accessible text node mid-animation. Scroll-in is now handled by
 * the CSS `decode` reveal, and this file does hover/click only.
 */

/** Splits an element's text into per-letter spans and staggers the animation onto them. */
function animateLetters(element: HTMLElement): void {
  element.classList.add('animating', 'mouseover');

  const source = element.dataset.wobbleText ?? element.innerText;
  // Cache the original text once, so repeated hovers can't compound the markup.
  element.dataset.wobbleText = source;

  const letters = source.split('');
  const animationName = element.dataset.animation || 'jump';

  window.setTimeout(() => {
    element.classList.remove('animating');
  }, (letters.length + 1) * 50);

  const fragment = document.createDocumentFragment();
  for (const letter of letters) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = letter === ' ' ? ' ' : letter;
    fragment.appendChild(span);
  }
  element.replaceChildren(fragment);

  element.querySelectorAll<HTMLElement>('.letter').forEach((letter, index) => {
    window.setTimeout(() => letter.classList.add(animationName), 50 * index);
  });
}

/**
 * Binds hover/click wobbling to every `.wobble` in the document that isn't bound
 * yet. Called once a page is revealed, because React renders its markup after mount.
 */
export function initWobbleInteractions(): void {
  document.querySelectorAll<HTMLElement>('.wobble').forEach((element) => {
    if (element.dataset.wobbleBound === 'true') return;
    element.dataset.wobbleBound = 'true';

    const play = () => {
      if (element.classList.contains('animating')) return;
      animateLetters(element);
    };

    element.addEventListener('mouseover', play);
    element.addEventListener('click', play);
    element.addEventListener('animationend', () => {
      element.classList.remove('mouseover');
    });
  });
}
