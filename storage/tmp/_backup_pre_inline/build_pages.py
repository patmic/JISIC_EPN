#!/usr/bin/env python3
"""Genera frontend/src/js/pages-embed.js a partir de los index.html de frontend/src/pages.

El contenido de cada página vive en src/pages/<carpeta>/index.html (fuente única).
Este archivo es solo un respaldo para abrir index.html con doble clic (file://),
donde el navegador bloquea fetch(). Con un servidor web no hace falta.

Ejecutar después de editar cualquier página:
    python tools/build_pages.py
"""
import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent / "frontend"
pages = root / "src" / "pages"
out = {}
for f in sorted(pages.rglob("index.html")):
    d = f.parent.relative_to(pages).as_posix()
    if d.startswith("evento/_plantilla"):
        continue
    m = re.search(r"<main[^>]*>(.*)</main>", f.read_text(encoding="utf-8"), re.S)
    if m:
        out[d] = re.sub(r'\s*<script src="[^"]*"></script>', "", m.group(1))  # los JS ya van en index.html

js = ("/* AUTO-GENERADO por tools/build_pages.py. No editar: editar los index.html de src/pages */\n"
      "window.__PAGES = " + json.dumps(out, ensure_ascii=False).replace("</", "<\\/") + ";\n")
(root / "src" / "js" / "pages-embed.js").write_text(js, encoding="utf-8")
print(f"{len(out)} páginas -> frontend/src/js/pages-embed.js", file=sys.stderr)
