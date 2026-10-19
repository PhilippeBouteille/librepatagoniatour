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
