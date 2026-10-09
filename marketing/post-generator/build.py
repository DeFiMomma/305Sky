import html, json, re, sys
sys.path.insert(0, ".")
from spec import frames, P

CSS = """
:root { --black:#0a0a0a; --ivory:#ece6d9; --ink:#121110; --text:#d8d2c4; --gold:#c9a45c; --gold-deep:#8a6a2e; --gold-soft:#e3c98d;
  --gold-grad: linear-gradient(115deg,#f4e2a8 0%,#d6b26a 32%,#a87b34 62%,#e9cf8c 100%);
  --serif:"Cormorant Garamond","Times New Roman",serif; --sans:Jost,"Helvetica Neue",Arial,sans-serif; }
body { margin:0; background:#333; }
.f { position:relative; overflow:hidden; container-type:inline-size; margin:0 0 20px; -webkit-font-smoothing:antialiased; }
.ph { position:absolute; inset:0; background-repeat:no-repeat; }
.txt { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; padding:9cqw 9cqw 10cqw; z-index:2; }
.reel .txt { padding:9cqw 9cqw 40cqw; }
.eb { font:400 3.3cqw/1.35 var(--sans); letter-spacing:.3em; text-transform:uppercase; margin-bottom:3.6cqw; }
.tt { font:300 11.5cqw/1.04 var(--serif); text-wrap:balance; }
.tt.m { font-size:9.6cqw; } .tt.s { font-size:8cqw; line-height:1.1; }
.tt em { font-style:italic; }
.f { font-variant-numeric: lining-nums; }
.ltype .tt { font-size:13.5cqw; } .ltype .tt.m { font-size:11.5cqw; } .ltype .tt.s { font-size:9.6cqw; }
.ltype .sub { font-size:4.3cqw; }
.sub { font:300 3.9cqw/1.5 var(--sans); margin-top:4.5cqw; max-width:78cqw; }
.num { font:300 34cqw/.9 var(--serif); margin-bottom:3cqw; }
.step { font:300 13cqw/1 var(--serif); margin-bottom:5cqw; }
.no { position:absolute; top:6cqw; right:7cqw; font:400 2.8cqw/1 var(--sans); letter-spacing:.3em; z-index:3; }
.mark { position:absolute; left:10cqw; top:9cqw; width:19cqw; height:11cqw; background:left center/contain no-repeat; z-index:3; }
.rule { width:12cqw; height:1px; margin-top:6cqw; }
.codes { display:flex; gap:2.6cqw; flex-wrap:wrap; margin-top:5cqw; }
.codes span { font:400 3.6cqw/1 var(--sans); letter-spacing:.24em; padding:2.2cqw 2.8cqw; border:1px solid; }
.corners::after { content:""; position:absolute; inset:5cqw; z-index:3; pointer-events:none;
  background: linear-gradient(var(--c),var(--c)) top left/8cqw 2px no-repeat, linear-gradient(var(--c),var(--c)) top left/2px 8cqw no-repeat,
  linear-gradient(var(--c),var(--c)) bottom right/8cqw 2px no-repeat, linear-gradient(var(--c),var(--c)) bottom right/2px 8cqw no-repeat; }
/* dark photo */
.dphoto { background:var(--black); }
.dphoto .ph { filter:brightness(.72) contrast(1.16) saturate(.8) sepia(.22); }
.dphoto::before { content:""; position:absolute; inset:0; z-index:1; background:linear-gradient(0deg,rgba(5,5,5,.95) 0%,rgba(5,5,5,.5) 34%,transparent 58%),radial-gradient(130% 85% at 50% 30%,transparent 55%,rgba(0,0,0,.5)); }
.reel.dphoto::before { background:linear-gradient(0deg,rgba(5,5,5,.96) 0%,rgba(5,5,5,.6) 42%,transparent 66%),radial-gradient(130% 85% at 50% 30%,transparent 55%,rgba(0,0,0,.5)); }
.dphoto .eb, .dtype .eb, .end .eb, .dphoto .no, .dtype .no, .end .no { color:var(--gold); }
.dphoto .tt, .dtype .tt, .end .tt { color:var(--ivory); }
.dphoto .tt em, .dtype .tt em, .end .tt em, .dtype .num, .dtype .step { background:var(--gold-grad); -webkit-background-clip:text; background-clip:text; color:transparent; }
.dphoto .sub, .dtype .sub, .end .sub { color:var(--text); }
.dphoto .mark, .dtype .mark { background-image:url(src/logo-light.png); }
/* dark type + end card */
.dtype, .end { background:radial-gradient(90% 60% at 70% 20%,rgba(201,164,92,.22),transparent 70%),#070707; --c:var(--gold); }
.dtype .txt { justify-content:center; }
.end .txt { justify-content:center; align-items:center; text-align:center; }
.end .logo { width:46cqw; height:27cqw; background:url(src/logo-light.png) center/contain no-repeat; margin-bottom:8cqw; }
.end .sub { font:400 4.6cqw/1.3 var(--sans); letter-spacing:.2em; color:var(--gold-soft); max-width:none; }
.end .tt { font-size:10cqw; }
/* ivory type */
.ltype { background:radial-gradient(90% 70% at 20% 0%,#f6f1e6,transparent 70%),var(--ivory); --c:var(--gold-deep); }
.ltype .txt { justify-content:center; }
.ltype .eb, .ltype .no, .lphoto .eb, .lphoto .no { color:var(--gold-deep); }
.ltype .tt, .lphoto .tt { color:var(--ink); }
.ltype .tt em, .lphoto .tt em, .ltype .num, .ltype .step { color:var(--gold-deep); }
.ltype .sub { color:#4a463f; }
.ltype .mark, .lphoto .mark { background-image:url(src/logo.png); }
.ltype .rule { background:linear-gradient(90deg,var(--gold-deep),transparent); }
.ltype .codes span { color:var(--ink); border-color:rgba(138,106,46,.55); }
.ltype.quote .tt { font-size:10.5cqw; }
/* ivory framed photo */
.lphoto { background:var(--ivory); }
.lphoto .ph { inset:13cqw 7cqw 34cqw; filter:contrast(1.05) saturate(.88) sepia(.08); }
.lphoto .txt { padding:0 7cqw 8cqw; }
.lphoto .tt { font-size:8.6cqw; }
/* plain album photo */
.plain .ph { filter:brightness(.92) contrast(1.08) saturate(.9) sepia(.12); }
"""

def head(s):
    return re.sub(r"\*([^*]+)\*", r"<em>\1</em>", html.escape(s))

def size_cls(tt):
    n = len(tt.replace("*", ""))
    return " s" if n > 44 else " m" if n > 24 else ""

out = []
for f in frames:
    w, h = f.get("w", 1080), f.get("h", 1350)
    t = f["t"]
    cls = ["f", t] + (["reel"] if f.get("reel") else []) + (["corners"] if t in ("ltype", "dtype", "end") else []) + (["quote"] if f.get("quote") else [])
    inner = ""
    if f.get("ph"):
        src, pos, size, *flt = P[f["ph"]]
        fs = f";filter:{flt[0]}" if flt else ""
        inner += f'<div class="ph" style="background-image:url(src/{src});background-size:{size};background-position:{pos}{fs}"></div>'
    if t == "plain":
        out.append(f'<div id="{f["id"]}" class="{" ".join(cls)}" style="width:{w}px;height:{h}px">{inner}</div>')
        continue
    if f.get("no"):
        inner += f'<div class="no">{f["no"]}</div>'
    covers = f.get("no") in (None, "01/04", "01/06", "01/08", "01/07", "01/03")
    if t in ("dphoto", "ltype", "dtype") and f.get("mark", True) and covers and not f.get("reel"):
        inner += '<span class="mark"></span>'
    body = ""
    if t == "end":
        body += '<div class="logo"></div>'
    if f.get("step"):
        body += f'<div class="step">{f["step"]}</div>'
    if f.get("eb"):
        body += f'<div class="eb">{html.escape(f["eb"])}</div>'
    if f.get("num"):
        body += f'<div class="num">{f["num"]}</div>'
    if f.get("tt"):
        sc = size_cls(f["tt"]) if not f.get("num") else " s"
        body += f'<div class="tt{sc}">{head(f["tt"])}</div>'
    if f.get("codes"):
        body += '<div class="codes">' + "".join(f"<span>{c}</span>" for c in f["codes"]) + "</div>"
    if f.get("sub"):
        body += '<div class="sub">' + html.escape(f['sub']).replace('\n', '<br>') + '</div>'
    if t == "ltype" and not f.get("codes"):
        body += '<div class="rule"></div>'
    inner += f'<div class="txt">{body}</div>'
    out.append(f'<div id="{f["id"]}" class="{" ".join(cls)}" style="width:{w}px;height:{h}px">{inner}</div>')

page = f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{''.join(out)}</body></html>"""
open("render.html", "w").write(page)
json.dump([{"id": f["id"], "t": f["t"]} for f in frames], open("frames.json", "w"))
print(len(frames), "frames")
