(function(){
  "use strict";

  /* ======================================================================
     SAMPLE DATA — replace with the real agenda.
     Format: { date:"YYYY-MM-DD", type, title, venue, speaker, body }
     ====================================================================== */
  const YEAR = 2026;
  const EVENTS = [
    { date:"2026-01-22", type:"Coloquio", title:"Física cuántica aplicada",
      venue:"Auditorio Central · Campus Norte", speaker:"Dra. Helena Vázquez",
      body:"Apertura del año con los resultados del laboratorio de coherencia cuántica. Sesión de preguntas abierta al público general." },
    { date:"2026-02-18", type:"Taller", title:"Datos abiertos en genómica",
      venue:"Laboratorio B2 · Bloque de Biociencias", speaker:"Eq. Bioinformática",
      body:"Taller práctico de tres horas sobre publicación de datasets genómicos reproducibles. Traer portátil con entorno preparado." },
    { date:"2026-03-12", type:"Simposio", title:"Clima andino y criosfera",
      venue:"Centro de Convenciones · Sala 1", speaker:"Panel interinstitucional",
      body:"Estado del retroceso glaciar y su efecto sobre las cuencas altas. Se presentan las series de los últimos quince años." },
    { date:"2026-04-09", type:"Jornada", title:"Robótica y control autónomo",
      venue:"Pabellón de Ingeniería", speaker:"Dr. Marco Iturralde",
      body:"Demostraciones en vivo de navegación autónoma en terreno irregular. Incluye visita guiada al banco de pruebas." },
    { date:"2026-05-21", type:"Congreso", title:"Neurociencia computacional",
      venue:"Auditorio Magno", speaker:"Comité científico",
      body:"Dos días de ponencias sobre modelos de red a gran escala. Convocatoria de pósters abierta hasta el 30 de abril." },
    { date:"2026-06-30", type:"Escuela", title:"Machine learning para ciencia",
      venue:"Campus Sur · Aulas 3–5", speaker:"Dra. Noor Haddad",
      body:"Escuela de verano de dos semanas sobre modelos sustitutos y cuantificación de incertidumbre. Cupos limitados." },
    { date:"2026-08-14", type:"Divulgación", title:"Noche de observación",
      venue:"Observatorio · Terraza norte", speaker:"Club de Astronomía",
      body:"Observación del cielo de agosto con telescopios abiertos al público. Charla previa sobre fotometría amateur." },
    { date:"2026-09-24", type:"Encuentro", title:"Materiales avanzados",
      venue:"Sala de Grados", speaker:"Dr. Tobias Lindqvist",
      body:"Encuentro sobre recubrimientos cerámicos de alta temperatura y su caracterización. Sesión conjunta con la industria." },
    { date:"2026-10-16", type:"Foro", title:"Ética en inteligencia artificial",
      venue:"Aula Magna", speaker:"Mesa redonda",
      body:"Foro abierto sobre evaluación de riesgos en sistemas desplegados. Participan investigación, derecho y salud pública." },
    { date:"2026-11-27", type:"Panel", title:"Energías renovables en red débil",
      venue:"Sala de Consejo", speaker:"Ing. Paula Restrepo",
      body:"Integración de generación intermitente en redes de baja inercia. Casos reales de los últimos tres despliegues." },
    { date:"2026-12-11", type:"Cierre", title:"Resultados del año",
      venue:"Auditorio Central", speaker:"Dirección de Investigación",
      body:"Presentación de los resultados anuales y de la agenda preliminar del próximo año. Entrega de reconocimientos." }
  ];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================== refs ================== */
  const section  = document.getElementById("ascent");
  const spine    = document.getElementById("spine");
  const rail     = document.getElementById("spineRail");
  const fill     = document.getElementById("spineFill");
  const node     = document.getElementById("node");
  const halo     = document.getElementById("halo");
  const stage    = document.getElementById("stage");
  const eyebrow  = document.getElementById("eyebrow");
  const whenEl   = document.getElementById("when");
  const titleEl  = document.getElementById("title");
  const bodyEl   = document.getElementById("body");
  const metaEl   = document.getElementById("meta");
  const counter  = document.getElementById("counter");
  const railFill = document.getElementById("railFill");
  const canvas   = document.getElementById("bloom");
  const ctx      = canvas.getContext("2d");

  /* ================== time scale ================== */
  const DAY = 86400000;
  const Y0  = Date.UTC(YEAR, 0, 1);
  const Y1  = Date.UTC(YEAR, 11, 31);
  const SPAN = Y1 - Y0;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

  const fracOf = ms => clamp((ms - Y0) / SPAN, 0, 1);
  const msOf   = f  => Y0 + Math.round(clamp(f, 0, 1) * SPAN / DAY) * DAY;

  const MN = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  const MLONG = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
                 "septiembre","octubre","noviembre","diciembre"];
  function parts(ms){
    const d = new Date(ms);
    return { d: d.getUTCDate(), m: d.getUTCMonth(), y: d.getUTCFullYear() };
  }
  const flapStr = ms => { const p = parts(ms); return String(p.d).padStart(2,"0") + " " + MN[p.m]; };
  const longStr = ms => { const p = parts(ms); return p.d + " de " + MLONG[p.m] + " " + p.y; };

  const now = new Date();
  const todayMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const todayIn = todayMs >= Y0 && todayMs <= Y1;
  const todayF  = todayIn ? fracOf(todayMs) : null;

  const EV = EVENTS.map(e => {
    const [y,m,d] = e.date.split("-").map(Number);
    const ms = Date.UTC(y, m-1, d);
    return Object.assign({}, e, { ms, f: fracOf(ms) });
  }).sort((a,b) => a.ms - b.ms);

  /* ================== spine: months, ticks, events ================== */
  const P0 = 0.06, P1 = 0.94;
  const HOLD = 0.94;
  const posOf = f => P0 + f * (P1 - P0);

  const monthEls = [], monthF = [];
  for (let m = 0; m < 12; m++){
    const f = fracOf(Date.UTC(YEAR, m, 1));
    monthF.push(f);

    const el = document.createElement("div");
    el.className = "month";
    el.textContent = m === 0 ? (YEAR + " - " + MN[m]) : MN[m];
    el.style.top = (posOf(f) * 100) + "%";
    rail.appendChild(el);
    monthEls.push(el);

    const t = document.createElement("div");
    t.className = "tick";
    t.style.top = (posOf(f) * 100) + "%";
    rail.appendChild(t);
    monthEls[m].tick = t;
  }

  const evEls = EV.map(e => {
    const el = document.createElement("div");
    el.className = "evt";
    el.style.top = (posOf(e.f) * 100) + "%";
    el.innerHTML = '<span class="evt__tip"></span>';
    el.querySelector(".evt__tip").textContent = flapStr(e.ms) + " · " + e.title;
    if (todayIn && e.ms < todayMs) el.classList.add("is-done");
    rail.appendChild(el);
    return el;
  });

  if (todayIn){
    const th = document.createElement("div");
    th.className = "today";
    th.style.top = (posOf(todayF) * 100) + "%";
    rail.appendChild(th);
  }

  /* ================== split-flap ================== */
  let currentStr = "";
  const slots = [];

  function makeSlot(ch){
    const slot = document.createElement("span");
    slot.className = "slot" + (/[.,\s]/.test(ch) ? " is-sep" : "");
    const c = document.createElement("span");
    c.className = "slot__char";
    c.textContent = ch;
    slot.appendChild(c);
    slot.dataset.ch = ch;
    return slot;
  }

  function setChar(slot, ch){
    if (slot.dataset.ch === ch) return;
    slot.dataset.ch = ch;
    slot.className = "slot" + (/[.,\s]/.test(ch) ? " is-sep" : "");

    slot.querySelectorAll(".slot__char.out").forEach(n => n.remove());
    const old = slot.querySelector(".slot__char:not(.out)");
    if (reduce){
      if (old) old.textContent = ch;
      return;
    }
    if (old){
      old.classList.add("out");
      old.addEventListener("animationend", () => old.remove(), {once:true});
      setTimeout(() => old.isConnected && old.remove(), 400);
    }
    const next = document.createElement("span");
    next.className = "slot__char in";
    next.textContent = ch;
    slot.appendChild(next);
    next.addEventListener("animationend", () => next.classList.remove("in"), {once:true});
  }

  let lastFlip = 0;
  function renderFlap(str, now){
    if (str === currentStr) return;
    if (now !== undefined && now - lastFlip < 60) return;
    if (now !== undefined) lastFlip = now;

    while (slots.length < str.length){
      const s = makeSlot(" ");
      counter.appendChild(s);
      slots.push(s);
    }
    while (slots.length > str.length){
      slots.pop().remove();
    }
    for (let k = 0; k < str.length; k++) setChar(slots[k], str[k]);
    currentStr = str;
  }

  /* ================== event card ================== */
  const NEAR_DAYS = 12;
  let activeEv = -2;

  function whenLabel(ms){
    if (!todayIn) return longStr(ms);
    const d = Math.round((ms - todayMs) / DAY);
    if (d === 0)  return "Hoy";
    if (d === 1)  return "Mañana";
    if (d === -1) return "Ayer";
    if (d > 0)    return "En " + d + " días";
    return "Hace " + (-d) + " días";
  }

  function nearestEv(f){
    let best = -1, bestD = Infinity;
    for (let i = 0; i < EV.length; i++){
      const d = Math.abs(EV[i].ms - msOf(f)) / DAY;
      if (d < bestD){ bestD = d; best = i; }
    }
    return { i: best, days: bestD };
  }

  function nextEvFrom(f){
    const ms = msOf(f);
    for (let i = 0; i < EV.length; i++) if (EV[i].ms > ms + DAY) return i;
    return -1;
  }

  function setEvent(idx, cursorF){
    if (idx === activeEv) return;
    activeEv = idx;

    if (idx < 0){
      const nx = nextEvFrom(cursorF);
      stage.classList.add("is-idle");
      eyebrow.textContent = "Sin eventos";
      whenEl.textContent = nx >= 0 ? "Próximo: " + flapStr(EV[nx].ms) : "Fin del año";
      whenEl.classList.remove("is-soon");
      titleEl.innerHTML = "<span>" + (nx >= 0 ? EV[nx].title : "Año completado") + "</span>";
      bodyEl.innerHTML  = "<span>" + (nx >= 0
        ? "Arrastra el nodo hasta el rombo de " + longStr(EV[nx].ms) + " para abrir la ficha."
        : "No quedan eventos programados en " + YEAR + ".") + "</span>";
      metaEl.innerHTML = "";
    } else {
      const e = EV[idx];
      stage.classList.remove("is-idle");
      eyebrow.textContent = e.type + " · " + flapStr(e.ms);
      whenEl.textContent = whenLabel(e.ms);
      whenEl.classList.toggle("is-soon", todayIn && e.ms >= todayMs && (e.ms - todayMs) / DAY <= 30);
      titleEl.innerHTML = "<span>" + e.title + "</span>";
      bodyEl.innerHTML  = "<span>" + e.body + "</span>";
      metaEl.innerHTML =
        '<div><span>Sede</span><b>' + e.venue + '</b></div>' +
        '<div><span>Responsable</span><b>' + e.speaker + '</b></div>' +
        '<div><span>Fecha</span><b>' + longStr(e.ms) + '</b></div>';
    }

    evEls.forEach((el, i) => el.classList.toggle("is-active", i === idx));

    if (!reduce){
      titleEl.classList.remove("swap-in"); bodyEl.classList.remove("swap-in");
      void titleEl.offsetWidth;
      titleEl.classList.add("swap-in"); bodyEl.classList.add("swap-in");
    }
  }

  /* ================== canvas: pixel bloom background ================== */
  const STEPS = 40;
  const PAL_LIME = [], PAL_CREST = [];
  for (let i = 0; i <= STEPS; i++){
    const a = (i / STEPS).toFixed(3);
    PAL_LIME.push("rgba(157,255,50," + a + ")");
    PAL_CREST.push("rgba(226,255,190," + a + ")");
  }
  const pick = (pal, a) => pal[clamp(Math.round(a * STEPS), 0, STEPS)];

  const CELL = 15;
  let cells = [], dpr = 1;

  function buildGrid(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    cells = [];
    for (let y = 0; y < rows; y++){
      for (let x = 0; x < cols; x++){
        const nx = cols > 1 ? x / (cols - 1) : 0;
        const ny = rows > 1 ? y / (rows - 1) : 0;
        const base = (1 - nx) * 0.78 + ny * 0.32;
        const thr  = base * 0.9 + Math.random() * 0.42 - 0.12;
        if (thr > 1.05) continue;
        const keep = Math.min(1, Math.max(0, (nx - 0.20) / 0.42));
        if (Math.random() > keep * keep * 0.85) continue;
        cells.push({
          x: x * CELL, y: y * CELL, t: thr,
          s: 3 + Math.random() * (CELL - 7),
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.6
        });
      }
    }
  }

  function drawBloom(p, time){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const reach = 0.28 + p * 0.9;
    for (let i = 0; i < cells.length; i++){
      const c = cells[i];
      const d = reach - c.t;
      if (d <= 0) continue;
      let a = Math.min(d / 0.12, 1);
      const edge = d < 0.1;
      if (!reduce) a *= 0.55 + 0.45 * Math.sin(time * 0.0012 * c.sp + c.ph);
      a = Math.max(0, Math.min(a, 1)) * 0.62;
      if (a < 0.02) continue;
      ctx.fillStyle = edge ? pick(PAL_CREST, a) : pick(PAL_LIME, a * 0.72);
      ctx.fillRect(c.x, c.y, c.s, c.s);
    }
  }

  /* ================== navigation ================== */
  function scrollTotal(){ return Math.max(1, section.offsetHeight - window.innerHeight); }
  function sectionTop(){ return section.offsetTop; }

  function goTo(f, smooth){
    const top = sectionTop() + clamp(f, 0, 1) * HOLD * scrollTotal();
    window.scrollTo({ top: Math.round(top), behavior: smooth && !reduce ? "smooth" : "auto" });
  }

  function currentF(){
    const r = section.getBoundingClientRect();
    const p = clamp(-r.top / scrollTotal(), 0, 1);
    return clamp(p / HOLD, 0, 1);
  }

  function fFromClientY(cy){
    const r = rail.getBoundingClientRect();
    const raw = (cy - r.top) / Math.max(r.height, 1);
    return clamp((raw - P0) / (P1 - P0), 0, 1);
  }

  let dragging = false, dragId = null;

  spine.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragId = e.pointerId;
    spine.classList.add("is-drag");
    spine.setPointerCapture(e.pointerId);
    spine.focus({preventScroll:true});
    goTo(fFromClientY(e.clientY), false);
    e.preventDefault();
  });

  spine.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== dragId) return;
    goTo(fFromClientY(e.clientY), false);
    e.preventDefault();
  });

  function endDrag(e){
    if (!dragging) return;
    dragging = false;
    dragId = null;
    spine.classList.remove("is-drag");
    const n = nearestEv(currentF());
    if (n.i >= 0 && n.days <= 8) goTo(EV[n.i].f, true);
    if (e) e.preventDefault();
  }
  spine.addEventListener("pointerup", endDrag);
  spine.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", () => endDrag(null));

  spine.addEventListener("keydown", (e) => {
    const f = currentF();
    const stepDay = d => goTo(clamp(fracOf(msOf(f) + d * DAY), 0, 1), true);
    let handled = true;
    switch (e.key){
      case "ArrowUp":    stepDay(-1); break;
      case "ArrowDown":  stepDay(1);  break;
      case "PageUp":     stepDay(-30); break;
      case "PageDown":   stepDay(30);  break;
      case "Home":       goTo(0, true); break;
      case "End":        goTo(1, true); break;
      case "ArrowLeft":  jump(-1); break;
      case "ArrowRight": jump(1);  break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  /* ================== filter + search ================== */
  const modeBtns = Array.prototype.slice.call(document.querySelectorAll(".segmented__item"));
  const qInput   = document.getElementById("agenda-query");
  const hintEl   = document.getElementById("agenda-hint");
  const MODE_LABEL = { all:"todo el año", next:"próximos", past:"realizados" };

  let mode = "all", query = "", matchIdx = [];

  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function inMode(e){
    if (!todayIn || mode === "all") return true;
    return mode === "next" ? e.ms >= todayMs : e.ms < todayMs;
  }
  function inQuery(e){
    if (!query) return true;
    return norm(e.title + " " + e.type + " " + e.venue + " " + e.speaker + " " + e.body).indexOf(query) >= 0;
  }

  function refreshFilter(){
    matchIdx = [];
    for (let i = 0; i < EV.length; i++){
      const ok = inMode(EV[i]) && inQuery(EV[i]);
      if (ok) matchIdx.push(i);
      evEls[i].classList.toggle("is-muted", !ok);
    }
    const n = matchIdx.length;
    if (query){
      hintEl.classList.toggle("is-empty", n === 0);
      hintEl.innerHTML = n === 0
        ? "Sin coincidencias en <b>" + MODE_LABEL[mode] + "</b>"
        : "<b>" + n + "</b> " + (n === 1 ? "coincidencia" : "coincidencias") + " · Enter para ir a la primera";
    } else {
      hintEl.classList.remove("is-empty");
      hintEl.innerHTML = "<b>" + n + "</b> " + (n === 1 ? "evento" : "eventos") +
                          " · " + MODE_LABEL[mode] + " · arrastra el nodo o usa la búsqueda";
    }
    document.getElementById("agenda-submit").disabled = n === 0;
  }

  function goFirstMatch(){
    if (!matchIdx.length) return;
    let pick = matchIdx[0];
    if (todayIn){
      for (let k = 0; k < matchIdx.length; k++){
        if (EV[matchIdx[k]].ms >= todayMs){ pick = matchIdx[k]; break; }
      }
    }
    goTo(EV[pick].f, true);
  }

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.setAttribute("aria-selected", String(b === btn)));
      mode = btn.id.replace("mode-", "");
      refreshFilter();
      goFirstMatch();
    });
  });

  qInput.addEventListener("input", () => {
    query = norm(qInput.value.trim());
    refreshFilter();
  });

  document.getElementById("agenda-form").addEventListener("submit", (e) => {
    e.preventDefault();
    goFirstMatch();
    qInput.blur();
  });

  function jump(dir){
    const ms = msOf(currentF());
    const list = matchIdx.length ? matchIdx : EV.map((_, i) => i);
    if (dir > 0){
      for (let k = 0; k < list.length; k++) if (EV[list[k]].ms > ms + DAY * 0.5) return goTo(EV[list[k]].f, true);
      return goTo(1, true);
    }
    for (let k = list.length - 1; k >= 0; k--) if (EV[list[k]].ms < ms - DAY * 0.5) return goTo(EV[list[k]].f, true);
    return goTo(0, true);
  }

  document.getElementById("btnPrev").addEventListener("click", () => jump(-1));
  document.getElementById("btnNext").addEventListener("click", () => jump(1));
  document.getElementById("btnToday").addEventListener("click", () => {
    goTo(todayIn ? todayF : 0, true);
  });

  /* ================== loop ================== */
  let rafId = null;

  function frame(time){
    const f = currentF();
    const pos = posOf(f);
    const cursorMs = msOf(f);

    node.style.top = (pos * 100) + "%";
    halo.style.top = (pos * 100) + "%";
    fill.style.height = (pos * 100) + "%";
    railFill.style.height = (f * 100) + "%";

    for (let m = 0; m < 12; m++){
      const d = Math.abs(monthF[m] - f);
      const past = monthF[m] <= f + 0.002;
      monthEls[m].classList.toggle("is-active", d < 0.035);
      monthEls[m].classList.toggle("is-past", past && d >= 0.035);
      monthEls[m].style.opacity = String(clamp(1 - d * 2.2, 0.2, 1));
      monthEls[m].tick.classList.toggle("is-lit", past);
    }

    const near = nearestEv(f);
    setEvent(near.days <= NEAR_DAYS ? near.i : -1, f);

    const dayOfYear = Math.round((cursorMs - Y0) / DAY) + 1;
    spine.setAttribute("aria-valuenow", String(dayOfYear));
    spine.setAttribute("aria-valuetext", longStr(cursorMs));

    renderFlap(flapStr(cursorMs), time);
    drawBloom(f, time);
    rafId = requestAnimationFrame(frame);
  }

  /* ================== init ================== */
  function resize(){
    buildGrid();
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.__rt);
    window.__rt = setTimeout(resize, 150);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && rafId === null){
        rafId = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && rafId !== null){
        cancelAnimationFrame(rafId); rafId = null;
      }
    });
  }, {rootMargin:"120px"});

  resize();
  refreshFilter();
  renderFlap(flapStr(msOf(todayIn ? todayF : 0)));
  io.observe(section);

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  requestAnimationFrame(() => goTo(todayIn ? todayF : 0, false));
})();
