(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var AR = function () { return root.lang === 'ar'; };

  /* ---------- language and theme ---------- */
  var langBtn = $('#lang-btn'), themeBtn = $('#theme-btn');
  function setLang(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    langBtn.textContent = l === 'ar' ? 'English' : 'عربي';
    store('lang', l);
    if (window.__onLang) window.__onLang();
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀' : '☾';
    store('theme', t);
  }
  var qs = new URLSearchParams(location.search);
  setLang((qs.get('lang') || read('lang') || 'en') === 'ar' ? 'ar' : 'en');
  var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme((qs.get('theme') || read('theme') || (sysDark ? 'dark' : 'light')) === 'dark' ? 'dark' : 'light');
  langBtn.addEventListener('click', function () { setLang(AR() ? 'en' : 'ar'); });
  themeBtn.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });

  /* ---------- reveal on scroll (everything stays visible if this fails) ---------- */
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
    setTimeout(showAll, 6000); // safety net
  }

  /* ---------- count up ---------- */
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

  /* ---------- progress bar, active nav, timeline ---------- */
  var bar = $('#progress'), tl = $('#timeline');
  var sections = $$('main section[id]');
  var links = $$('.nav-links a');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    var y = window.scrollY + 140, cur = '';
    sections.forEach(function (s) { if (s.offsetTop <= y && s.offsetParent !== null) cur = s.id; });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
    if (tl) {
      var r = tl.getBoundingClientRect(), p = (window.innerHeight * 0.6 - r.top) / r.height;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- hero: phone parallax and spotlight ---------- */
  var stage = $('#stage'), spot = $('#spot'), hero = $('.hero');
  if (!reduce && hero) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (spot) { spot.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); spot.style.setProperty('--sy', (y * 100).toFixed(1) + '%'); }
      if (stage) { stage.style.setProperty('--mx', ((x - 0.5) * 2).toFixed(3)); stage.style.setProperty('--my', ((y - 0.5) * 2).toFixed(3)); }
    });
    hero.addEventListener('mouseleave', function () { if (stage) { stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); } });
  }
  /* card glow follows the pointer */
  document.addEventListener('mousemove', function (e) {
    var c = e.target.closest && e.target.closest('.card[data-app]');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--cx', (e.clientX - r.left) + 'px'); c.style.setProperty('--cy', (e.clientY - r.top) + 'px');
  });

  /* ---------- copy email ---------- */
  var copy = $('#copy-mail');
  if (copy) copy.addEventListener('click', function () {
    var label = copy.innerHTML;
    function done() { copy.textContent = AR() ? 'تم النسخ ✓' : 'Copied ✓'; setTimeout(function () { copy.innerHTML = label; }, 1600); }
    try { navigator.clipboard.writeText('mohamedmohsen8901@gmail.com').then(done, done); } catch (e) { done(); }
  });

  /* ---------- demo tabs ---------- */
  var tabs = $$('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      $$('.demo').forEach(function (d) { d.classList.toggle('on', d.id === 'demo-' + t.getAttribute('data-tab')); });
      if (t.getAttribute('data-tab') === 'a') runA();
    });
  });

  var TXT = {
    en: {
      sending: 'Sending…', queued: 'Waiting for connection', retry: 'Failed once, retrying…', sent: 'Sent ✓',
      online: 'online', offline: 'offline', ph: 'Type a message', hi1: 'Hi! Is the order ready?', hi2: 'Yes, packing it now.',
      waiting: 'waiting…', done: 'done', ignored: 'ignored: not the latest', late: 'arrived late',
      showing: 'Showing', ok: 'Correct result', bad: 'Outdated result shown!', idle: 'Waiting for responses…',
      m0: 'Order received. Scan it at preparation first.', m1: 'Prepared. It can now be handed over.', m2: 'Delivered. Order closed.',
      mNotPrep: 'Blocked: the order is not prepared yet.', mWrong: 'Wrong code. Handover blocked.', mAlready: 'Nothing to do: this step is already done.',
      cairo: 'Cairo', giza: 'Giza'
    },
    ar: {
      sending: 'جارٍ الإرسال…', queued: 'بانتظار الاتصال', retry: 'فشل مرة، جارٍ إعادة المحاولة…', sent: 'تم الإرسال ✓',
      online: 'متصل', offline: 'غير متصل', ph: 'اكتب رسالة', hi1: 'مرحباً! هل الطلب جاهز؟', hi2: 'نعم، أجهّزه الآن.',
      waiting: 'بانتظار…', done: 'انتهى', ignored: 'تم تجاهله: ليس الأحدث', late: 'وصل متأخراً',
      showing: 'تعرض', ok: 'نتيجة صحيحة', bad: 'تظهر نتيجة قديمة!', idle: 'بانتظار الردود…',
      m0: 'تم استلام الطلب. امسحه عند التحضير أولاً.', m1: 'تم التحضير. يمكن تسليمه الآن.', m2: 'تم التسليم. أُغلق الطلب.',
      mNotPrep: 'ممنوع: الطلب لم يُحضَّر بعد.', mWrong: 'كود خاطئ. تم منع التسليم.', mAlready: 'لا شيء لفعله: هذه الخطوة تمت.',
      cairo: 'القاهرة', giza: 'الجيزة'
    }
  };
  function T(k) { return TXT[AR() ? 'ar' : 'en'][k]; }

  /* ---------- demo A: stale responses ---------- */
  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  var guard = $('#guard');
  function setBadge(cls, text) { var b = $('#scr-b'); b.className = 'badge ' + cls; b.textContent = text; }
  function runA() {
    clearTimers();
    var b1 = $('#bar1'), b2 = $('#bar2'), st1 = $('#st1'), st2 = $('#st2'), scr = $('#scr');
    [b1, b2].forEach(function (b) { b.classList.remove('run', 'ignored'); b.firstElementChild.style.transition = 'none'; b.firstElementChild.style.width = '0'; void b.offsetWidth; b.firstElementChild.style.transition = ''; b.firstElementChild.style.width = ''; });
    st1.textContent = T('waiting'); st2.textContent = ''; scr.textContent = '—'; setBadge('idle', T('idle'));
    var d1 = 2200, d2 = 900, gap = 500;
    if (reduce) {
      b1.classList.add('run'); b2.classList.add('run'); b1.style.setProperty('--dur', '0s'); b2.style.setProperty('--dur', '0s');
    } else { b1.style.setProperty('--dur', d1 + 'ms'); b2.style.setProperty('--dur', d2 + 'ms'); }
    b1.classList.add('run');
    later(function () { st2.textContent = T('waiting'); b2.classList.add('run'); }, gap);
    later(function () { st2.textContent = T('done'); scr.textContent = T('cairo'); setBadge('ok', T('ok')); }, gap + d2);
    later(function () {
      if (guard.checked) { st1.textContent = T('ignored'); b1.classList.add('ignored'); }
      else { st1.textContent = T('late'); scr.textContent = T('giza'); setBadge('bad', T('bad')); }
    }, d1);
  }
  if (guard) guard.addEventListener('change', runA);
  var rp = $('#replay-a'); if (rp) rp.addEventListener('click', runA);

  /* ---------- demo B: offline outbox ---------- */
  var chat = $('#chat'), wifi = $('#wifi'), net = $('#net'), form = $('#compose'), inp = $('#msg-in');
  var msgs = [], nid = 1, flushing = false;
  function draw() {
    chat.innerHTML = '';
    msgs.forEach(function (m) {
      var d = document.createElement('div');
      d.className = 'bubble ' + (m.me ? 'me ' : '') + m.status;
      var t = document.createElement('span'); t.textContent = m.text; d.appendChild(t);
      if (m.me) { var e = document.createElement('em'); e.textContent = T(m.status === 'queued' ? 'queued' : m.status); d.appendChild(e); }
      chat.appendChild(d);
    });
    net.className = 'net ' + (wifi.checked ? 'on' : 'off'); net.textContent = T(wifi.checked ? 'online' : 'offline');
    inp.placeholder = T('ph');
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  async function flush() {
    if (flushing) return; flushing = true;
    var first = true;
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      if (!m.me || m.status === 'sent') continue;
      if (!wifi.checked) break;
      m.status = 'sending'; draw(); await sleep(650);
      if (!wifi.checked) { m.status = 'queued'; draw(); break; }
      if (first && m.wasQueued) { m.status = 'retry'; draw(); await sleep(900); first = false; if (!wifi.checked) { m.status = 'queued'; draw(); break; } }
      m.status = 'sent'; draw(); await sleep(250);
    }
    flushing = false;
  }
  if (chat) {
    msgs.push({ id: 0, me: false, text: T('hi1'), status: 'sent' });
    msgs.push({ id: 0.5, me: true, text: T('hi2'), status: 'sent' });
    wifi.addEventListener('change', function () { draw(); if (wifi.checked) flush(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = inp.value.trim(); if (!v) return;
      var online = wifi.checked;
      msgs.push({ id: nid++, me: true, text: v, status: online ? 'sending' : 'queued', wasQueued: !online });
      inp.value = ''; draw();
      if (online) { flush(); }
    });
    draw();
  }

  /* ---------- demo C: order scanning ---------- */
  var oState = 0;
  function cMsg(key, cls) { var m = $('#c-msg'); if (!m) return; m.className = 'msg ' + (cls || ''); m.textContent = T(key); m.setAttribute('data-k', key); m.setAttribute('data-c', cls || ''); }
  function cSteps() { [1, 2, 3].forEach(function (n) { $('#s' + n).classList.toggle('done', oState + 1 >= n); }); }
  if ($('#c-prep')) {
    $('#c-prep').addEventListener('click', function () { if (oState === 0) { oState = 1; cSteps(); cMsg('m1', 'ok'); } else cMsg('mAlready', ''); });
    $('#c-bad').addEventListener('click', function () { cMsg(oState === 0 ? 'mNotPrep' : 'mWrong', 'bad'); });
    $('#c-ok').addEventListener('click', function () {
      if (oState === 0) cMsg('mNotPrep', 'bad');
      else if (oState === 1) { oState = 2; cSteps(); cMsg('m2', 'ok'); }
      else cMsg('mAlready', '');
    });
    $('#c-reset').addEventListener('click', function () { oState = 0; cSteps(); cMsg('m0', ''); });
    cSteps(); cMsg('m0', '');
  }

  window.__onLang = function () {
    if (chat) { msgs[0].text = T('hi1'); msgs[1].text = T('hi2'); draw(); }
    var m = $('#c-msg'); if (m && m.getAttribute('data-k')) cMsg(m.getAttribute('data-k'), m.getAttribute('data-c'));
    if ($('#demo-a') && $('#demo-a').classList.contains('on')) runA();
  };
  (function () {
    var d = $('#demos'); if (!d) return;
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { runA(); o.disconnect(); } }, { threshold: 0.25 });
      o.observe(d);
    } else { runA(); }
  })();

  /* ---------- app details dialog ---------- */
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
