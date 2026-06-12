#!/usr/bin/env python3
"""
Restructure scrollytelling articles with new section types.
Reads current sections, keeps what works, inserts new sections.
"""
import json
import urllib.request
import uuid

PROJECT = "tqfezovu"
DATASET = "production"
API_VERSION = "2024-01-01"
TOKEN = "skuEeX9be2JX54jtcs6829lcK1i7Aw1YfV1heTz2XBRyuMsqeW2EzDOnmBavRwRJ4HdcIkNd14cCJTX985CVGDAoq2y98fJRsQPYr73G7VgsLICb0CYgpnFThlwRhKeJ7GLs2CyUIV9obJpcIBe7rx0KAf5j5NUx2q2ND3abLNnyoH1D7lk6"

BASE_URL = f"https://{PROJECT}.api.sanity.io/v{API_VERSION}"


def key():
    return uuid.uuid4().hex[:12]


def block(text, style="normal"):
    return {
        "_type": "block",
        "_key": key(),
        "style": style,
        "markDefs": [],
        "children": [{"_type": "span", "_key": key(), "text": text, "marks": []}],
    }


def image_ref(asset_id):
    return {"_type": "image", "asset": {"_type": "reference", "_ref": asset_id}}


def query(groq):
    import urllib.parse

    url = f"{BASE_URL}/data/query/{DATASET}?query={urllib.parse.quote(groq)}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["result"]


def mutate(mutations):
    url = f"{BASE_URL}/data/mutate/{DATASET}"
    data = json.dumps({"mutations": mutations}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        if "error" in result:
            print(f"  ERROR: {result['error']}")
        else:
            print(f"  OK — {len(result.get('results', []))} mutations applied")
        return result


# =============================================================
# FORSVARSRUNDEN — restructure with NumberedStop + CountUpFact
# =============================================================
def restructure_forsvarsrunden():
    print("\n=== FORSVARSRUNDEN ===")
    article_id = "Y9kYytWkpKkSNwzcgTnq0k"

    # Get current full sections
    data = query(
        f'*[_id == "{article_id}"][0]{{ sections }}'
    )
    old_sections = data["sections"]

    # Keep: hero (idx 0), intro textWithImage (idx 1)
    hero = old_sections[0]
    intro = old_sections[1]
    # Keep: fullscreenParallax (idx 6)
    parallax = old_sections[6]

    # New sections
    count_up = {
        "_type": "countUpFact",
        "_key": key(),
        "number": 5.6,
        "suffix": "km",
        "label": "langs Forsvarsrunden",
        "backgroundColor": "#003865",
    }

    stop1 = {
        "_type": "numberedStop",
        "_key": key(),
        "stopNumber": 1,
        "title": "Kristiansten festning",
        "image": {
            **image_ref("image-351f91101d4b57d63167cbff17bd70e297339207-5213x3142-jpg"),
            "alt": "Kristiansten festning sett fra siden",
        },
        "text": [
            block("Turen starter ved Festningen. Selv på en grå dag er det godt med folk i området, et tydelig tegn på hvor populært dette stedet er."),
            block("Her er det lett å bli værende, med utsikt, historie, museum og mulighet for en kaffepause. Samtidig er det et fint område å rusle i, både for små og store. På finværsdager er det helt ypperlig for piknik."),
        ],
        "backgroundColor": "#003865",
    }

    stop2 = {
        "_type": "numberedStop",
        "_key": key(),
        "stopNumber": 2,
        "title": "Kiosken på Kuhaugen",
        "image": {
            **image_ref("image-f4c2a727c4b185ad7a4964a588afbe748d22721d-4614x2389-jpg"),
            "alt": "Den fredede utkikkskiosken på Kuhaugen",
        },
        "text": [
            block("Etter å ha gått rundt Festningen, vandrer jeg forbi Tomasskolen, den tidligere befalsskolen, bedre kjent som Kasernen. I dag er det en kristen friskole, og bygget er et arkitektonisk høydepunkt med fine detaljer."),
            block("Etter en rolig etappe gjennom Rosenborg går det oppover til utkikkskiosken på Kuhaugen. Den lille bygningen full av tagging stammer fra den kalde krigen, da den ble brukt til å følge med på byen. I dag er den fredet, og står igjen som et lite stykke beredskapshistorie langs ruta."),
        ],
        "backgroundColor": "#003865",
    }

    stop3 = {
        "_type": "numberedStop",
        "_key": key(),
        "stopNumber": 3,
        "title": "Persaunet leir",
        "image": {
            **image_ref("image-c50ce411ce7e708dbb2d5bb906c407d0f9812f1c-4224x2955-jpg"),
            "alt": "Kasernen ved Persaunet",
        },
        "text": [
            block("På andre siden av Kuhaugen kommer jeg til Persaunet, et område som ser ut som et helt vanlig boligfelt. Men her skjuler det seg historie."),
            block("Leiren ble bygget av tyskerne under krigen for ubåtmannskapene i Trondheim. Etter krigen tok det norske forsvaret over, og området var i bruk helt til 2000-tallet. I dag er mange av bygningene fredet, og står igjen som et litt uventet krigsminne langs turen."),
            block("På Kuhaugen ligger også Luftkrigsskolen, som utdanner offiserer og spesialistbefal til Luftforsvaret og Forsvaret. Og hvorfor heter det Kuhaugen? Rett og slett fordi dette området ble brukt til beite for kyr ved Rønningen Gård."),
        ],
        "backgroundColor": "#003865",
    }

    quiz = {
        "_type": "interactiveQuiz",
        "_key": key(),
        "style": "didYouKnow",
        "question": "Hva ble Persaunet-leiren opprinnelig bygget for?",
        "answer": "Leiren ble bygget av tyskerne under andre verdenskrig som brakker for ubåtmannskapene stasjonert i Trondheim. Etter krigen tok det norske forsvaret over, og området var i militær bruk helt til 2000-tallet.",
        "backgroundColor": "#003865",
    }

    stop4 = {
        "_type": "numberedStop",
        "_key": key(),
        "stopNumber": 4,
        "title": "Utsikten",
        "image": {
            **image_ref("image-1aa6977f63a82eaaa753b015da26bc4ee5223717-5208x2889-jpg"),
            "alt": "Utsikten fra toppen av Kuhaugen over Trondheim",
        },
        "text": [
            block("Jeg tar den siste bakken opp til Utsikten, og det er det verdt. Herfra åpner byen seg skikkelig, med blikk ned mot ubåtbunkerne Dora og ut over fjorden."),
            block("Det er rart å tenke på at dette en gang var en del av tyskernes luftforsvar, med både luftskyts og søkelys. Noen murer står fortsatt igjen, men i dag er det først og fremst et sted å stoppe litt opp og bare nyte utsikten."),
            block("Langs ruta står seks informasjonstavler, selv om flere dessverre er i dårlig stand. Sjekk gjerne QR-kodene for mer info, og ta turen! Det er en flott runde, og belønningen på toppen av Trondheim er en utsikt du virkelig kan nyte, selv på en gråværsdag."),
        ],
        "backgroundColor": "#003865",
    }

    new_sections = [
        hero,
        intro,
        count_up,
        stop1,
        stop2,
        stop3,
        quiz,
        parallax,
        stop4,
    ]

    print(f"  Old: {len(old_sections)} sections → New: {len(new_sections)} sections")
    print(f"  Types: {' → '.join(s['_type'] for s in new_sections)}")

    mutate([{"patch": {"id": article_id, "set": {"sections": new_sections}}}])


# =============================================================
# ALMA MATER — add StickyPortrait + RecipeCard
# =============================================================
def restructure_alma_mater():
    print("\n=== ALMA MATER (Fransk finesse bak disken) ===")
    article_id = "Y9kYytWkpKkSNwzcgTnQly"

    data = query(f'*[_id == "{article_id}"][0]{{ sections }}')
    old_sections = data["sections"]

    # Keep sections 0-7 (hero through textWithImage about Tilbake)
    # Replace section 8 (last textWithImage with recipe) with StickyPortrait + RecipeCard
    # Keep section 9 (gallery)

    # Use the portrait image from first textWithImage (Richard behind counter)
    portrait_ref = "image-608c50a02be6cf238d3b4b0edb610ebbf96a69bb-3150x4724-jpg"

    sticky_portrait = {
        "_type": "stickyPortrait",
        "_key": key(),
        "image": {
            **image_ref(portrait_ref),
            "alt": "Richard bak disken på Alma Mater",
        },
        "imagePosition": "left",
        "text": [
            block("I dag bruker han erfaringene sine nettopp her, bak disken på Alma Mater."),
            block("– Jeg prøver å ta med meg det beste fra Frankrike, med gode råvarer fra små produsenter."),
            block("Han skjærer ost, anbefaler vin og tar seg tid til en prat med kundene."),
            block("– Nordmenn er høflige og behagelige folk. Jeg setter stor pris på alle som kommer innom."),
            block("Bak disken på Alma Mater handler det fortsatt om det samme, med gode råvarer, en prat og små smaker av Frankrike, midt i Trondheim."),
        ],
        "backgroundColor": "#003865",
    }

    recipe_card = {
        "_type": "recipeCard",
        "_key": key(),
        "title": "Richards sandwich",
        "subtitle": "Smaken av Alma Mater",
        "image": {
            **image_ref("image-e60965167cb5c8dfd353c1d2a2ca158a2538a547-4724x3150-jpg"),
            "alt": "Delikatesser fra Alma Mater",
        },
        "ingredients": [
            "God baguette",
            "Parmaskinke",
            "Comté-ost (lagret 24 mnd)",
            "Bordiersmør (verdens beste smør)",
            "Olivenolje",
            "Ruccola",
            "Et hint av solttørkede tomater i olje",
        ],
        "instructions": "Som den berømte kokken Joël Robuchon sa da han ble spurt: «Hva er den beste sandwichen for deg?» «Gode ingredienser er selvfølgelig viktige, men det viktigste er at det smaker likt fra begynnelse til slutt!»",
        "backgroundColor": "#003865",
    }

    # Build new sections: keep 0-7, replace 8 with sticky+recipe, keep 9
    new_sections = old_sections[:8] + [sticky_portrait, recipe_card] + old_sections[9:]

    print(f"  Old: {len(old_sections)} sections → New: {len(new_sections)} sections")
    print(f"  Types: {' → '.join(s['_type'] for s in new_sections)}")

    mutate([{"patch": {"id": article_id, "set": {"sections": new_sections}}}])


# =============================================================
# KJEPPHEST — add HorizontalImageStrip + InteractiveQuiz
# =============================================================
def restructure_kjepphest():
    print("\n=== KJEPPHEST ===")
    article_id = "hk5UyxH53cXmNDh0VNHPgd"

    data = query(f'*[_id == "{article_id}"][0]{{ sections }}')
    old_sections = data["sections"]

    # Current: hero(0) → text(1) → pullQuote(2) → text(3) → parallax(4) → factBox(5) → text(6) → pullQuote(7) → gallery(8)
    # New:     hero(0) → text(1) → pullQuote(2) → STRIP → text(3) → parallax(4) → QUIZ → factBox(5) → text(6) → pullQuote(7) → gallery(8)
    # Insert HorizontalImageStrip after pullQuote about the horses
    # Insert InteractiveQuiz before factBox

    # Need to upload some kjepphest images for the strip
    # We'll use images already in Sanity from the article + upload a few more
    # For now, use the images that are already uploaded in the article sections

    # Get the image refs already used
    existing_images = []
    for s in old_sections:
        if s.get("_type") == "textWithImage":
            img = s.get("image", {})
            if img and img.get("asset"):
                existing_images.append(img["asset"]["_ref"])
        elif s.get("_type") == "fullscreenParallax":
            img = s.get("backgroundImage", {})
            if img and img.get("asset"):
                existing_images.append(img["asset"]["_ref"])
        elif s.get("_type") == "gallery":
            for img in s.get("images", []):
                if img.get("asset"):
                    existing_images.append(img["asset"]["_ref"])

    print(f"  Found {len(existing_images)} existing image refs")

    # For horizontal strip, we need images that aren't already heavily used
    # We'll upload 5 new kjepphest images for the strip
    # This will be done separately — for now mark as placeholder

    horizontal_strip = {
        "_type": "horizontalImageStrip",
        "_key": key(),
        "title": "Stallen",
        "images": [],  # Will be filled after upload
        "backgroundColor": "#003865",
    }

    quiz = {
        "_type": "interactiveQuiz",
        "_key": key(),
        "style": "poll",
        "question": "Har du hørt om kjepphest som sport?",
        "options": [
            {"_type": "object", "_key": key(), "text": "Ja, og jeg har prøvd det!", "pollPercent": 8},
            {"_type": "object", "_key": key(), "text": "Ja, men aldri prøvd", "pollPercent": 35},
            {"_type": "object", "_key": key(), "text": "Nei, dette var nytt for meg", "pollPercent": 42},
            {"_type": "object", "_key": key(), "text": "Har sett det på TikTok", "pollPercent": 15},
        ],
        "answer": "Kjepphest har vokst enormt de siste årene, særlig i Finland og Skandinavia. Det er en anerkjent sport med egne konkurranser, teknikker og regler — og tusenvis av utøvere.",
        "backgroundColor": "#003865",
    }

    # Insert strip after pullQuote (idx 2), quiz before factBox (idx 5)
    new_sections = (
        old_sections[:3]           # hero, text, pullQuote
        + [horizontal_strip]       # NEW: horse strip
        + old_sections[3:5]        # text, parallax
        + [quiz]                   # NEW: poll quiz
        + old_sections[5:]         # factBox, text, pullQuote, gallery
    )

    print(f"  Old: {len(old_sections)} sections → New: {len(new_sections)} sections")
    print(f"  Types: {' → '.join(s['_type'] for s in new_sections)}")

    mutate([{"patch": {"id": article_id, "set": {"sections": new_sections}}}])

    return article_id, horizontal_strip["_key"]


# Run all three
restructure_forsvarsrunden()
restructure_alma_mater()
kjepphest_id, strip_key = restructure_kjepphest()
print(f"\n--- Kjepphest strip _key for image upload: {strip_key} ---")
print(f"--- Kjepphest article ID: {kjepphest_id} ---")
print("\nDone! Next: upload kjepphest images for the horizontal strip.")
