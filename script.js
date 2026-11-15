(function () {
  var root = document.documentElement;
  var langBtn = document.getElementById('lang-btn');
  var themeBtn = document.getElementById('theme-btn');

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    langBtn.textContent = lang === 'ar' ? 'English' : 'عربي';
    store('lang', lang);
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    store('theme', theme);
  }

  var params = new URLSearchParams(location.search);
  var startLang = params.get('lang') || read('lang') || 'en';
  var startTheme = params.get('theme') || read('theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  setLang(startLang === 'ar' ? 'ar' : 'en');
  setTheme(startTheme === 'light' ? 'light' : 'dark');

  langBtn.addEventListener('click', function () { setLang(root.lang === 'ar' ? 'en' : 'ar'); });
  themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
})();

/* app details dialog */
(function () {
  var dlg = document.getElementById('app-dialog');
  var body = document.getElementById('app-dialog-body');
  if (!dlg || !body) return;

  function openApp(card) {
    var d = card.querySelector('.detail');
    if (!d) return;
    body.innerHTML = d.innerHTML;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    dlg.scrollTop = 0;
  }

  document.addEventListener('click', function (e) {
    if (dlg.contains(e.target)) {
      if (e.target.closest('[data-close]')) dlg.close();
      return;
    }
    if (e.target === dlg) { dlg.close(); return; }
    if (e.target.closest('a')) return;               // let store links work
    var card = e.target.closest('.card[data-app]');
    if (card) openApp(card);
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();

/* open an app panel from a link like index.html#app-skp */
(function () {
  function openFromHash() {
    var m = /^#app-([a-z-]+)$/.exec(location.hash || '');
    if (!m) return;
    var card = document.querySelector('.card[data-app="' + m[1] + '"]');
    if (card) card.click();
  }
  window.addEventListener('load', openFromHash);
})();
