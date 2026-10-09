# All 42 posts: date, time (ET), network, label, media files, alt text, caption. Mirrors the content calendar doc.
PH = "305-326-3498"
IG_T, LI_T, FB_T = "11:30", "08:30", "12:30"

def ig(date, n, kind, media, alt, text, tags, tone, subtype=""):
    return dict(date=date, time=IG_T, net="Instagram", label=f"IG {n:02d} · {kind} · {tone}", media=media, alt=alt,
                text=text.strip() + "\n\n" + tags, subtype=subtype or ("reel" if "reel" in kind.lower() else ""))

def li(date, label, text, media=(), alt="", tags="", subtype="", time=LI_T, title=""):
    return dict(date=date, time=time, net="LinkedIn", label=label, media=list(media), alt=alt,
                text=text.strip() + ("\n\n" + tags if tags else ""), subtype=subtype, title=title)

def fb(date, label, text, media=(), alt="", subtype=""):
    return dict(date=date, time=FB_T, net="Facebook", label=label, media=list(media), alt=alt, text=text.strip(), subtype=subtype)

def slides(prefix, n):
    return [f"{prefix}_{i}.jpg" for i in range(1, n + 1)]

posts = [
# ---------------- Week 1 ----------------
ig("2026-10-12", 1, "Carousel", slides("2026-10-12_IG01", 4), "The gold 305 SKY palm logo lit on a dark wall in the FLL lobby.", """
Our newest home: Fort Lauderdale–Hollywood International.

The lights are on, the coffee is on, and the hangar door is open. FLL joins FXE, Boca Raton and Vero Beach, so 305 SKY is now at four airports on Florida's east coast.

Same family. Same standard. Same cell numbers.

Stop by and say hello. 240 SW 34th St, Fort Lauderdale.""", "#305SKY #FortLauderdale #FLL #BusinessAviation #AircraftMaintenance", "Dark"),
li("2026-10-12", "LI · Company · Now at FLL", f"""
305 SKY is now at Fort Lauderdale–Hollywood International (FLL).

FLL is our newest base, joining Fort Lauderdale Executive (FXE), Boca Raton (BCT) and our 12,000+ sq ft hangar in Vero Beach (VRB).

What that means for owners and flight departments:
• Light to mid-size jets and turboprops at FLL, FXE and BCT
• Mid-size to heavy jets inside our Vero Beach hangar
• AOG response within 30 miles of each location
• Aircraft management and maintenance under one roof, with one point of contact

We're a third-generation aviation family. Four airports, one standard.

{PH} · www.305sky.com""", ["2026-10-12_LI.jpg"], "The lit 305 SKY logo in the FLL lobby.", "#BusinessAviation #AircraftMaintenance #FortLauderdale"),
ig("2026-10-13", 2, "Carousel", slides("2026-10-13_IG02", 6), "Ivory card in serif type reading: A young company. A long lineage.", """
305 SKY was founded in 2019. The aviation in our family goes back three generations.

We grew up around hangars, logbooks and the smell of jet fuel. More than 55 years of family experience goes into every inspection, every repair and every phone call.

The aviation bloodline runs deep here. Deep enough that the founder's first son is named Jet.

Chapter 2 next month.""", "#305SKY #FamilyBusiness #AviationFamily #BusinessAviation #FortLauderdale", "Ivory"),
fb("2026-10-13", "FB · FLL now open album", f"""
We're officially at FLL! 🌴

Our newest base at Fort Lauderdale–Hollywood International is open, lobby and all. Here's a look around. If you're on the field, stop by, say hi and have a coffee with us.

240 SW 34th St, Fort Lauderdale · {PH}""", slides("2026-10-13_FB-album", 3), "The FLL lobby, lounge and ramp at 305 SKY."),
ig("2026-10-14", 3, "Reel", ["2026-10-14_IG03_reel.mp4"], "A King Air at sunset on the ramp after return to service.", """
The best moment in our week: an aircraft we've cared for heads back to where it belongs.

Signed off. Every logbook entry complete. Back in the sky.""", "#305SKY #KingAir #AircraftMaintenance #BusinessAviation #FortLauderdale", "Dark"),
li("2026-10-14", "LI · Owner personal · Cell number", f"""
Every one of our clients has my cell number.

People are sometimes surprised by that. In this industry you can spend a week trying to reach someone who can actually make a decision about your aircraft.

At 305 SKY, that's not how it works. Our clients call an owner directly, at any hour. Many of them have become friends, and some feel like family.

It isn't a policy. It's how my family has done aviation for three generations.

If you manage or own an aircraft in South Florida and you're tired of being gatekept, my number is {PH}."""),
fb("2026-10-14", "FB · The bloodline", """
Three generations of aviators, and the founder's first son is named Jet. ✈️

305 SKY started in 2019, but aviation has been in our family for more than 55 years. That's why we treat every aircraft like it belongs to family, and every client like they're part of ours.

Who got you into aviation? Tell us in the comments.""", ["2026-10-14_FB.jpg"], "The 305 SKY crew working together in the hangar under an American flag."),
ig("2026-10-15", 4, "Carousel", slides("2026-10-15_IG04", 6), "Ivory card reading: Clear quotes. No surprises.", f"""
The most stressful part of aircraft maintenance shouldn't be the invoice.

At 305 SKY, inspections are quoted at a flat rate to the manufacturer's program. Anything we find is priced and sent to you first. Nothing extra happens without your approval.

Save this for your next inspection.""", "#305SKY #AircraftOwner #AircraftMaintenance #BusinessAviation #PrivateAviation", "Ivory"),
li("2026-10-15", "LI · Company · How we quote (PDF)", """
How we quote maintenance, in 4 steps.

Directors of maintenance tell us the same thing: the final invoice rarely matches the quote. Here's how we keep them close.

1. Scope agreed in writing before any work starts
2. Inspections at a flat rate to the manufacturer's program
3. Every finding priced and sent first; nothing worked without approval
4. Itemized invoice and completed logbook entries at delivery

Our system tracks every job against its quote, and any price change needs a written reason. It's the same discipline we'd want if it were our aircraft.""", ["2026-10-15_LI-doc.pdf"], "", "", "pdf", title="How 305 SKY quotes maintenance"),
ig("2026-10-16", 5, "Single", ["2026-10-16_IG05.jpg"], "The 305 SKY crew gathered around a workbench in the hangar under an American flag.", """
Fifteen people, four airports, one standard.

These are the hands on your aircraft, and every one of them knows that a client might call the owner at 9 p.m. They wouldn't have it any other way.

Meet them one by one, starting next week.""", "#305SKY #AviationMaintenance #AandP #AviationCareers #FortLauderdale", "Dark"),
fb("2026-10-16", "FB · Meet the crew", """
Happy Friday from the 305 SKY crew! 🇺🇸

15 people across FLL, FXE, Boca Raton and Vero Beach keep our clients' aircraft flying. We'll introduce them one at a time over the coming weeks.

Have a favorite memory with our team? Drop it below.""", ["2026-10-16_IG05.jpg"], "The 305 SKY crew in the hangar under an American flag."),
ig("2026-10-17", 6, "Single", ["2026-10-17_IG06.jpg"], "Ivory card with a client quote: Fair and transparent, and that is hard to find.", """
“I've been working with Gabriel of 305 SKY for more than 15 years and I have total faith in his skills and abilities. I always give him business whenever I can. He is super knowledgeable, hard working, fair and transparent, and that is really hard to find these days.”

— Private jet owner, Florida

Thank you. Fifteen years of trust is the best review we could ask for.""", "#305SKY #ClientLove #PrivateJet #AircraftOwner #BusinessAviation", "Ivory"),
# ---------------- Week 2 ----------------
li("2026-10-19", "LI · Company · NBAA week", f"""
This week, business aviation gathers in Las Vegas for NBAA-BACE (Oct 20–22).

The new aircraft and big announcements will get the headlines. For owners and flight departments, though, the moment that matters most is quieter: the phone call when an aircraft is grounded at 9 p.m.

Who answers? How fast? Do they know your aircraft?

At 305 SKY, AOG calls go to people who can make decisions, and our team responds within 30 miles of FLL, FXE, Boca Raton and Vero Beach.

{PH}""", ["2026-10-19_LI.jpg"], "A technician working in a business jet cockpit.", "#NBAABACE #BusinessAviation #AOG"),
ig("2026-10-20", 7, "Reel", ["2026-10-20_IG07_reel.mp4"], "A technician in a cockpit and at a propeller; text: Grounded? We pick up.", f"""
Aircraft don't break on a schedule.

When yours is on the ground, you call us and a real person answers, often an owner. We respond within 30 miles of FLL, FXE, Boca Raton and Vero Beach.

Save our number before you need it: {PH}.""", "#305SKY #AOG #AircraftMaintenance #BusinessAviation #SouthFlorida", "Dark"),
fb("2026-10-20", "FB · AOG Reel", f"""
When your aircraft is grounded, the last thing you need is a phone tree. 📞

Call 305 SKY and a real person picks up, often one of the owners. AOG support within 30 miles of FLL, FXE, Boca Raton and Vero Beach.

Save the number: {PH}""", ["2026-10-20_IG07_reel.mp4"], "", "reel"),
ig("2026-10-21", 8, "Carousel", slides("2026-10-21_IG08", 6), "Ivory card reading: When you call, we answer.", """
Our favorite compliment: “I can't believe I got you on the first ring.”

Every 305 SKY client can reach an owner directly. It's how a family business should work, and it's why so many of our clients have become friends.""", "#305SKY #AircraftOwner #PrivateAviation #FamilyBusiness #FortLauderdale", "Ivory"),
li("2026-10-21", "LI · Owner personal · No gatekeepers [CONFIRM line]", """
A director of maintenance once told me the hardest part of his job wasn't the aircraft. It was getting a straight answer from the shop.

That's the thing I'm proudest of at 305 SKY. When a client calls, they reach someone who knows their aircraft and can make a decision, usually me or my family.

No gatekeepers. No “we'll get back to you.” Just an answer.

To everyone in Las Vegas for NBAA-BACE this week: enjoy the show. We'll keep the phones on."""),
fb("2026-10-21", "FB · Owners on speed dial", """
Fun fact: every one of our clients has the owners' cell numbers. 🌴

No gatekeepers, no call center. It's how our family has done aviation for three generations.

What's the best customer service you've ever had? Tell us below.""", ["2026-10-21_FB.jpg"], "The lit 305 SKY logo in the FLL lobby."),
ig("2026-10-22", 9, "Single", ["2026-10-22_IG09.jpg"], "Close-up of an exposed turbine engine with polished metal casing and tubing.", """
Every fitting, every clamp, every line.

A turbine engine is thousands of details working together. Our job is to see every one of them and leave a record you can trust.""", "#305SKY #AviationMaintenance #TurbineEngine #InsideTheHangar #BusinessAviation", "Dark"),
li("2026-10-22", "LI · Company · AOG readiness (PDF)", f"""
AOG readiness: 6 things to have ready before you make the call.

The first 15 minutes of an AOG call decide how fast an aircraft gets back in service. Flight departments that have these ready get answers faster:

1. Tail number, type and serial number
2. Exact location: airport, FBO and parking spot
3. What happened: messages, symptoms, photos or video
4. Recent maintenance history and access to the records
5. Who can approve work and spending, and how to reach them
6. When the aircraft needs to fly next

Save this for your crew. And keep {PH} in the binder.""", ["2026-10-22_LI-doc.pdf"], "", "", "pdf", title="AOG readiness checklist"),
fb("2026-10-23", "FB · Techs on the wing", """
Friday on the wing. 🛠️

Two of our techs, deep in the details on a King Air. No shortcuts, just care. Happy weekend from the 305 SKY crew!""", ["2026-10-23_FB.jpg"], "Two 305 SKY technicians working on a King Air wing in the hangar."),
ig("2026-10-24", 10, "Carousel", slides("2026-10-24_IG10", 8), "Ivory card reading: AOG? Have these ready.", """
An AOG is stressful. This list makes it shorter.

Have these six things ready when you call, and you'll get answers faster from any shop, especially ours.

Save this and share it with your pilots.""", "#305SKY #AOG #AircraftOwner #PilotLife #BusinessAviation", "Ivory"),
# ---------------- Week 3 ----------------
li("2026-10-26", "LI · Company · Pre-buy (PDF)", """
For brokers, buyers and lenders: what a 305 SKY pre-buy inspection covers.

An aircraft is only as good as its records and its condition. Our pre-buys look at both:

• Logbook and records review
• AD and service bulletin compliance
• Inspection and maintenance program status
• Damage history research
• Airframe, engine and systems inspection
• Avionics and equipment check

Every pre-buy ends with a clear written report: what's airworthy, what's due, and what needs attention before or after closing. It's ready to share with your broker, lender or insurer.

Selling instead? We also offer stand-alone records reviews.""", ["2026-10-26_LI-doc.pdf"], "", "#AircraftSales #PrePurchaseInspection #BusinessAviation", "pdf", title="What a 305 SKY pre-buy covers"),
ig("2026-10-27", 11, "Carousel", slides("2026-10-27_IG11", 4), "The nose of a Challenger jet with its stairs down on the ramp.", f"""
A beautiful aircraft can hide an expensive story.

Before you close, our team reviews the records and the aircraft itself, then hands you a clear report: what's airworthy, what's due, and what needs attention.

Buying this season? Talk to us first. {PH}""", "#305SKY #PrePurchaseInspection #AircraftForSale #PrivateJet #BusinessAviation", "Dark"),
fb("2026-10-27", "FB · Buying an aircraft?", f"""
Thinking about buying an aircraft? ✈️

A pre-buy inspection is the best money you'll spend before closing. We review the logbooks and the aircraft itself, then give you a clear written report.

Questions? Call us at {PH}, and an owner will pick up.""", ["2026-10-27_IG11_1.jpg"], "The nose of a Challenger jet on the ramp."),
ig("2026-10-28", 12, "Carousel", slides("2026-10-28_IG12", 7), "Ivory card reading: 5 questions before you buy.", """
Five questions every buyer should ask, and every seller should be ready for.

Save this for your next acquisition.""", "#305SKY #AircraftBuyer #PrePurchaseInspection #AircraftOwner #BusinessAviation", "Ivory"),
li("2026-10-28", "LI · Owner personal · Pre-buy", """
A pre-buy inspection has one client: the buyer.

It sounds obvious, but it's easy to forget when a deal has momentum and everyone wants to close. Our job is to give the buyer the full picture, including the parts nobody wants to hear, in a report a broker, lender and insurer can all use.

The best compliment we get after a pre-buy isn't “thanks for the clean report.” It's “thanks for telling me what I needed to know.”"""),
fb("2026-10-28", "FB · Cabin details album", """
Cabin goals. 🤎

A few of the interiors that have passed through our hangars: hand-stitched leather, quilted panels and every detail finished. Which one is your favorite: 1, 2 or 3?""", slides("2026-10-28_FB-album", 3), "Cognac leather seats in a business aircraft cabin."),
ig("2026-10-29", 13, "Carousel", slides("2026-10-29_IG13", 4), "A cognac leather seat beside round cabin windows.", """
Leather, stitching, light. The cabin is where owners and passengers live during a flight, and it should feel like yours.

From seats and panels to a full refurbishment, our team handles interior work with the same care we give the engines.""", "#305SKY #AircraftInterior #PrivateJetInterior #Craftsmanship #BusinessAviation", "Dark"),
li("2026-10-29", "LI · Company · Boat show welcome", f"""
Welcome to Fort Lauderdale, boat show visitors.

The Fort Lauderdale International Boat Show runs Oct 28–Nov 1, and a lot of you are flying in. If your aircraft needs anything while it's here, from a squawk to an AOG, our team is at FLL and FXE and responds within 30 miles.

One call: {PH}""", ["2026-10-29_LI-FB-boatshow.jpg"], "A King Air on the ramp at sunset.", "#FLIBS #FortLauderdale #BusinessAviation"),
fb("2026-10-30", "FB · Boat show weekend", f"""
Flying in for the boat show this weekend? 🚤✈️

Enjoy the show, and if your aircraft needs anything while you're here, 305 SKY is at FLL and FXE with AOG support within 30 miles. Save the number: {PH}""", ["2026-10-29_LI-FB-boatshow.jpg"], "A King Air on the ramp at sunset."),
ig("2026-10-31", 14, "Single", ["2026-10-31_IG14.jpg"], "Ivory card with the number 55+ and the words: years of family experience in aviation.", """
Our company is young. Our experience isn't.

More than 55 years of aviation runs through our family, and it shows in every inspection, every repair and every phone call we answer.""", "#305SKY #AviationFamily #FamilyBusiness #BusinessAviation #FortLauderdale", "Ivory"),
# ---------------- Week 4 ----------------
li("2026-11-02", "LI · Company · Vero Beach", f"""
Not every maintenance hangar can take a large-cabin jet. Ours can.

Our Vero Beach hangar has more than 12,000 sq ft of floor space. Mid-size and heavy jets (Falcon, Gulfstream, Global, Challenger) are worked on inside, out of the Florida sun, summer storms and salt air.

Away from South Florida's busiest airports, your jet gets the room it needs and a team that isn't rushing to the next tail. Full-service aircraft management is under the same roof.

To schedule hangar time, call {PH}.""", ["2026-11-02_LI.jpg"], "The 305 SKY sign over the Vero Beach hangar door.", "#BusinessAviation #Gulfstream #VeroBeach"),
ig("2026-11-03", 15, "Carousel", slides("2026-11-03_IG15", 3), "The 305 SKY sign above the open door of the Vero Beach hangar.", """
Large-cabin jets deserve a large hangar.

In Vero Beach, mid-size and heavy jets are worked on inside our 12,000+ sq ft hangar: out of the sun, the storms and the salt air, with room to do the job properly.""", "#305SKY #VeroBeach #Gulfstream #Falcon #BusinessAviation", "Dark"),
fb("2026-11-03", "FB · Vero Beach album", """
Welcome to our Vero Beach hangar! 🌴

More than 12,000 sq ft, with room for jets up to the Global Express inside. If you're on the Treasure Coast, come see us.""", slides("2026-11-03_FB-album", 2), "The 305 SKY Vero Beach hangar."),
ig("2026-11-04", 16, "Single", ["2026-11-04_IG16.jpg"], "Ivory card reading: Four locations. One standard. FLL, FXE, BCT, VRB.", """
Four airports along Florida's east coast. The same team, the same records, the same standard.

FLL, FXE and Boca Raton: light to mid-size jets and turboprops. Vero Beach: mid-size to heavy jets. AOG support within 30 miles of each.""", "#305SKY #FortLauderdale #BocaRaton #VeroBeach #BusinessAviation", "Ivory"),
li("2026-11-04", "LI · Owner personal · Hiring", """
What I look for in a technician isn't on the resume.

Certificates and type experience matter. But the people who thrive at 305 SKY share something else: they treat every aircraft like it belongs to someone they know, because at a family business, it usually does.

We're growing across FLL, FXE, Boca Raton and Vero Beach, and we're looking for A&P mechanics who want that kind of shop.

Message me directly. You'll reach an owner, not a portal.""", ["2026-10-14_FB.jpg"], "The 305 SKY crew in the hangar."),
fb("2026-11-04", "FB · Garmin panel", """
Is your panel ready for the next 20 years? 🛩️

Our Boca Raton team plans and installs Garmin avionics upgrades: glass displays, navigators, autopilots and ADS-B. Every job comes with a written quote first and complete paperwork after.""", ["2026-11-04_FB.jpg"], "A King Air cockpit with a Garmin G1000 NXi glass panel."),
ig("2026-11-05", 17, "Carousel", slides("2026-11-05_IG17", 4), "A King Air cockpit with Garmin glass displays.", """
A panel upgrade is one of the biggest decisions an owner makes.

We start with a plan and a written quote, install it properly, and finish with complete paperwork. Thinking about it? Let's talk before you buy anything.""", "#305SKY #Garmin #Avionics #G1000 #KingAir", "Dark"),
li("2026-11-05", "LI · Company · Hiring A&P [CONFIRM email]", f"""
We're hiring A&P mechanics.

305 SKY is a third-generation aviation family with 15 people across Fort Lauderdale (FLL, FXE), Boca Raton and Vero Beach. We work on Citations, Challengers, Falcons, Learjets, King Airs, Beechjets, Gulfstreams, Globals and Hawkers.

What you'll find here:
• Turboprops through large-cabin jets
• A team that knows your name and an owner who answers the phone
• Room to grow with a company that's growing

Send your resume or questions to [CONFIRM email], or call {PH}.""", ["2026-11-05_LI-hiring.jpg"], "A 305 SKY technician working on an aircraft engine.", "#AviationJobs #AandP #AircraftMaintenance"),
fb("2026-11-06", "FB · We're hiring", f"""
We're hiring! 🛠️

305 SKY is looking for A&P mechanics in Fort Lauderdale and Vero Beach. Know someone great? Tag them below, or have them call {PH}.""", ["2026-11-06_FB-hiring.jpg"], "The 305 SKY crew; text: Join the crew."),
ig("2026-11-07", 18, "Single", ["2026-11-07_IG18.jpg"], "Ivory card reading: Now hiring A&P mechanics. Join the crew.", f"""
We're growing, and we're looking for A&P mechanics who take pride in the details.

Turboprops to large-cabin jets. Four airports. A family that answers the phone. DM us or call {PH}.""", "#305SKY #AviationJobs #AandP #AircraftMechanic #NowHiring", "Ivory"),
]

# Covers shown in the preview for videos and PDFs
PREVIEW = {"2026-10-14_IG03_reel.mp4": "2026-10-14_IG03_cover.jpg", "2026-10-20_IG07_reel.mp4": "2026-10-20_IG07_cover.jpg",
           "2026-10-15_LI-doc.pdf": "2026-10-15_IG04_1.jpg", "2026-10-22_LI-doc.pdf": "2026-10-24_IG10_1.jpg",
           "2026-10-26_LI-doc.pdf": "2026-10-26_LI-doc_1.jpg"}
PDFS = {"2026-10-15_LI-doc.pdf": slides("2026-10-15_IG04", 6), "2026-10-22_LI-doc.pdf": slides("2026-10-24_IG10", 8),
        "2026-10-26_LI-doc.pdf": slides("2026-10-26_LI-doc", 8)}
