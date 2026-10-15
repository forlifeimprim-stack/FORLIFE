"""Assemble index.html : polices + bande-son intégrées en base64 (fichier autonome)."""
import base64, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
fonts = root / "tools" / "fonts"
faces = [("Poppins", "normal", w, f"poppins-latin-{w}-normal.woff2") for w in (300, 600, 800)]
faces.append(("Playfair Display", "italic", 500, "playfair-display-latin-500-italic.woff2"))
css = "\n".join(
    f"@font-face{{font-family:'{n}';font-style:{s};font-weight:{w};font-display:block;"
    f"src:url(data:font/woff2;base64,{b64(fonts / f)}) format('woff2')}}" for n, s, w, f in faces)
html = (root / "src" / "template.html").read_text()
audio = sys.argv[1] if len(sys.argv) > 1 else "bande-son.mp3"
logos = {k: "data:image/png;base64," + b64(root / "assets" / f"logo-{n}.png") for k, n in (("FULL", "uvci"), ("MARK", "mark"), ("TEXT", "text"))}
for k, v in logos.items():
    html = html.replace(f"__LOGO_{k}__", v)
html = html.replace("/*__FONTS__*/", css).replace("__AUDIO__", "data:audio/mpeg;base64," + b64(root / audio))
(root / "index.html").write_text(html)
print("index.html", len(html) // 1024, "Ko")
