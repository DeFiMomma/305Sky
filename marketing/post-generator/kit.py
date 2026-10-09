import csv, os, shutil, sys
from PIL import Image
sys.path.insert(0, ".")
from posts import posts, PDFS, PREVIEW
K = "kit"; M = f"{K}/media"
shutil.rmtree(K, ignore_errors=True); os.makedirs(M)
for pdf, pages in PDFS.items():
    ims = [Image.open(f"out/{p}").convert("RGB") for p in pages]
    ims[0].save(f"{M}/{pdf}", save_all=True, append_images=ims[1:], resolution=150)
used = set()
for p in posts:
    for m in p["media"]:
        used.add(m)
        if not m.endswith(".pdf"):
            shutil.copy(f"out/{m}", f"{M}/{m}")
missing = [m for m in used if not os.path.exists(f"{M}/{m}")]
assert not missing, missing
HEAD = ["Date", "Text", "Link(s)", "Media URLs", "Title", "Label(s)", "Alt text(s)", "Comment(s)", "Post subtype"]
for net in ["Instagram", "Facebook", "LinkedIn"]:
    with open(f"{K}/publer-{net.lower()}.csv", "w", newline="") as fh:
        w = csv.writer(fh); w.writerow(HEAD)
        for p in posts:
            if p["net"] != net: continue
            alts = "||".join([p["alt"]] * len(p["media"])) if p["alt"] and not any(m.endswith(".pdf") for m in p["media"]) else ""
            w.writerow([f'{p["date"]} {p["time"]}', p["text"], "", "", p.get("title", ""), p["label"], alts, "", p.get("subtype", "")])
with open(f"{K}/media-checklist.csv", "w", newline="") as fh:
    w = csv.writer(fh); w.writerow(["Date", "Time (ET)", "Network", "Post", "Upload these files, in this order"])
    for p in sorted(posts, key=lambda x: (x["date"], x["time"])):
        w.writerow([p["date"], p["time"], p["net"], p["label"], " | ".join(p["media"]) or "(text only)"])
print(len(posts), "posts;", len(os.listdir(M)), "media files")
