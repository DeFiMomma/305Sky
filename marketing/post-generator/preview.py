import json, os, shutil, sys, html
from PIL import Image
sys.path.insert(0, ".")
from posts import posts, PDFS, PREVIEW
D = "preview"; shutil.rmtree(D, ignore_errors=True); os.makedirs(f"{D}/img")
def thumb(name):
    src = f"out/{name}"
    dst = f"{D}/img/{name}"
    if not os.path.exists(dst):
        im = Image.open(src).convert("RGB"); im.thumbnail((640, 1140)); im.save(dst, quality=82)
    return f"img/{name}"
data = []
for p in sorted(posts, key=lambda x: (x["date"], {"LinkedIn":0,"Instagram":1,"Facebook":2}[x["net"]])):
    imgs, video = [], None
    for m in p["media"]:
        if m.endswith(".mp4"):
            shutil.copy(f"kit/media/{m}", f"{D}/img/{m}"); video = f"img/{m}"; imgs.append(thumb(PREVIEW[m]))
        elif m.endswith(".pdf"):
            imgs += [thumb(x) for x in PDFS[m]]
        else:
            imgs.append(thumb(m))
    data.append(dict(date=p["date"], time=p["time"], net=p["net"], label=p["label"], text=p["text"], imgs=imgs, video=video,
                     files=p["media"], subtype=p.get("subtype", ""), flag=("CONFIRM" in p["label"] or "CONFIRM" in p["text"])))
grid = [thumb(p["media"][0] if not p["media"][0].endswith(".mp4") else PREVIEW[p["media"][0]]) for p in posts if p["net"] == "Instagram"][::-1]
tpl = open("preview_tpl.html").read()
open(f"{D}/index.html", "w").write(tpl.replace("/*DATA*/", "const POSTS = " + json.dumps(data) + ";\nconst GRID = " + json.dumps(grid) + ";"))
print(len(data), "posts", len(os.listdir(f"{D}/img")), "files")
