# Every frame to render. Instagram posts get 1080x1350 (4:5); Reel frames 1080x1920.
# t: dphoto | dtype | ltype | lphoto | plain | end
PHONE = "305-326-3498"

def F(id, t, **k):
    d = {"id": id, "t": t}
    d.update(k)
    return d

P = {  # photo -> (file, default position, size)
    "logo": ("lounge.jpg", "64% 33%", "190%"),
    "lounge": ("lounge.jpg", "50% 50%", "cover"),
    "hero": ("hero.jpg", "30% 55%", "cover"),
    "vrb": ("vrb-hangar.jpg", "50% 30%", "cover"),
    "sunset": ("wa-0804-a.jpg", "14% 70%", "auto 118%", "brightness(.9) contrast(1.12) saturate(1.2) sepia(.08)"),
    "dusk": ("wa-0804-j.jpg", "50% 45%", "cover"),
    "techEngine": ("wa-0902-b.jpg", "50% 40%", "cover"),
    "cabin": ("wa-0213-a.jpg", "72% 50%", "cover"),
    "cabinSeats": ("wa-0213-c.jpg", "50% 50%", "cover"),
    "cabinAft": ("wa-0213-d.jpg", "50% 60%", "cover"),
    "cabinStripped": ("wa-0805-b.jpg", "50% 50%", "cover"),
    "turbine": ("wa-0805-k.jpg", "45% 50%", "cover"),
    "crew": ("oct-image0.jpg", "50% 60%", "cover"),
    "techCockpit": ("oct-image5.jpg", "50% 50%", "cover"),
    "propTech": ("oct-image2.jpg", "50% 50%", "cover"),
    "techsWing": ("wa-0804-s.jpg", "40% 40%", "cover"),
    "cockpit": ("wa-2023-b.jpg", "50% 50%", "cover"),
    "garmin": ("wa-0213-b.jpg", "50% 45%", "cover"),
    "oldPanel": ("N191WB-avionics.jpg", "50% 55%", "cover"),
    "challenger": ("wa-0805-j.jpg", "22% 65%", "auto 115%"),
    "hangarFull": ("wa-0804-n.jpg", "50% 65%", "cover"),
}

CODES = ["FLL", "FXE", "BCT", "VRB"]
frames = []
add = frames.append

# ---------------- Instagram ----------------
# IG01 Mon 10/12 carousel (dark)
add(F("2026-10-12_IG01_1", "dphoto", ph="logo", eb="Now open · Fort Lauderdale–Hollywood Intl", tt="Our newest home. *FLL.*", no="01/04", mark=False))
add(F("2026-10-12_IG01_2", "dphoto", ph="lounge", eb="The FLL lounge", tt="Coffee's *on.*", no="02/04"))
add(F("2026-10-12_IG01_3", "dphoto", ph="hero", eb="FLL ramp · golden hour", tt="Doors *open.*", no="03/04"))
add(F("2026-10-12_IG01_4", "ltype", eb="Four locations", tt="One *standard.*", codes=CODES, sub="240 SW 34th St, Fort Lauderdale\n" + PHONE, no="04/04"))
# IG02 Tue 10/13 carousel (ivory)
add(F("2026-10-13_IG02_1", "ltype", eb="The bloodline · Chapter 1", tt="A young company. *A long lineage.*", no="01/06"))
add(F("2026-10-13_IG02_2", "ltype", eb="Where it starts", tt="Three generations of *aviators.*", no="02/06"))
add(F("2026-10-13_IG02_3", "lphoto", ph="crew", eb="The family business", tt="Hangars, logbooks and *jet fuel.*", no="03/06"))
add(F("2026-10-13_IG02_4", "ltype", eb="In our family", num="55+", tt="Years of experience in aviation", no="04/06"))
add(F("2026-10-13_IG02_5", "ltype", eb="The bloodline runs deep", tt="The founder's first son is named *Jet.*", no="05/06"))
add(F("2026-10-13_IG02_6", "ltype", eb="Founded 2019", tt="Four airports *today.*", codes=CODES, no="06/06"))
# IG03 Wed 10/14 reel cover (grid tile) + reel frames
add(F("2026-10-14_IG03_cover", "dphoto", ph="sunset", eb="Return to service", tt="Back in the *sky.*", reelglyph=True))
# IG04 Thu 10/15 carousel (ivory)
add(F("2026-10-15_IG04_1", "ltype", eb="How we work", tt="Clear quotes. *No surprises.*", no="01/06"))
add(F("2026-10-15_IG04_2", "ltype", step="01", tt="Tell us what you *need.*", sub="Tail number, location and the squawks you have in mind.", no="02/06"))
add(F("2026-10-15_IG04_3", "ltype", step="02", tt="A written *quote.*", sub="Inspections at a flat rate to the manufacturer's program.", no="03/06"))
add(F("2026-10-15_IG04_4", "ltype", step="03", tt="You approve any *findings.*", sub="Anything new is priced and sent to you first. Nothing extra without your OK.", no="04/06"))
add(F("2026-10-15_IG04_5", "ltype", step="04", tt="Fly away *documented.*", sub="An itemized invoice and complete logbook entries, every time.", no="05/06"))
add(F("2026-10-15_IG04_6", "end", tt="Questions? *Call an owner.*", sub=PHONE, no="06/06"))
# IG05 Fri 10/16 single dark
add(F("2026-10-16_IG05", "dphoto", ph="crew", eb="Meet the crew", tt="The family behind *the work.*"))
# IG06 Sat 10/17 single ivory testimonial
add(F("2026-10-17_IG06", "ltype", eb="15-year client · Private jet owner", tt="“Fair and transparent, and that is *hard to find.*”", quote=True))
# IG07 Tue 10/20 reel cover
add(F("2026-10-20_IG07_cover", "dphoto", ph="techCockpit", eb="AOG support · 30-mile radius", tt="Grounded? *We pick up.*", reelglyph=True))
# IG08 Wed 10/21 carousel ivory
add(F("2026-10-21_IG08_1", "ltype", eb="Owners on speed dial", tt="When you call, *we answer.*", no="01/06"))
add(F("2026-10-21_IG08_2", "ltype", tt="No call *center.*", no="02/06"))
add(F("2026-10-21_IG08_3", "ltype", tt="No *gatekeepers.*", no="03/06"))
add(F("2026-10-21_IG08_4", "ltype", tt="No waiting a week to reach someone who can *decide.*", no="04/06"))
add(F("2026-10-21_IG08_5", "ltype", eb="Our clients", tt="Have the owners' cell numbers. Many have become *family.*", no="05/06"))
add(F("2026-10-21_IG08_6", "end", tt="Save the *number.*", sub=PHONE, no="06/06"))
# IG09 Thu 10/22 single dark
add(F("2026-10-22_IG09", "dphoto", ph="turbine", eb="Inside the hangar", tt="Detail is *the difference.*"))
# IG10 Sat 10/24 carousel ivory
aog = [("01", "Tail number, type and *serial.*", ""), ("02", "Where it *is.*", "Airport, FBO and parking spot."),
       ("03", "What *happened.*", "Messages, symptoms, photos or video."), ("04", "Access to the *records.*", "Recent maintenance history."),
       ("05", "Who can *approve.*", "Work and spending, and how to reach them."), ("06", "When it needs to *fly.*", "")]
add(F("2026-10-24_IG10_1", "ltype", eb="Owner's guide", tt="AOG? Have these *ready.*", no="01/08"))
for i, (s, t, sub) in enumerate(aog):
    add(F(f"2026-10-24_IG10_{i+2}", "ltype", step=s, tt=t, sub=sub, no=f"0{i+2}/08"))
add(F("2026-10-24_IG10_8", "end", tt="Then call *us.*", sub=PHONE, no="08/08"))
# IG11 Tue 10/27 carousel dark
add(F("2026-10-27_IG11_1", "dphoto", ph="challenger", eb="Pre-buy inspections", tt="Know what you're *buying.*", no="01/04"))
add(F("2026-10-27_IG11_2", "dphoto", ph="cockpit", eb="Step one", tt="Records first. Every logbook, *every AD.*", no="02/04"))
add(F("2026-10-27_IG11_3", "dphoto", ph="turbine", eb="Step two", tt="Then the aircraft, *nose to tail.*", no="03/04"))
add(F("2026-10-27_IG11_4", "ltype", eb="What you receive", tt="A clear written *report.*", sub="For you, your broker, your lender and your insurer.\n" + PHONE, no="04/04"))
# IG12 Wed 10/28 carousel ivory
qs = ["Are the logbooks complete, with *no gaps?*", "Are all ADs and service bulletins *complied with?*",
      "What inspections are coming due, and *what will they cost?*", "Any damage *history?*",
      "Who did the last major work, and is it *documented?*"]
add(F("2026-10-28_IG12_1", "ltype", eb="Owner's guide", tt="5 questions *before you buy.*", no="01/07"))
for i, q in enumerate(qs):
    add(F(f"2026-10-28_IG12_{i+2}", "ltype", step=f"0{i+1}", tt=q, no=f"0{i+2}/07"))
add(F("2026-10-28_IG12_7", "end", tt="We answer all five in a *written report.*", sub=PHONE, no="07/07"))
# IG13 Thu 10/29 carousel dark
add(F("2026-10-29_IG13_1", "dphoto", ph="cabin", eb="Interiors", tt="Transform the *cabin.*", no="01/04"))
add(F("2026-10-29_IG13_2", "dphoto", ph="cabinSeats", eb="Hand-stitched", tt="Every seam *considered.*", no="02/04"))
add(F("2026-10-29_IG13_3", "dphoto", ph="cabinAft", eb="Looking aft", tt="Where owners *live.*", no="03/04"))
add(F("2026-10-29_IG13_4", "dphoto", ph="cabinStripped", eb="Down to the frame", tt="Every great cabin *starts here.*", no="04/04"))
# IG14 Sat 10/31 stat ivory
add(F("2026-10-31_IG14", "ltype", eb="Since 2019 · A long lineage", num="55+", tt="Years of family experience in aviation"))
# IG15 Tue 11/3 carousel dark
add(F("2026-11-03_IG15_1", "dphoto", ph="vrb", eb="Vero Beach · 12,000+ sq ft", tt="Room for the jets that *need it.*", no="01/03", mark=False))
add(F("2026-11-03_IG15_2", "dphoto", ph="hangarFull", eb="Inside, out of the weather", tt="Sun, storms and salt air *stay outside.*", no="02/03"))
add(F("2026-11-03_IG15_3", "ltype", eb="Large-cabin jets", tt="Falcon · Gulfstream · Global · *Challenger.*", sub="Mid-size and heavy jets, worked on inside.\n" + PHONE, no="03/03"))
# IG16 Wed 11/4 ivory codes
add(F("2026-11-04_IG16", "ltype", eb="Four locations", tt="One *standard.*", codes=CODES))
# IG17 Thu 11/5 carousel dark
add(F("2026-11-05_IG17_1", "dphoto", ph="garmin", eb="Garmin avionics · Boca Raton", tt="Before you upgrade the *panel.*", no="01/04"))
add(F("2026-11-05_IG17_2", "dphoto", ph="oldPanel", eb="Where many panels start", tt="Round gauges, *long days.*", no="02/04"))
add(F("2026-11-05_IG17_3", "ltype", eb="What we install", tt="Displays · Navigators · Autopilots · *ADS-B.*", no="03/04"))
add(F("2026-11-05_IG17_4", "ltype", eb="How we work", tt="Plan and quote first. *Paperwork after.*", sub="Panel layout and a written quote before work begins. Weight & balance and logbook entries when it's done.", no="04/04"))
# IG18 Sat 11/7 single ivory
add(F("2026-11-07_IG18", "ltype", eb="Now hiring · A&P mechanics", tt="Join the *crew.*", sub="DM us or call " + PHONE))

# ---------------- Reel frames (1080x1920) ----------------
R = dict(w=1080, h=1920, reel=True)
add(F("reel_IG03_a", "dphoto", ph="sunset", eb="Return to service", tt="Back in the *sky.*", **R))
add(F("reel_IG03_b", "dphoto", ph="techEngine", eb="Signed off", tt="Every detail *checked.*", **R))
add(F("reel_IG03_c", "dphoto", ph="cockpit", eb="Documented", tt="Every logbook entry *complete.*", **R))
add(F("reel_IG03_d", "end", tt="Back in the *sky.*", sub="305 SKY · " + PHONE, **R))
add(F("reel_IG07_a", "dtype", eb="9:12 p.m.", tt="Grounded?", **R))
add(F("reel_IG07_b", "dphoto", ph="techCockpit", eb="AOG support · 30-mile radius", tt="We pick *up.*", **R))
add(F("reel_IG07_c", "dphoto", ph="propTech", eb="FLL · FXE · BCT · VRB", tt="And we *show up.*", **R))
add(F("reel_IG07_d", "dtype", eb="Who answers", tt="A real person. *Usually an owner.*", **R))
add(F("reel_IG07_e", "end", tt="Save the *number.*", sub=PHONE, **R))

# ---------------- LinkedIn / Facebook images ----------------
add(F("2026-10-12_LI", "dphoto", ph="logo", eb="Now at FLL", tt="Four airports. *One standard.*", mark=False))
add(F("2026-10-19_LI", "dphoto", ph="techCockpit", eb="NBAA-BACE week", tt="Who answers at *9 p.m.?*"))
add(F("2026-10-29_LI-FB-boatshow", "dphoto", ph="sunset", eb="Boat show week · FLL & FXE", tt="Welcome to *Fort Lauderdale.*"))
add(F("2026-11-02_LI", "dphoto", ph="vrb", eb="Vero Beach · 12,000+ sq ft", tt="Large cabins, *inside.*", mark=False))
add(F("2026-11-05_LI-hiring", "dphoto", ph="techEngine", eb="Now hiring", tt="A&P *mechanics.*"))
add(F("2026-11-06_FB-hiring", "dphoto", ph="crew", eb="We're hiring", tt="Join the *crew.*"))
# LinkedIn document carousel: pre-buy (10/26)
pb = ["Logbook and records *review.*", "AD and service bulletin *compliance.*", "Inspection program *status.*",
      "Damage history *research.*", "Airframe, engine and *systems.*", "Avionics and *equipment.*"]
add(F("2026-10-26_LI-doc_1", "dphoto", ph="challenger", eb="For brokers, buyers and lenders", tt="What a 305 SKY pre-buy *covers.*", no="01/08"))
for i, x in enumerate(pb):
    add(F(f"2026-10-26_LI-doc_{i+2}", "ltype", step=f"0{i+1}", tt=x, no=f"0{i+2}/08"))
add(F("2026-10-26_LI-doc_8", "end", tt="A clear written *report.*", sub="Ready for your broker, lender or insurer\n" + PHONE, no="08/08"))

# Facebook albums / plain photos (graded, no text)
for d, ph in [("2026-10-13_FB-album_1", "logo"), ("2026-10-13_FB-album_2", "lounge"), ("2026-10-13_FB-album_3", "hero"),
              ("2026-10-14_FB", "crew"), ("2026-10-21_FB", "logo"), ("2026-10-23_FB", "techsWing"),
              ("2026-10-28_FB-album_1", "cabin"), ("2026-10-28_FB-album_2", "cabinSeats"), ("2026-10-28_FB-album_3", "cabinAft"),
              ("2026-11-03_FB-album_1", "vrb"), ("2026-11-03_FB-album_2", "hangarFull"), ("2026-11-04_FB", "garmin")]:
    add(F(d, "plain", ph=ph))
