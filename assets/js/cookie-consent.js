/* Libre Patagonia Tour — bandeau de consentement cookies (ES / EN / PT)
   - Choix mémorisé dans localStorage (clé lpt_cookie_consent), 12 mois.
   - Aucun cookie d'analyse ou de marketing n'est déposé tant que le visiteur n'a pas accepté.
   - Pour brancher un outil de mesure plus tard : window.cookieConsent.onAccept(function(){ ...charger le script... });
   - Lien de réouverture : n'importe quel élément avec l'attribut data-cookie-settings (ajouté automatiquement au pied de page). */
(function(){
  var KEY = 'lpt_cookie_consent';
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var lang = (document.documentElement.lang || 'es').slice(0,2);

  var T = {
    es: {
      title: 'Cookies',
      text: 'Usamos solo cookies técnicas necesarias para que el sitio funcione. Con tu permiso, podríamos usar cookies de medición para mejorar la experiencia. Puedes cambiar tu elección en cualquier momento.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      settings: 'Preferencias de cookies'
    },
    en: {
      title: 'Cookies',
      text: 'We only use technical cookies that are necessary for the site to work. With your permission, we may use measurement cookies to improve your experience. You can change your choice at any time.',
      accept: 'Accept',
      reject: 'Reject',
      settings: 'Cookie settings'
    },
    pt: {
      title: 'Cookies',
      text: 'Usamos apenas cookies técnicos necessários para o funcionamento do site. Com a sua permissão, poderemos usar cookies de medição para melhorar a experiência. Você pode alterar sua escolha a qualquer momento.',
      accept: 'Aceitar',
      reject: 'Recusar',
      settings: 'Preferências de cookies'
    }
  };
  var L = T[lang] || T.es;
  var acceptCallbacks = [];

  function read(){
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || (o.value !== 'accepted' && o.value !== 'rejected')) return null;
      if (Date.now() - o.date > MAX_AGE) return null;
      return o.value;
    } catch (e) { return null; }
  }
  function write(v){
    try { localStorage.setItem(KEY, JSON.stringify({ value: v, date: Date.now() })); } catch (e) {}
  }

  function fire(v){
    if (v === 'accepted') { acceptCallbacks.forEach(function(fn){ try { fn(); } catch (e) {} }); }
    try { document.dispatchEvent(new CustomEvent('cookie-consent', { detail: { value: v } })); } catch (e) {}
  }

  function closeBanner(){
    var b = document.getElementById('cookie-banner');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function choose(v){
    write(v);
    closeBanner();
    fire(v);
  }

  function openBanner(){
    if (document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-live', 'polite');
    b.setAttribute('aria-label', L.title);

    var p = document.createElement('p');
    p.textContent = L.text;

    var actions = document.createElement('div');
    actions.className = 'cookie-actions';

    var rej = document.createElement('button');
    rej.type = 'button';
    rej.className = 'cookie-btn';
    rej.textContent = L.reject;
    rej.addEventListener('click', function(){ choose('rejected'); });

    var acc = document.createElement('button');
    acc.type = 'button';
    acc.className = 'cookie-btn';
    acc.textContent = L.accept;
    acc.addEventListener('click', function(){ choose('accepted'); });

    actions.appendChild(rej);
    actions.appendChild(acc);
    b.appendChild(p);
    b.appendChild(actions);
    document.body.appendChild(b);
  }

  function addFooterLink(){
    var bottom = document.querySelector('footer .foot-bottom');
    if (!bottom || bottom.querySelector('[data-cookie-settings]')) return;
    var a = document.createElement('a');
    a.href = '#';
    a.setAttribute('data-cookie-settings', '');
    a.className = 'cookie-settings-link';
    a.textContent = L.settings;
    bottom.appendChild(a);
  }

  function init(){
    addFooterLink();
    document.addEventListener('click', function(e){
      var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
      if (t) { e.preventDefault(); openBanner(); }
    });
    var v = read();
    if (v === null) { openBanner(); }
    else {
      // choix déjà fait : on signale seulement l'état (onAccept déclenche déjà ses rappels lui-même)
      try { document.dispatchEvent(new CustomEvent('cookie-consent', { detail: { value: v } })); } catch (e) {}
    }
  }

  window.cookieConsent = {
    get: read,
    onAccept: function(fn){
      acceptCallbacks.push(fn);
      if (read() === 'accepted') { try { fn(); } catch (e) {} }
    },
    open: openBanner
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
