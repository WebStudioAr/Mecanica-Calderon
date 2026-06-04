/* ============================================================
   MECÁNICA CALDERÓN — interacciones
   ============================================================ */
(function () {
  'use strict';

  /* JS confirmed: enable reveal animations (content stays visible if this never runs) */
  document.documentElement.classList.add('js');

  /* ---- Intro / presentación de apertura ---- */
  var intro = document.getElementById('intro');
  if (intro) {
    var hideIntro = function () {
      intro.classList.add('intro-hide');
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
    };
    /* se muestra un instante y se desvanece sola */
    window.addEventListener('load', function () { setTimeout(hideIntro, 1100); });
    /* failsafe por si 'load' tarda demasiado */
    setTimeout(hideIntro, 3500);
  }

  /* ---- Navbar scrolled state ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    /* hero parallax */
    if (heroPhoto) {
      var y = Math.min(window.scrollY, window.innerHeight);
      heroPhoto.style.transform = 'translateY(' + (y * 0.22) + 'px) scale(1.12)';
    }
  }

  /* ---- Mobile drawer ---- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function closeDrawer() { drawer.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });

  /* ---- Hero parallax target ---- */
  var heroPhoto = document.querySelector('.hero-photo');

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll (scroll-position based — robust everywhere) ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function checkReveals() {
    var trigger = window.innerHeight * 0.92;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals, { passive: true });
  checkReveals();
  // re-check after fonts/layout settle and as a failsafe
  setTimeout(checkReveals, 200);
  window.addEventListener('load', checkReveals);

  /* Robustness bail-out: if CSS transitions can't run in this environment
     (e.g. some capture/preview contexts), reveals would stay invisible.
     Detect it and hard-show everything (transition disabled) so content
     is never permanently hidden. */
  setTimeout(function () {
    var probe = document.querySelector('.reveal.in') || document.querySelector('.reveal');
    if (probe && parseFloat(getComputedStyle(probe).opacity) < 0.5) {
      document.documentElement.classList.remove('js');
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }, 2500);

  /* ---- Active nav link on scroll ---- */
  var sections = ['servicios', 'nosotros', 'galeria', 'porque', 'contacto']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('.nav-links a');
  function setActive() {
    var pos = window.scrollY + 140;
    var current = null;
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function (a) {
      a.style.color = (a.getAttribute('href') === '#' + current) ? 'var(--ink)' : '';
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
})();
