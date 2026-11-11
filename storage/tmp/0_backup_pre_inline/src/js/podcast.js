/* Podcast JISIC — cronómetro + enlace (plantilla compartida por todos los podcast)
   Cada <article class="pc"> usa:
     data-start="2026-10-08T13:00:00-05:00"   inicio del evento (ISO con zona horaria)
     data-link="https://…"                     enlace al podcast (vacío = "próximamente")
     data-duration="120"                       minutos que dura "en vivo" (opcional, def. 120) */
(function(){
  "use strict";
  var p2 = function(n){ return String(n).padStart(2, "0"); };

  function setupPodcast(el){
    if (el.__pcReady) return;
    el.__pcReady = true;

    var start = Date.parse(el.dataset.start || "");
    var dur = (parseInt(el.dataset.duration, 10) || 120) * 60000;
    var link = (el.dataset.link || "").trim();
    var timer = el.querySelector(".pc__timer");
    var label = el.querySelector(".pc__timer-label");
    var cta = el.querySelector(".pc__cta");
    var ctaTxt = cta && cta.querySelector("span");
    var u = {};
    ["d","h","m","s"].forEach(function(k){ u[k] = el.querySelector('[data-u="' + k + '"]'); });

    if (cta){
      if (link){ cta.href = link; cta.target = "_blank"; cta.rel = "noopener"; }
      else { cta.removeAttribute("href"); cta.setAttribute("aria-disabled", "true"); }
    }

    function render(){
      if (!document.contains(el)){ clearInterval(el.__pcTimer); return; }
      if (isNaN(start)){ if (timer) timer.hidden = true; return; }
      var left = start - Date.now(), state;
      if (left > 0) state = "soon";
      else if (-left < dur) state = "live";
      else state = "done";
      el.dataset.state = state;

      if (state === "soon"){
        var t = Math.floor(left / 1000);
        var d = Math.floor(t / 86400); t -= d * 86400;
        var h = Math.floor(t / 3600);  t -= h * 3600;
        var m = Math.floor(t / 60);    var s = t - m * 60;
        u.d.textContent = p2(d); u.h.textContent = p2(h); u.m.textContent = p2(m); u.s.textContent = p2(s);
        if (label) label.textContent = "Inicia en";
      } else if (label){
        label.textContent = state === "live" ? "¡En vivo ahora!" : "Evento finalizado";
      }
      if (timer) timer.classList.toggle("is-over", state !== "soon");
      if (ctaTxt && link) ctaTxt.textContent = state === "live" ? "Unirse ahora" : state === "done" ? "Ver el podcast" : "Ir al podcast";
      else if (ctaTxt) ctaTxt.textContent = "Enlace próximamente";
    }
    render();
    el.__pcTimer = setInterval(render, 1000);
  }

  window.initPodcasts = function(root){
    (root || document).querySelectorAll(".pc").forEach(setupPodcast);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ window.initPodcasts(); });
  else window.initPodcasts();
})();
