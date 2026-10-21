(function(){
  // scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // program carousels (home page chapters)
  document.querySelectorAll('.program').forEach(function(sec){
    var slides = sec.querySelectorAll('.slide');
    var imgs = sec.querySelectorAll('.slide-img');
    var dots = sec.querySelectorAll('.dot');
    var capEl = sec.querySelector('.cap-day');
    var n = Math.max(slides.length, imgs.length);
    var cur = 0;

    function render(){
      slides.forEach(function(s,i){ s.classList.toggle('active', i===cur); });
      imgs.forEach(function(im,i){ im.classList.toggle('active', i===cur); });
      dots.forEach(function(d,i){ d.classList.toggle('active', i===cur); });
      if (capEl) {
        var dayEl = slides[cur].querySelector('.slide-day');
        var titleEl = slides[cur].querySelector('h2');
        capEl.textContent = (dayEl ? dayEl.textContent : '') + ' — ' + (titleEl ? titleEl.textContent : '');
      }
    }
    function go(i){ cur = (i + n) % n; render(); }

    var prevBtn = sec.querySelector('.arrow.prev');
    var nextBtn = sec.querySelector('.arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', function(){ go(cur-1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ go(cur+1); });
    dots.forEach(function(d){ d.addEventListener('click', function(){ go(parseInt(d.getAttribute('data-goto'),10)); }); });
    render();
  });
  // galerie faune et paysages (accueil) : defilement automatique en boucle + defilement manuel
  // (molette horizontale, pave tactile, glisser tactile ou a la souris), sans fleches
  (function(){
    var box = document.querySelector('.gallery');
    var track = box && box.querySelector('.gallery-track');
    var first = track && track.querySelector('.gallery-set');
    if (!first) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // defilement manuel seulement, sans animation
    var second = first.cloneNode(true), third = first.cloneNode(true);
    track.appendChild(second); track.appendChild(third);
    var W = 0, pos = 0, lastSet = 0, lastUser = -3000, hover = false, touching = false, dragging = false, visible = true, prev = 0;
    function measure(){ W = second.offsetLeft - first.offsetLeft; }
    function put(x){ lastSet = x; box.scrollLeft = x; }
    function wrap(x){
      if (!W) return x;
      while (x >= 2 * W) x -= W;
      while (x < W) x += W;
      return x;
    }
    function init(){
      var rel = W ? ((box.scrollLeft - W) / W) : 0; // conserve la position relative apres un redimensionnement
      measure();
      pos = wrap(W + (rel > 0 && rel < 1 ? rel * W : 0));
      put(pos);
    }
    function speed(){ return window.innerWidth <= 640 ? 90 : 120; }
    function frame(t){
      var dt = prev ? Math.min(t - prev, 100) / 1000 : 0;
      prev = t;
      var idle = !hover && !touching && !dragging && (t - lastUser > 2500);
      if (visible && !document.hidden && idle && W) {
        pos += speed() * dt;
        var w = wrap(pos);
        if (w !== pos) pos = w;
        put(pos);
      } else {
        pos = box.scrollLeft;
      }
      requestAnimationFrame(frame);
    }
    box.addEventListener('scroll', function(){
      var sl = box.scrollLeft;
      if (Math.abs(sl - lastSet) > 2) lastUser = performance.now(); // defilement initie par la personne
      if (W && (sl >= 2 * W || sl < W)) { var x = wrap(sl); sl0 += (x - sl); put(x); pos = x; }
    }, { passive: true });
    box.addEventListener('touchstart', function(){ touching = true; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('touchend', function(){ touching = false; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('touchcancel', function(){ touching = false; }, { passive: true });
    box.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse') { hover = false; lastUser = performance.now() - 2000; } });
    // glisser a la souris
    var sx = 0, sl0 = 0;
    box.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; sx = e.clientX; sl0 = box.scrollLeft; box.classList.add('dragging');
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
    });
    box.addEventListener('pointermove', function(e){
      if (!dragging) return;
      lastUser = performance.now();
      box.scrollLeft = sl0 - (e.clientX - sx);
    });
    function endDrag(){ if (!dragging) return; dragging = false; box.classList.remove('dragging'); lastUser = performance.now(); }
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);
    box.addEventListener('dragstart', function(e){ e.preventDefault(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(box);
    }
    window.addEventListener('resize', init);
    window.addEventListener('load', init);
    init();
    requestAnimationFrame(frame);
  })();
  // menu hamburger
  (function(){
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    function setOpen(open){
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function(){ if (window.innerWidth > 860) setOpen(false); });
  })();
})();
