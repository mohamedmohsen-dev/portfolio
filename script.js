(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var AR = function () { return root.lang === 'ar'; };

  /* language and theme */
  var langBtn = $('#lang-btn'), themeBtn = $('#theme-btn');
  function setLang(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    langBtn.textContent = l === 'ar' ? 'English' : 'عربي';
    themeBtn.textContent = (root.getAttribute('data-theme') === 'dark') ? (l === 'ar' ? 'فاتح' : 'Light') : (l === 'ar' ? 'داكن' : 'Dark');
    store('lang', l);
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? (AR() ? 'فاتح' : 'Light') : (AR() ? 'داكن' : 'Dark');
    store('theme', t);
  }
  var qs = new URLSearchParams(location.search);
  var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setLang((qs.get('lang') || read('lang') || 'en') === 'ar' ? 'ar' : 'en');
  setTheme((qs.get('theme') || read('theme') || (sysDark ? 'dark' : 'light')) === 'dark' ? 'dark' : 'light');
  langBtn.addEventListener('click', function () { setLang(AR() ? 'en' : 'ar'); });
  themeBtn.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });

  /* reveal on scroll (everything stays visible if this fails) */
  root.classList.add('js');
  var reveals = $$('.reveal');
  function showAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { $$('.hero .reveal').forEach(function (el) { el.classList.add('in'); }); }, 60);
    setTimeout(showAll, 6000);
  }

  /* count up */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1300;
    if (reduce) { el.textContent = to; return; }
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else { counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); }); }

  /* progress bar and active nav */
  var bar = $('#progress'), sections = $$('main section[id]'), links = $$('.nav-links a');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    var y = window.scrollY + 150, cur = '';
    sections.forEach(function (s) { if (s.offsetTop <= y && s.offsetParent !== null) cur = s.id; });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* hero phones follow the pointer */
  var stage = $('#stage'), hero = $('.hero');
  if (!reduce && hero && stage) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      stage.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      stage.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    hero.addEventListener('mouseleave', function () { stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); });
  }

  /* copy email */
  var copy = $('#copy-mail');
  if (copy) copy.addEventListener('click', function () {
    var label = copy.innerHTML;
    function done() { copy.textContent = AR() ? 'تم النسخ ✓' : 'Copied ✓'; setTimeout(function () { copy.innerHTML = label; }, 1600); }
    try { navigator.clipboard.writeText('mohamedmohsen8901@gmail.com').then(done, done); } catch (e) { done(); }
  });

  /* app details dialog */
  var dlg = $('#app-dialog'), body = $('#app-dialog-body');
  function openApp(card) {
    var d = card.querySelector('.detail'); if (!d || !dlg) return;
    body.innerHTML = d.innerHTML;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    dlg.scrollTop = 0;
  }
  document.addEventListener('click', function (e) {
    if (!dlg) return;
    if (dlg.contains(e.target)) { if (e.target.closest('[data-close]')) dlg.close(); return; }
    if (e.target === dlg) { dlg.close(); return; }
    if (e.target.closest('a')) return;
    var card = e.target.closest('.card[data-app]');
    if (card) openApp(card);
  });
  if (dlg) dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  window.addEventListener('load', function () {
    var m = /^#app-([a-z-]+)$/.exec(location.hash || '');
    if (m) { var c = document.querySelector('.card[data-app="' + m[1] + '"]'); if (c) openApp(c); }
  });
})();
