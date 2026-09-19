/* Arc carousel (adapted from carrusel-arco.html).
   Usage: <div data-carousel> with a <script type="application/json" class="carousel-data">[{name,role,img,hue}]; img is a path relative to the page folder (e.g. "comite/3_patmic.png"; a leading "/" is ignored)</script>.
   window.initCarousels(root) can be called again after injecting markup. */
(function(){
  "use strict";

  const CFG = { step: 20, radius: 460, dragFactor: 1.1, ease: 0.12 };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mod = (a, n) => ((a % n) + n) % n;
  const pad = n => String(n).padStart(2, "0");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const initials = s => s.replace(/^(PhD\.|MSc\.)\s*/, "").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  function init(root){
    if (root.__carousel) return;
    root.__carousel = true;

    let items;
    try { items = JSON.parse(root.querySelector(".carousel-data").textContent); } catch (e) { return; }
    const N = items.length;
    if (!N) return;

    root.insertAdjacentHTML("beforeend",
      '<div class="tc-stage" tabindex="0" role="group" aria-roledescription="carrusel" aria-label="Comité organizador">' +
        '<div class="tc-track"></div></div>' +
      '<div class="tc-foot">' +
        '<div class="tc-nav"><button type="button" class="tc-prev" aria-label="Anterior">‹</button>' +
        '<button type="button" class="tc-next" aria-label="Siguiente">›</button></div>' +
        '<div class="tc-info"><h3 class="tc-name">—</h3><p class="tc-role"></p><div class="tc-dots"></div></div>' +
      '</div>');

    const stage = root.querySelector(".tc-stage"), track = root.querySelector(".tc-track");
    const dotsEl = root.querySelector(".tc-dots"), nameEl = root.querySelector(".tc-name"), roleEl = root.querySelector(".tc-role");
    

    let pos = 0, target = 0, active = -1;
    let dragging = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;

    const nearestIndex = i => { let d = mod(i - target, N); if (d > N / 2) d -= N; return target + d; };
    const goTo = t => { target = Math.round(t); };

    const cards = items.map((it, i) => {
      const base = (root.closest("[data-base]") || {dataset:{}}).dataset.base || document.baseURI;
      const src = it.img ? new URL(String(it.img).replace(/^\/+/, ""), base).href : "";
      const hue = it.hue != null ? it.hue : 95 + i * 38;
      const c = document.createElement("div");
      c.className = "tc-card";
      c.setAttribute("role", "group");
      c.setAttribute("aria-label", (i + 1) + " de " + N + ": " + it.name);
      c.innerHTML = (src
        ? '<img src="' + esc(src) + '" alt="' + esc(it.name) + '">'
        : '<div class="tc-art" style="background:radial-gradient(70% 45% at 50% 36%,hsla(' + hue + ',85%,60%,.55),transparent 72%),' +
          'linear-gradient(160deg,hsl(' + hue + ',40%,20%),hsl(' + (hue + 20) + ',35%,8%))"><b>' + esc(initials(it.name)) + '</b></div>') +
        '<span class="tc-num">' + pad(i + 1) + '</span>';
      c.addEventListener("click", () => { if (!moved) goTo(nearestIndex(i)); });
      track.appendChild(c);
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Ir a " + it.name);
      d.addEventListener("click", () => goTo(nearestIndex(i)));
      dotsEl.appendChild(d);
      return c;
    });

    function sync(i){
      const it = items[i];
      nameEl.style.opacity = 0;
      setTimeout(() => { nameEl.textContent = it.name; roleEl.textContent = it.role || ""; nameEl.style.opacity = 1; }, 110);
      [].forEach.call(dotsEl.children, (d, k) => d.classList.toggle("active", k === i));
    }

    function render(){
      cards.forEach((c, i) => {
        let off = mod(i - pos, N); if (off > N / 2) off -= N;
        const a = off * CFG.step * Math.PI / 180;
        const x = Math.sin(a) * CFG.radius;
        const z = (1 - Math.cos(a)) * CFG.radius * 0.55;
        const abs = Math.abs(off);
        c.style.transform = "translate3d(" + x + "px,0," + z + "px) rotateY(" + (-off * CFG.step) + "deg)";
        c.style.opacity = abs > N / 2 - 0.6 ? Math.max(0, (N / 2 - abs) / 0.6) : 1;
        c.style.zIndex = Math.round(100 - abs * 10);
        c.style.filter = "brightness(" + (1 - Math.min(abs, 3) * 0.12) + ")";
      });
      const idx = mod(Math.round(pos), N);
      if (idx !== active){ active = idx; sync(idx); }
    }

    function loop(){
      if (!root.isConnected) return;
      if (!dragging){
        const d = target - pos;
        pos = Math.abs(d) < 0.0005 ? target : pos + d * (reduce ? 1 : CFG.ease);
      }
      render();
      requestAnimationFrame(loop);
    }

    const pxPerCard = () => Math.sin(CFG.step * Math.PI / 180) * CFG.radius;
    stage.addEventListener("pointerdown", e => {
      dragging = true; moved = false; startX = lastX = e.clientX; startPos = pos; lastT = performance.now(); vel = 0;
      stage.classList.add("dragging");
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", e => {
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      pos = startPos - dx / pxPerCard() * CFG.dragFactor;
      vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; stage.classList.remove("dragging");
      target = Math.round(pos - vel * 4);
      setTimeout(() => { moved = false; }, 0);
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    let wheelLock = 0;
    stage.addEventListener("wheel", e => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!d) return;
      e.preventDefault();
      const now = Date.now(); if (now - wheelLock < 350) return;
      wheelLock = now; goTo(target + Math.sign(d));
    }, { passive: false });

    stage.addEventListener("keydown", e => {
      if (e.key === "ArrowRight"){ goTo(target + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft"){ goTo(target - 1); e.preventDefault(); }
    });
    root.querySelector(".tc-next").addEventListener("click", () => goTo(target + 1));
    root.querySelector(".tc-prev").addEventListener("click", () => goTo(target - 1));

    goTo(0); pos = target;
    loop();
  }

  window.initCarousels = function(scope){
    (scope || document).querySelectorAll("[data-carousel]").forEach(init);
  };
  window.initCarousels(document);
})();
