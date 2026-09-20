(function(){
  "use strict";

  /* ======================================================================
     XIII JISIC 2026 — datos reales tomados de jisic.epn.edu.ec
     Format: { date:"YYYY-MM-DD", type, title, venue, speaker, body, page? }
     Each event's content lives in src/pages/evento/<page>/index.html
     (page defaults to YYYY_MM_DD_Evento); the fields here are the
     timeline label and fallback text.
     ====================================================================== */
  const YEAR = 2026;
  const VENUE = "Teatro Politécnico, edificio 1 · Escuela Politécnica Nacional";
  const EVENTS = [
    { date:"2026-06-25", page:"2026_06_25_XIV_IAHumano", type:"Día 2 · Panel y reconocimiento", title:"Inteligencia Artificial con rostro humano",
      venue:VENUE, speaker:"Sang Yoo, Ola Bini, Enrique Mafla, Santiago Lucano y más",
      body:"Charlas sobre comunicación, branding, sociedad y quality engineering en la era de la IA, seguidas del panel \"Inteligencia Artificial con rostro humano: entre la innovación y la responsabilidad\" y la ceremonia de reconocimiento al comité organizador." },
    { date:"2026-06-26", page:"2026_06_26_XIV_Jornada", type:"Día 3 · Concurso y networking", title:"Concurso de IA, Networking y Premiación",
      venue:VENUE, speaker:"Comité organizador JISIC",
      body:"Cierre de las jornadas con el Concurso de Inteligencia Artificial (07:30–10:30), un espacio de networking entre asistentes y empresas (10:30–12:30) y la premiación final (12:30–13:30)." },
    { date:"2026-10-14", page:"2026_10_14_XIV_ConcursoIA", type:"Concurso", title:"Concurso de IA",
      venue:"Por confirmar", speaker:"Comité organizador JISIC",
      body:"Competencia abierta a estudiantes y participantes." },
    { date:"2026-11-14", page:"2026_11_14_XIV_Networking", type:"Networking", title:"Networking",
      venue:"Por confirmar", speaker:"Comité organizador JISIC",
      body:"Espacio de contacto entre asistentes y empresas." },
    { date:"2026-12-01", page:"2026_12_01_XIV_PodcastTECH", type:"Podcast", title:"FUTURO & TECH",
      venue:"Por confirmar", speaker:"Por confirmar",
      body:"Podcast sobre Innovación y Tecnologías Emergentes." },
    { date:"2026-12-14", page:"2026_12_14_XIV_Workshop", type:"Workshop", title:"Workshop",
      venue:"Por confirmar", speaker:"Comité organizador JISIC",
      body:"Taller práctico con cupo limitado." }
  ];

  /* Menu pages, rendered as points at the start of the timeline (before ENE).
     Each is placed PRELUDE_DAYS/5 apart on a virtual date range before Jan 1.
     Contenido real tomado de jisic.epn.edu.ec (sección Comité). */
  const PAGES = [
    { id:"comite", title:"Comité",
      body:"La Facultad de Ingeniería de Sistemas de la Escuela Politécnica Nacional organiza las XIII Jornadas JISIC 2026 como un espacio de encuentro entre la academia y la industria, donde estudiantes, docentes, graduados, investigadores, profesionales y empresas comparten experiencias, tendencias y soluciones tecnológicas vinculadas con la Inteligencia Artificial, la innovación y la transformación digital.",
      meta:[
        ["Coordinador","PhD. Andrés Larco"],
        ["Comité directivo","PhD. Diana Yacchirema · MSc. Viviana Párraga · MSc. Marcela Saavedra"],
        ["Comunicación","MSc. Gabriela García"],
        ["Web master","MSc. Hernán Ordoñez"]
      ] },
    { id:"XI_JISIC", title:"XI JISIC",
      body:"XI Jornadas JISIC 2024 · Blockchain como tecnología habilitadora de la transformación digital. 29, 30 y 31 de mayo de 2024, Auditorio 2, EARME edificio 26 – Escuela Politécnica Nacional.",
      meta:[
        ["Coordinador","Andrés Larco, PhD."]
      ] },
    { id:"XII_JISIC", title:"XII JISIC",
      body:"XII Jornadas JISIC 2025 · Reinventando el futuro digital. 28, 29 y 30 de octubre de 2025, Teatro Politécnico, edificio 1 – Escuela Politécnica Nacional.",
      meta:[
        ["Organizador","Jairo Quishpe · Presidente AEIS"]
      ] },
    { id:"XIII_JISIC", title:"XIII JISIC",
      body:"XIII Jornadas JISIC 2026 · La IA transformando el mundo. 24, 25 y 26 de junio de 2026, Teatro Politécnico, edificio 1 – Escuela Politécnica Nacional.",
      meta:[
        ["Coordinador","PhD. Andrés Larco"]
      ] },
    { id:"XIV_JISIC", title:"XIV JISIC",
      body:"XIV Jornadas JISIC · nueva temporada de octubre de 2026 a diciembre de 2027. Concurso de IA, networking, workshops y conferencias.",
      meta:[
        ["Temporada","Octubre 2026 – diciembre 2027"]
      ] }
  ];
  const HOME = { id:"home", title:"XIII JISIC 2026",
    body:"La IA transformando el mundo. Las Jornadas de Ingeniería de Sistemas Informáticos y de Computación son el espacio de encuentro entre la academia y la industria de la Facultad de Ingeniería de Sistemas (EPN).",
    meta:[
      ["Fecha","24, 25 y 26 de junio de 2026"],
      ["Sede",VENUE]
    ] };

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
  const neuro    = document.getElementById("neuro");
  const nctx     = neuro.getContext("2d");
  const SVGNS    = "http://www.w3.org/2000/svg";

  /* ================== time scale ==================
     The timeline is extended backwards before Jan 1 to make room for the
     menu pages (rendered as points at the start of the spine). EY0 is the
     virtual start; real agenda dates still live between Y0 and Y1. */
  const DAY = 86400000;
  const PRELUDE_DAYS = 120;
  const Y0  = Date.UTC(YEAR, 0, 1);
  const Y1  = Date.UTC(YEAR, 11, 31);
  const EY0 = Y0 - PRELUDE_DAYS * DAY;
  const SPAN = Y1 - EY0;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

  const fracOf = ms => clamp((ms - EY0) / SPAN, 0, 1);
  const msOf   = f  => EY0 + Math.round(clamp(f, 0, 1) * SPAN / DAY) * DAY;

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
    return Object.assign({}, e, { kind:"event", ms, f: fracOf(ms) });
  }).sort((a,b) => a.ms - b.ms);

  /* menu pages, spaced evenly through the prelude range */
  const pageSpacing = PRELUDE_DAYS / (PAGES.length + 1);
  const PAGE_ITEMS = PAGES.map((p, i) => {
    const ms = EY0 + Math.round((i + 1) * pageSpacing) * DAY;
    return Object.assign({}, p, { kind:"page", ms, f: fracOf(ms) });
  });
  const HOME_ITEM = Object.assign({}, HOME, { kind:"home", ms: EY0, f: 0 });

  const ITEMS = [HOME_ITEM].concat(PAGE_ITEMS, EV).sort((a,b) => a.ms - b.ms);

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

  PAGE_ITEMS.forEach(p => {
    const el = document.createElement("div");
    el.className = "pagept";
    el.style.top = (posOf(p.f) * 100) + "%";
    el.innerHTML = '<span class="pagept__tip"></span>';
    el.querySelector(".pagept__tip").textContent = p.title;
    if (/JISIC$/.test(p.title)){
      el.classList.add("pagept--lbl");
      const l = document.createElement("span");
      l.className = "pagept__lbl";
      l.textContent = p.title;
      el.appendChild(l);
    }
    rail.appendChild(el);
    p.el = el;
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

  /* ================== stage card (events + menu pages) ================== */
  const NEAR_DAYS = 12;
  let activeItem = undefined;

  function whenLabel(ms){
    if (!todayIn) return longStr(ms);
    const d = Math.round((ms - todayMs) / DAY);
    if (d === 0)  return "Hoy";
    if (d === 1)  return "Mañana";
    if (d === -1) return "Ayer";
    if (d > 0)    return "En " + d + " días";
    return "Hace " + (-d) + " días";
  }

  function nearestItem(f){
    let best = -1, bestD = Infinity;
    for (let i = 0; i < ITEMS.length; i++){
      const d = Math.abs(ITEMS[i].ms - msOf(f)) / DAY;
      if (d < bestD){ bestD = d; best = i; }
    }
    return { i: best, days: bestD };
  }

  function nextItemFrom(f){
    const ms = msOf(f);
    for (let i = 0; i < ITEMS.length; i++) if (ITEMS[i].ms > ms + DAY) return i;
    return -1;
  }

  /* src/pages/<id>/index.html is fetched and embedded in the stage; the JS
     copy of the text is the fallback (e.g. when opened from file://). */
  const pageBox = document.getElementById("pageBox");
  const pageCache = {};
  function embedPage(item){
    stage.classList.remove("is-embed");
    pageBox.hidden = true;
    const show = entry => {
      if (activeItem !== item) return;
      pageBox.innerHTML = entry.html;
      pageBox.dataset.base = entry.base;
      pageBox.querySelectorAll("img[src]").forEach(im => {
        im.src = new URL(im.getAttribute("src"), entry.base).href;
      });
      pageBox.hidden = false;
      stage.classList.add("is-embed");
      Promise.all(entry.scripts.map(loadScript)).then(() => {
        if (window.initCarousels) window.initCarousels(pageBox);
      });
    };
    const dir = item.kind === "home" ? "inicio" : item.kind === "event" ? "evento/" + (item.page || item.date.replace(/-/g, "_") + "_Evento") : item.id;
    if (pageCache[dir]) return show(pageCache[dir]);
    const url = new URL("./src/pages/" + dir + "/index.html", location.href);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(t => {
        const m = new DOMParser().parseFromString(t, "text/html").querySelector("main");
        if (!m) return;
        const scripts = [].map.call(m.querySelectorAll("script[src]"), s => new URL(s.getAttribute("src"), url).href);
        pageCache[dir] = { html: m.innerHTML, scripts, base: url.href };
        show(pageCache[dir]);
      })
      .catch(() => {});
  }

  const scriptLoads = {};
  function loadScript(src){
    return scriptLoads[src] || (scriptLoads[src] = new Promise(res => {
      const s = document.createElement("script");
      s.src = src; s.onload = s.onerror = res;
      document.head.appendChild(s);
    }));
  }

  /* countdown (weeks / days / hours) to the event on stage */
  const cdBox = document.getElementById("countdown");
  const cdW = document.getElementById("cdWeeks"), cdD = document.getElementById("cdDays"), cdH = document.getElementById("cdHours");
  function updateCountdown(){
    const ev = activeItem && activeItem.kind === "event" ? activeItem : null;
    if (!ev){ cdBox.hidden = true; return; }
    const [y, m, d] = ev.date.split("-").map(Number);
    const left = new Date(y, m - 1, d).getTime() - Date.now();
    cdBox.hidden = left <= 0;
    if (left <= 0) return;
    let h = Math.floor(left / 3600000);
    const w = Math.floor(h / 168); h -= w * 168;
    const dd = Math.floor(h / 24); h -= dd * 24;
    const p2 = n => String(n).padStart(2, "0");
    cdW.textContent = p2(w); cdD.textContent = p2(dd); cdH.textContent = p2(h);
  }
  setInterval(updateCountdown, 30000);

  function setNavCurrent(id){
    navLinks.forEach(a => {
      if (a.dataset.target === id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function setItem(idx, cursorF){
    const item = idx >= 0 ? ITEMS[idx] : null;
    if (item === activeItem) return;
    activeItem = item;
    updateCountdown();

    if (!item){
      const nx = nextItemFrom(cursorF);
      const nxItem = nx >= 0 ? ITEMS[nx] : null;
      stage.classList.add("is-idle");
      stage.classList.remove("is-page");
      eyebrow.textContent = "Sin eventos";
      whenEl.textContent = nxItem
        ? (nxItem.kind === "event" ? "Próximo: " + flapStr(nxItem.ms) : "Próximo: " + nxItem.title)
        : "Fin del año";
      whenEl.classList.remove("is-soon");
      titleEl.innerHTML = "<span>" + (nxItem ? nxItem.title : "Año completado") + "</span>";
      bodyEl.innerHTML  = "<span>" + (nxItem
        ? (nxItem.kind === "event"
            ? "Arrastra el nodo hasta el rombo de " + longStr(nxItem.ms) + " para abrir la ficha."
            : "Sigue arrastrando el nodo hasta el punto de " + nxItem.title + ".")
        : "No quedan eventos programados en " + YEAR + ".") + "</span>";
      metaEl.innerHTML = "";
      setNavCurrent(null);
    } else if (item.kind === "event"){
      const e = item;
      stage.classList.remove("is-idle");
      stage.classList.remove("is-page");
      eyebrow.textContent = e.type + " · " + flapStr(e.ms);
      whenEl.textContent = whenLabel(e.ms);
      whenEl.classList.toggle("is-soon", todayIn && e.ms >= todayMs && (e.ms - todayMs) / DAY <= 30);
      titleEl.innerHTML = "<span>" + e.title + "</span>";
      bodyEl.innerHTML  = "<span>" + e.body + "</span>";
      metaEl.innerHTML =
        '<div><span>Sede</span><b>' + e.venue + '</b></div>' +
        '<div><span>Responsable</span><b>' + e.speaker + '</b></div>' +
        '<div><span>Fecha</span><b>' + longStr(e.ms) + '</b></div>';
      setNavCurrent("evento");
      brainBurst();
      embedPage(item);
    } else {
      stage.classList.remove("is-idle");
      stage.classList.add("is-page");
      eyebrow.textContent = item.kind === "home" ? "Inicio" : "Página · " + item.title;
      whenEl.textContent = "";
      whenEl.classList.remove("is-soon");
      titleEl.innerHTML = "<span>" + item.title + "</span>";
      bodyEl.innerHTML  = "<span>" + item.body + "</span>";
      metaEl.innerHTML = (item.meta || []).map(function(kv){
        return '<div><span>' + kv[0] + '</span><b>' + kv[1] + '</b></div>';
      }).join("");
      setNavCurrent(item.id);
      embedPage(item);
    }

    const idOf = i => (i >= 0 ? ITEMS[i] : null);
    evEls.forEach((el, i) => el.classList.toggle("is-active", idOf(idx) === EV[i]));
    PAGE_ITEMS.forEach(p => p.el.classList.toggle("is-active", idOf(idx) === p));

    if (!reduce){
      titleEl.classList.remove("swap-in"); bodyEl.classList.remove("swap-in");
      void titleEl.offsetWidth;
      titleEl.classList.add("swap-in"); bodyEl.classList.add("swap-in");
    }
  }

  /* ================== canvas: pixel bloom background ================== */
  const STEPS = 40;
  const PAL_LIME = [], PAL_CREST = [], PAL_WARM = [];
  for (let i = 0; i <= STEPS; i++){
    const a = (i / STEPS).toFixed(3);
    PAL_LIME.push("rgba(157,255,50," + a + ")");
    PAL_CREST.push("rgba(226,255,190," + a + ")");
    PAL_WARM.push("rgba(232,255,198," + a + ")");
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

  /* ================== canvas: neural brain (right side) ================== */
  const BRAIN_D = "M104,14 C132,8 160,18 174,40 C188,62 190,76 184,88 " +
                  "C179,98 170,101 163,103 C171,112 167,124 153,128 " +
                  "C143,131 135,128 129,133 C119,141 104,143 93,137 " +
                  "C86,133 79,136 72,139 C74,148 71,155 63,160 " +
                  "C55,158 56,149 55,141 C46,138 38,131 34,119 " +
                  "C30,110 30,102 26,94 C17,78 14,56 26,40 " +
                  "C38,24 56,14 74,12 C84,11 95,12 104,14 Z";

  const FOLD_D = [
    "M58,36 C80,32 94,46 86,60 C80,72 94,80 110,74 C124,69 132,78 130,90",
    "M150,32 C142,48 154,56 148,68 C142,80 124,78 120,90 C117,99 122,108 132,110",
    "M34,64 C52,62 60,72 56,84 C52,96 64,102 80,100 C94,98 100,106 98,118",
    "M96,22 C108,34 104,48 116,52 C130,57 136,44 150,48 C162,51 166,62 162,72",
    "M70,110 C86,108 96,118 112,114 C126,111 134,118 138,126",
    "M44,98 C56,110 48,120 62,126 C72,130 78,128 86,132"
  ];

  let nNodes = [], nEdges = [], nAdj = [], nPulses = [];
  let foldGeom = [], silhouette = [];
  let brainBox = {cx:0, cy:0, s:1};
  let neuroT0 = 0, wasVisible = false;

  const svgHost = document.createElementNS(SVGNS, "svg");
  svgHost.setAttribute("width", "0");
  svgHost.setAttribute("height", "0");
  svgHost.style.cssText = "position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden";
  document.body.appendChild(svgHost);

  function samplePath(d, step){
    const p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", d);
    svgHost.appendChild(p);
    const L = p.getTotalLength();
    const out = [];
    for (let l = 0; l <= L; l += step){
      const pt = p.getPointAtLength(l);
      out.push({x: pt.x, y: pt.y});
    }
    svgHost.removeChild(p);
    return out;
  }

  const hitCv  = document.createElement("canvas");
  hitCv.width = 200; hitCv.height = 170;
  const hitCtx = hitCv.getContext("2d");
  const brainPath = new Path2D(BRAIN_D);
  const insideBrain = (x, y) => hitCtx.isPointInPath(brainPath, x, y);

  function brainBurst(){
    if (reduce || !nNodes.length) return;
    for (let i = 0; i < 22; i++){
      const n = nNodes[(Math.random() * nNodes.length) | 0];
      if (n) n.flash = 1;
    }
  }

  function buildBrain(){
    const outline = samplePath(BRAIN_D, 6.0);
    const pts = outline.map(p => ({x:p.x, y:p.y, edge:true}));

    const MIN_IN = 7.6, MIN_EDGE = 6.2;
    let tries = 0;
    while (tries < 9000 && pts.length < 320){
      tries++;
      const x = 10 + Math.random() * 184;
      const y = 6  + Math.random() * 160;
      if (!insideBrain(x, y)) continue;
      let ok = true;
      for (let i = 0; i < pts.length; i++){
        const dx = pts[i].x - x, dy = pts[i].y - y;
        const m = pts[i].edge ? MIN_EDGE : MIN_IN;
        if (dx*dx + dy*dy < m*m){ ok = false; break; }
      }
      if (ok) pts.push({x, y, edge:false});
    }

    nNodes = pts.map((p) => {
      const ang = Math.random() * Math.PI * 2;
      const rad = 70 + Math.random() * 190;
      const dCenter = Math.hypot(p.x - 100, p.y - 86) / 110;
      return {
        x:p.x, y:p.y,
        sx:p.x + Math.cos(ang) * rad,
        sy:p.y + Math.sin(ang) * rad * 0.72,
        cx:0, cy:0, form:0,
        edge:p.edge,
        ph: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 1.3,
        delay: dCenter * 0.9 + Math.random() * 0.55,
        flash: 0
      };
    });

    const R = 17.5;
    nEdges = [];
    nAdj = nNodes.map(() => []);
    const seen = new Set();
    for (let i = 0; i < nNodes.length; i++){
      const near = [];
      for (let j = 0; j < nNodes.length; j++){
        if (i === j) continue;
        const dx = nNodes[j].x - nNodes[i].x, dy = nNodes[j].y - nNodes[i].y;
        const d2 = dx*dx + dy*dy;
        if (d2 < R*R) near.push({j, d: Math.sqrt(d2)});
      }
      near.sort((a,b) => a.d - b.d);
      for (let k = 0; k < Math.min(near.length, 3); k++){
        const j = near[k].j;
        const key = i < j ? i + "_" + j : j + "_" + i;
        if (seen.has(key)) continue;
        seen.add(key);
        nEdges.push({a:i, b:j, len:near[k].d, delay: Math.random() * 1.5});
        nAdj[i].push(nEdges.length - 1);
        nAdj[j].push(nEdges.length - 1);
      }
    }

    const count = Math.max(10, Math.min(34, Math.round(nEdges.length / 17)));
    nPulses = [];
    for (let i = 0; i < count; i++){
      nPulses.push({
        e: (Math.random() * nEdges.length) | 0,
        dir: Math.random() < .5 ? 1 : 0,
        t: Math.random(),
        sp: 0.55 + Math.random() * 0.75
      });
    }

    foldGeom = FOLD_D.map(d => samplePath(d, 2.6));
    silhouette = samplePath(BRAIN_D, 1.4);
  }

  function placeBrain(){
    const w = neuro.clientWidth, h = neuro.clientHeight;
    neuro.width  = Math.floor(w * dpr);
    neuro.height = Math.floor(h * dpr);
    nctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const small = w < 820;
    const s = small
      ? Math.min((w * 0.68) / 200, (h * 0.34) / 170)
      : Math.min((w * 0.44) / 200, (h * 0.82) / 170);
    brainBox = {
      cx: small ? w * 0.65 : w * 0.72,
      cy: small ? h * 0.27 : h * 0.50,
      s
    };
  }

  const eOutCubic = t => 1 - Math.pow(1 - t, 3);
  const eOutBack  = t => { const c = 1.24; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function drawNeuro(time){
    const w = neuro.clientWidth, h = neuro.clientHeight;
    nctx.clearRect(0, 0, w, h);
    if (!nNodes.length) return;

    if (!neuroT0) neuroT0 = time;
    const T = reduce ? 99 : (time - neuroT0) / 1000;
    const t = time / 1000;

    const fade = clamp(T / 1.1, 0, 1);
    const { cx, cy } = brainBox;
    const breathe = reduce ? 1 : (1 + 0.013 * Math.sin(t * 0.62));
    const s = brainBox.s * breathe;
    const rot = reduce ? 0 : Math.sin(t * 0.21) * 0.022;
    const rad = 200 * s * 0.66;

    nctx.save();
    nctx.translate(cx, cy);
    nctx.scale(1, 0.92);
    const g = nctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0,   "rgba(7,8,7,.92)");
    g.addColorStop(.46, "rgba(7,8,7,.80)");
    g.addColorStop(.78, "rgba(7,8,7,.34)");
    g.addColorStop(1,   "rgba(7,8,7,0)");
    nctx.globalAlpha = fade;
    nctx.fillStyle = g;
    nctx.beginPath();
    nctx.arc(0, 0, rad, 0, Math.PI * 2);
    nctx.fill();

    const aura = clamp((T - 2.4) / 2.2, 0, 1) * (0.55 + 0.45 * Math.sin(t * 0.8));
    if (aura > 0.01){
      const ga = nctx.createRadialGradient(0, 0, rad * 0.1, 0, 0, rad * 0.92);
      ga.addColorStop(0, "rgba(157,255,50," + (0.13 * aura) + ")");
      ga.addColorStop(1, "rgba(157,255,50,0)");
      nctx.fillStyle = ga;
      nctx.beginPath();
      nctx.arc(0, 0, rad * 0.92, 0, Math.PI * 2);
      nctx.fill();
    }
    nctx.restore();
    nctx.globalAlpha = 1;

    nctx.save();
    nctx.translate(cx, cy);
    nctx.rotate(rot);
    nctx.scale(s, s);
    nctx.translate(-100, -86);
    const U = 1 / s;

    const scanCycle = 7.5, scanStart = 4.6;
    const scanT = T > scanStart ? ((T - scanStart) % scanCycle) / 1.7 : -1;
    const scanX = scanT >= 0 && scanT <= 1 ? 10 + scanT * 186 : -999;

    for (let i = 0; i < nNodes.length; i++){
      const n = nNodes[i];
      const p = clamp((T - n.delay) / 2.0, 0, 1);
      const k = reduce ? 1 : eOutBack(p);
      const jx = reduce ? 0 : Math.sin(t * n.sp + n.ph) * 0.45;
      const jy = reduce ? 0 : Math.cos(t * n.sp * 0.8 + n.ph) * 0.45;
      n.cx = n.sx + (n.x - n.sx) * k + jx * p;
      n.cy = n.sy + (n.y - n.sy) * k + jy * p;
      n.form = p;
      if (scanX > -900){
        const d = Math.abs(n.cx - scanX);
        if (d < 5) n.flash = Math.max(n.flash, 0.85 * (1 - d / 5));
      }
      n.flash *= reduce ? 0 : 0.955;
    }

    const foldA = clamp((T - 3.0) / 1.8, 0, 1) * 0.5 * fade;
    if (foldA > 0.01){
      nctx.strokeStyle = "rgba(157,255,50," + foldA + ")";
      nctx.lineWidth = 0.9 * U;
      nctx.lineCap = "round";
      nctx.setLineDash([2.4 * U, 4.6 * U]);
      nctx.lineDashOffset = reduce ? 0 : -t * 7 * U;
      for (let f = 0; f < foldGeom.length; f++){
        const pts = foldGeom[f];
        nctx.beginPath();
        nctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) nctx.lineTo(pts[i].x, pts[i].y);
        nctx.stroke();
      }
      nctx.setLineDash([]);
    }

    if (silhouette.length){
      const tr = reduce ? 1 : clamp((T - 0.25) / 2.3, 0, 1);
      const n  = Math.max(2, Math.round(eOutCubic(tr) * silhouette.length));
      const hold = clamp((T - 2.9) / 1.4, 0, 1);
      const a = fade * (tr < 1 ? 0.75 : 0.30 + 0.12 * Math.sin(t * 0.9)) * (tr < 1 ? 1 : 0.55 + 0.45 * hold);
      nctx.strokeStyle = "rgba(196,255,128," + a.toFixed(3) + ")";
      nctx.lineWidth = 1.05 * U;
      nctx.lineJoin = "round";
      nctx.beginPath();
      nctx.moveTo(silhouette[0].x, silhouette[0].y);
      for (let i = 1; i < n; i++) nctx.lineTo(silhouette[i].x, silhouette[i].y);
      nctx.stroke();
      if (tr < 1){
        const hd = silhouette[n - 1];
        nctx.fillStyle = "rgba(240,255,215," + fade.toFixed(3) + ")";
        nctx.fillRect(hd.x - 1.6 * U, hd.y - 1.6 * U, 3.2 * U, 3.2 * U);
      }
    }

    nctx.lineWidth = 0.85 * U;
    for (let i = 0; i < nEdges.length; i++){
      const e = nEdges[i];
      const A = nNodes[e.a], B = nNodes[e.b];
      const ea = clamp((T - 1.7 - e.delay) / 1.3, 0, 1) * Math.min(A.form, B.form);
      if (ea < 0.02) continue;
      const near = 1 - Math.min(e.len / 17.5, 1);
      const live = Math.max(A.flash, B.flash);
      const a = fade * ea * (0.17 + near * 0.26 + live * 0.55);
      nctx.strokeStyle = pick(PAL_LIME, a);
      nctx.beginPath();
      nctx.moveTo(A.cx, A.cy);
      nctx.lineTo(B.cx, B.cy);
      nctx.stroke();
    }

    if (!reduce && T > 3.6){
      const dt = 0.016;
      for (let i = 0; i < nPulses.length; i++){
        const p = nPulses[i];
        const e = nEdges[p.e];
        if (!e) continue;
        p.t += p.sp * dt * (14 / Math.max(e.len, 4));
        if (p.t >= 1){
          const end = p.dir ? e.b : e.a;
          nNodes[end].flash = 1;
          const opts = nAdj[end];
          if (opts && opts.length){
            let ne = opts[(Math.random() * opts.length) | 0];
            if (opts.length > 1){
              let guard = 0;
              while (ne === p.e && guard++ < 4) ne = opts[(Math.random() * opts.length) | 0];
            }
            p.e = ne;
            p.dir = nEdges[ne].a === end ? 1 : 0;
          }
          p.t = 0;
          continue;
        }
        const A = nNodes[p.dir ? e.a : e.b];
        const B = nNodes[p.dir ? e.b : e.a];
        const px = A.cx + (B.cx - A.cx) * p.t;
        const py = A.cy + (B.cy - A.cy) * p.t;
        const tail = 0.34;
        const qx = A.cx + (B.cx - A.cx) * Math.max(p.t - tail, 0);
        const qy = A.cy + (B.cy - A.cy) * Math.max(p.t - tail, 0);
        nctx.strokeStyle = "rgba(226,255,190," + (0.55 * fade) + ")";
        nctx.lineWidth = 1.1 * U;
        nctx.beginPath();
        nctx.moveTo(qx, qy);
        nctx.lineTo(px, py);
        nctx.stroke();
        nctx.fillStyle = "rgba(240,255,220," + (0.95 * fade) + ")";
        nctx.fillRect(px - 1.0 * U, py - 1.0 * U, 2.0 * U, 2.0 * U);
      }
    }

    for (let i = 0; i < nNodes.length; i++){
      const n = nNodes[i];
      if (n.form < 0.02) continue;
      const pulse = reduce ? 0.8 : (0.66 + 0.34 * Math.sin(t * 1.5 * n.sp + n.ph));
      const base = (n.edge ? 0.88 : 0.58) * pulse;
      const a = clamp(fade * n.form * (base + n.flash * 0.7), 0, 1);
      if (a < 0.03) continue;
      const sz = (n.edge ? 1.9 : 1.6) + n.flash * 1.8;
      const hot = n.flash > 0.25;
      if (hot){
        nctx.shadowBlur = 9 * n.flash;
        nctx.shadowColor = "rgba(157,255,50,.85)";
      }
      nctx.fillStyle = hot ? pick(PAL_WARM, a) : pick(PAL_LIME, a);
      nctx.fillRect(n.cx - sz / 2, n.cy - sz / 2, sz, sz);
      if (hot){ nctx.shadowBlur = 0; nctx.shadowColor = "transparent"; }
    }

    nctx.restore();
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
    const n = nearestItem(currentF());
    if (n.i >= 0 && n.days <= 8) goTo(ITEMS[n.i].f, true);
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
                          " · " + MODE_LABEL[mode] + " · arrastra el nodo";
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

    const near = nearestItem(f);
    setItem(near.days <= NEAR_DAYS ? near.i : -1, f);

    const inYear = cursorMs >= Y0 && cursorMs <= Y1;
    spine.setAttribute("aria-valuenow", String(Math.round((cursorMs - EY0) / DAY) + 1));
    spine.setAttribute("aria-valuetext", inYear ? longStr(cursorMs) : "Antes del inicio del año");

    if (inYear) renderFlap(flapStr(cursorMs), time);
    drawBloom(f, time);
    drawNeuro(time);
    rafId = requestAnimationFrame(frame);
  }

  /* ================== init ================== */
  function resize(){
    buildGrid();
    placeBrain();
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.__rt);
    window.__rt = setTimeout(resize, 150);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && rafId === null){
        if (wasVisible) neuroT0 = 0;
        wasVisible = true;
        rafId = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && rafId !== null){
        cancelAnimationFrame(rafId); rafId = null;
      }
    });
  }, {rootMargin:"120px"});

  /* ================== menu navigation ================== */
  function nextUpcomingEvent(){
    for (let i = 0; i < EV.length; i++) if (EV[i].ms >= todayMs) return EV[i];
    return EV[EV.length - 1];
  }

  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".topbar__nav a[data-target]"));
  navLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const key = a.dataset.target;
      const item = key === "evento" ? nextUpcomingEvent()
        : key === "home" ? HOME_ITEM
        : PAGE_ITEMS.filter(p => p.id === key)[0];
      if (item) goTo(item.f, true);
    });
  });

  spine.setAttribute("aria-valuemin", "1");
  spine.setAttribute("aria-valuemax", String(PRELUDE_DAYS + 365));

  resize();
  buildBrain();
  refreshFilter();
  if (todayIn) renderFlap(flapStr(todayMs));
  io.observe(section);

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  requestAnimationFrame(() => goTo(todayIn ? todayF : 0, false));
})();
