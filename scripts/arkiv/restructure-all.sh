#!/bin/bash
set -e

TOKEN="skuEeX9be2JX54jtcs6829lcK1i7Aw1YfV1heTz2XBRyuMsqeW2EzDOnmBavRwRJ4HdcIkNd14cCJTX985CVGDAoq2y98fJRsQPYr73G7VgsLICb0CYgpnFThlwRhKeJ7GLs2CyUIV9obJpcIBe7rx0KAf5j5NUx2q2ND3abLNnyoH1D7lk6"
API="https://tqfezovu.api.sanity.io/v2024-01-01/data/mutate/production"

# Helper to generate a mutation payload via Python (handles SSL through curl)
build_and_patch() {
  local ARTICLE_ID=$1
  local SCRIPT=$2
  local LABEL=$3

  echo ""
  echo "=== ${LABEL} ==="

  # Build new sections JSON with Python (no network needed)
  NEW_SECTIONS=$(python3 -c "$SCRIPT")

  # Patch via curl
  PAYLOAD=$(python3 -c "
import json, sys
sections = json.loads(sys.argv[1])
print(json.dumps({'mutations': [{'patch': {'id': '${ARTICLE_ID}', 'set': {'sections': sections}}}]}))
" "$NEW_SECTIONS")

  RESULT=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$PAYLOAD")

  echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print('OK' if 'results' in r else r.get('error', r))"
}

###############################################################
# FORSVARSRUNDEN
###############################################################
FORSVARSRUNDEN_SCRIPT='
import json, uuid

def key():
    return uuid.uuid4().hex[:12]

def block(text):
    return {
        "_type": "block", "_key": key(), "style": "normal", "markDefs": [],
        "children": [{"_type": "span", "_key": key(), "text": text, "marks": []}]
    }

def img(ref, alt=""):
    return {"_type": "image", "asset": {"_type": "reference", "_ref": ref}, "alt": alt}

old = json.load(open("/tmp/forsvarsrunden_sections.json"))["result"]["sections"]
hero = old[0]
intro = old[1]
parallax = old[6]

new = [
    hero,
    intro,
    # CountUpFact
    {"_type": "countUpFact", "_key": key(), "number": 5.6, "suffix": "km", "label": "langs Forsvarsrunden", "backgroundColor": "#003865"},
    # Stop 1 — Festningen
    {"_type": "numberedStop", "_key": key(), "stopNumber": 1, "title": "Kristiansten festning",
     "image": img("image-351f91101d4b57d63167cbff17bd70e297339207-5213x3142-jpg", "Kristiansten festning"),
     "text": [
         block("Turen starter ved Festningen. Selv på en grå dag er det godt med folk i området, et tydelig tegn på hvor populært dette stedet er."),
         block("Her er det lett å bli værende, med utsikt, historie, museum og mulighet for en kaffepause. På finværsdager er det helt ypperlig for piknik."),
     ], "backgroundColor": "#003865"},
    # Stop 2 — Kiosken
    {"_type": "numberedStop", "_key": key(), "stopNumber": 2, "title": "Kiosken på Kuhaugen",
     "image": img("image-f4c2a727c4b185ad7a4964a588afbe748d22721d-4614x2389-jpg", "Den fredede utkikkskiosken på Kuhaugen"),
     "text": [
         block("Etter å ha gått rundt Festningen vandrer jeg forbi Kasernen, den tidligere befalsskolen. I dag er det en kristen friskole, og bygget er et arkitektonisk høydepunkt."),
         block("Etter en rolig etappe gjennom Rosenborg går det oppover til utkikkskiosken på Kuhaugen. Den lille bygningen stammer fra den kalde krigen, da den ble brukt til å følge med på byen. I dag er den fredet."),
     ], "backgroundColor": "#003865"},
    # Stop 3 — Persaunet
    {"_type": "numberedStop", "_key": key(), "stopNumber": 3, "title": "Persaunet leir",
     "image": img("image-c50ce411ce7e708dbb2d5bb906c407d0f9812f1c-4224x2955-jpg", "Kasernen ved Persaunet"),
     "text": [
         block("På andre siden av Kuhaugen kommer jeg til Persaunet, et område som ser ut som et helt vanlig boligfelt. Men her skjuler det seg historie."),
         block("Leiren ble bygget av tyskerne under krigen for ubåtmannskapene i Trondheim. Etter krigen tok det norske forsvaret over, og området var i bruk helt til 2000-tallet."),
         block("På Kuhaugen ligger også Luftkrigsskolen. Og hvorfor heter det Kuhaugen? Rett og slett fordi området ble brukt til beite for kyr ved Rønningen Gård."),
     ], "backgroundColor": "#003865"},
    # InteractiveQuiz — didYouKnow
    {"_type": "interactiveQuiz", "_key": key(), "style": "didYouKnow",
     "question": "Hva ble Persaunet-leiren opprinnelig bygget for?",
     "answer": "Leiren ble bygget av tyskerne under andre verdenskrig som brakker for ubåtmannskapene stasjonert i Trondheim. Etter krigen tok det norske forsvaret over, og området var i militær bruk helt til 2000-tallet.",
     "backgroundColor": "#003865"},
    parallax,
    # Stop 4 — Utsikten
    {"_type": "numberedStop", "_key": key(), "stopNumber": 4, "title": "Utsikten",
     "image": img("image-1aa6977f63a82eaaa753b015da26bc4ee5223717-5208x2889-jpg", "Utsikten fra toppen over Trondheim"),
     "text": [
         block("Jeg tar den siste bakken opp til Utsikten, og det er det verdt. Herfra åpner byen seg skikkelig, med blikk ned mot ubåtbunkerne Dora og ut over fjorden."),
         block("Det er rart å tenke på at dette en gang var en del av tyskernes luftforsvar. Noen murer står fortsatt igjen, men i dag er det først og fremst et sted å stoppe litt opp og nyte utsikten."),
         block("Langs ruta står seks informasjonstavler. Sjekk gjerne QR-kodene for mer info, og ta turen! Belønningen på toppen er en utsikt du virkelig kan nyte, selv på en gråværsdag."),
     ], "backgroundColor": "#003865"},
]

print(json.dumps(new))
'

build_and_patch "Y9kYytWkpKkSNwzcgTnq0k" "$FORSVARSRUNDEN_SCRIPT" "FORSVARSRUNDEN"

###############################################################
# ALMA MATER
###############################################################
ALMA_SCRIPT='
import json, uuid

def key():
    return uuid.uuid4().hex[:12]

def block(text):
    return {
        "_type": "block", "_key": key(), "style": "normal", "markDefs": [],
        "children": [{"_type": "span", "_key": key(), "text": text, "marks": []}]
    }

def img(ref, alt=""):
    return {"_type": "image", "asset": {"_type": "reference", "_ref": ref}, "alt": alt}

old = json.load(open("/tmp/alma_sections.json"))["result"]["sections"]

# Keep 0-7, replace 8 (last textWithImage) with StickyPortrait + RecipeCard, keep 9 (gallery)
sticky = {
    "_type": "stickyPortrait", "_key": key(),
    "image": {**img("image-608c50a02be6cf238d3b4b0edb610ebbf96a69bb-3150x4724-jpg", "Richard bak disken på Alma Mater")},
    "imagePosition": "left",
    "text": [
        block("I dag bruker han erfaringene sine nettopp her, bak disken på Alma Mater."),
        block("\u2013 Jeg prøver å ta med meg det beste fra Frankrike, med gode råvarer fra små produsenter."),
        block("Han skjærer ost, anbefaler vin og tar seg tid til en prat med kundene."),
        block("\u2013 Nordmenn er høflige og behagelige folk. Jeg setter stor pris på alle som kommer innom."),
        block("Bak disken på Alma Mater handler det fortsatt om det samme \u2013 gode råvarer, en prat og små smaker av Frankrike, midt i Trondheim."),
    ],
    "backgroundColor": "#003865",
}

recipe = {
    "_type": "recipeCard", "_key": key(),
    "title": "Richards sandwich",
    "subtitle": "Smaken av Alma Mater",
    "image": img("image-e60965167cb5c8dfd353c1d2a2ca158a2538a547-4724x3150-jpg", "Delikatesser fra Alma Mater"),
    "ingredients": [
        "God baguette",
        "Parmaskinke",
        "Comté-ost (lagret 24 mnd)",
        "Bordiersmør",
        "Olivenolje",
        "Ruccola",
        "Solttørkede tomater i olje",
    ],
    "instructions": "Som den berømte kokken Joël Robuchon sa: «Gode ingredienser er selvfølgelig viktige, men det viktigste er at det smaker likt fra begynnelse til slutt!»",
    "backgroundColor": "#003865",
}

new = old[:8] + [sticky, recipe] + old[9:]
print(json.dumps(new))
'

build_and_patch "Y9kYytWkpKkSNwzcgTnQly" "$ALMA_SCRIPT" "ALMA MATER"

###############################################################
# KJEPPHEST
###############################################################
KJEPPHEST_SCRIPT='
import json, uuid

def key():
    return uuid.uuid4().hex[:12]

old = json.load(open("/tmp/kjepphest_sections.json"))["result"]["sections"]

strip = {
    "_type": "horizontalImageStrip", "_key": key(),
    "title": "Stallen",
    "images": [],
    "backgroundColor": "#003865",
}

quiz = {
    "_type": "interactiveQuiz", "_key": key(),
    "style": "poll",
    "question": "Har du hørt om kjepphest som sport?",
    "options": [
        {"_type": "object", "_key": key(), "text": "Ja, og jeg har prøvd det!", "pollPercent": 8},
        {"_type": "object", "_key": key(), "text": "Ja, men aldri prøvd", "pollPercent": 35},
        {"_type": "object", "_key": key(), "text": "Nei, dette var nytt for meg", "pollPercent": 42},
        {"_type": "object", "_key": key(), "text": "Har sett det på TikTok", "pollPercent": 15},
    ],
    "answer": "Kjepphest har vokst enormt de siste årene, særlig i Finland og Skandinavia. Det er en anerkjent sport med egne konkurranser, teknikker og regler.",
    "backgroundColor": "#003865",
}

# Insert strip after pullQuote(2), quiz before factBox(5)
new = old[:3] + [strip] + old[3:5] + [quiz] + old[5:]
print(json.dumps(new))
'

build_and_patch "hk5UyxH53cXmNDh0VNHPgd" "$KJEPPHEST_SCRIPT" "KJEPPHEST"

echo ""
echo "=== ALL DONE ==="
echo "Next: upload kjepphest images for horizontal strip"
