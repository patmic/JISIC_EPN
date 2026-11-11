#!/usr/bin/env python3
"""Genera frontend/src/js/pages-embed.js con el <main> de cada página.
Sirve de respaldo cuando el sitio se abre con file:// (fetch bloqueado).
Ejecutar después de editar cualquier src/pages/**/index.html:
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
        out[d] = m.group(1)

js = ("/* AUTO-GENERADO por tools/build_pages.py — no editar a mano. */\n"
      "window.__PAGES = " + json.dumps(out, ensure_ascii=False).replace("</", "<\\/") + ";\n")
(root / "src" / "js" / "pages-embed.js").write_text(js, encoding="utf-8")
print(f"{len(out)} páginas -> src/js/pages-embed.js", file=sys.stderr)
