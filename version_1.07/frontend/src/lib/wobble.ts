export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}

/** Splits an element's text into per-letter spans and staggers the animation class onto them. */
function animateLetters(el: HTMLElement, allowLineBreaks: boolean): void {
  el.classList.add('animating', 'mouseover');

  const letters = el.innerText.split('');

  setTimeout(function () {
    el.classList.remove('animating');
  }, (letters.length + 1) * 50);

  const animationName = el.dataset.animation || 'jump';

  el.innerText = '';

  letters.forEach(function (letter) {
    if (letter === ' ') {
      el.innerHTML += '<span class="letter">&nbsp;</span>';
    } else if (allowLineBreaks && letter === '$') {
      el.innerHTML += '<br/>';
    } else {
      el.innerHTML += '<span class="letter">' + letter + '</span>';
    }
  });

  const letterElements = el.querySelectorAll<HTMLElement>('.letter');
  letterElements.forEach(function (letter, i) {
    setTimeout(function () {
      letter.classList.add(animationName);
    }, 50 * i);
  });
}

/** Runs on every scroll: toggles the navbar background and plays the wobble for anything now in view. */
export function wobbleAnimation(): void {
  const navbar = document.getElementById('navbar');
  const scrollHeight = 70;

  if (navbar) {
    if (window.scrollY > scrollHeight) {
      navbar.classList.add('bg2');
      navbar.classList.add('nav-shadow');
    } else {
      navbar.classList.remove('bg2');
      navbar.classList.remove('nav-shadow');
    }
  }

  const wobbleElements = document.querySelectorAll<HTMLElement>('.wobble:not([data-animate-once])');
  wobbleElements.forEach(function (el) {
    if (isInViewport(el)) {
      if (!el.classList.contains('animating') && !el.classList.contains('mouseover')) {
        animateLetters(el, true);
      }
      el.addEventListener('animationend', function () {
        el.classList.remove('mouseover');
      });
      el.dataset.animateOnce = 'true';
    }
  });
}

function addListenerMulti(element: Element, eventNames: string, listener: EventListener): void {
  const events = eventNames.split(' ');
  for (let i = 0, iLen = events.length; i < iLen; i++) {
    element.addEventListener(events[i], listener, false);
  }
}

/**
 * Binds hover/click wobbling to every `.wobble` currently in the document.
 * Called once a page is revealed, since React renders its markup after mount.
 */
export function initWobbleInteractions(): void {
  const wobbleElements = document.querySelectorAll<HTMLElement>('.wobble');
  wobbleElements.forEach(function (el) {
    if (el.dataset.wobbleBound === 'true') return;
    el.dataset.wobbleBound = 'true';

    addListenerMulti(el, 'mouseover click', function () {
      if (!el.classList.contains('animating') && !el.classList.contains('mouseover')) {
        animateLetters(el, false);
      }
    });
    el.addEventListener('animationend', function () {
      el.classList.remove('mouseover');
    });
  });
}
