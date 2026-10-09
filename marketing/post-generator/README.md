# Post generator

Renders 305 SKY posts in the brand templates. Source photos live in the Drive folder (see `marketing/photos/catalog.md`);
copy the needed ones into `src/` (with tail numbers blurred) next to these scripts.

1. Edit `spec.py` (frames: template, photo, eyebrow, headline with *italic gold* words) and `posts.py` (captions, dates).
2. `python3 build.py && node shoot.mjs $PWD` → `out/*.jpg` (Playwright + Chromium).
3. Reels: ffmpeg zoompan + xfade over the 1080×1920 frames (see the session log for the exact command).
4. `python3 kit.py` → Publer kit; `python3 preview.py` → preview page.
