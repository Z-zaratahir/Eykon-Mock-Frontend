# Eykon — Mobile Frontend (FYP Defense Prototype)

A fully-designed, no-backend mock of the Eykon mobile app — the phone-side
companion to the offline-first AI glasses described in the FYP proposal.
Every screen runs on dummy data (`data/mockData.js`) so it can be demoed
live without any model, camera pipeline, or server running.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for a
simulator. No backend, API key, or model download needed — it's a pure
frontend demo.

## What's in it

- **Chat** (`app/(tabs)/index.js`) — the main assistant conversation.
  Ask "Where did I leave my keys?" or tap a suggested prompt; replies show
  retrieval provenance (latency, Hit@1, which stored memory answered it)
  the same way the real hybrid dense+BM25+RRF pipeline would. Tap a source
  chip to jump to that memory's full record. The mic button simulates a
  voice query.

- **Echoes** (`app/(tabs)/echoes.js`) — the time-based memory gallery.
  Since most memories aren't video, each day groups "moment cards" by
  type (text/OCR, object, person, scene) with the extracted text, location,
  and capture source (glasses vs. phone) shown inline. Filterable and
  searchable.

- **Capture** (`app/(tabs)/capture.js` → `app/capture.js`) — manual capture
  when you're not wearing the glasses. Real camera preview via
  `expo-camera`, with snapshot / video / voice-note modes, a recording
  timer, and an animated waveform for voice.

- **Glasses** (`app/(tabs)/glasses.js`) — the paired-device dashboard:
  battery, on-device storage, thermal state, capture mode
  (continuous/standby/off), the resource-adaptive toggle, and a pipeline
  health strip (Capture → YOLO → Extract → Store).

- **Profile** (`app/(tabs)/profile.js`) — privacy controls mirroring the
  proposal's privacy-by-design section (local-first storage, auto-redact
  sensitive content, people-memory off by default) and the
  English/Urdu/code-switched language picker.

- **Memory detail** (`app/memory/[id].js`) — the full record behind any
  card: OCR text, embedding space, retrieval index type, eviction status.

## Design notes

Palette and terminology are pulled directly from the proposal defense deck
(slate `#3A506B`, amber `#FF9F1C`, navy `#0B132B`) and from the real Eykon
retrieval prototype's reported numbers (93.3% Hit@5, 100% Hit@1, ~45ms
latency) — those appear as live-looking stats in the UI so the mock reads
as "our system," not a generic assistant app.

## Editing the demo data

Everything shown lives in `data/mockData.js` — memory events, chat
history, device state, and the retrieval stats banner. Edit that file to
tailor the walkthrough to whatever scenario you want to run in the
defense (e.g. swap in your own whiteboard-password example).

## Structure

```
app/
  _layout.js          root stack (onboarding → tabs → modals)
  onboarding.js        opening screen, sets up the whiteboard scenario
  capture.js            full-screen camera modal
  memory/[id].js         memory detail screen
  (tabs)/
    _layout.js         custom floating tab bar
    index.js            Chat
    echoes.js            Echoes (memory gallery)
    capture.js            Capture landing
    glasses.js             Glasses dashboard
    profile.js               Profile / privacy
components/            shared UI primitives + TabBar
constants/theme.js      design tokens (color, type, spacing)
data/mockData.js        all dummy data — edit this to change the demo
```
