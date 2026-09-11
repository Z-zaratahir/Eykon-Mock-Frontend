// Dummy in-memory data for the FYP defense demo.
// Modeled directly on the scenarios in the project spec (whiteboard password,
// lost keys, lecture notes, receipts) and on real backend terms from the
// Eykon retrieval prototype (Hit@5, hybrid search, RRF fusion, match badges).

import { colors } from "../constants/theme";

export const EVENT_TYPES = {
  TEXT: "text",       // OCR-heavy: whiteboards, screens, signs
  OBJECT: "object",   // object placement: keys, wallet, tools
  SCENE: "scene",     // general VLM scene description
  AUDIO: "audio",     // captured speech / ambient audio
  PERSON: "person",   // a person encountered (name + context)
};

// Type-specific visual identity for Echoes (UX plan, "Memory Gallery"): every
// event type gets its own treatment so the eye groups them at a glance without
// reading each card (Gestalt: similarity). Colors route through the theme —
// nothing here is a hardcoded one-off hex.
export const TYPE_META = {
  [EVENT_TYPES.TEXT]: { label: "Text", color: colors.textPrimary, tint: colors.tealTintFaint, icon: "scan-outline" },
  [EVENT_TYPES.OBJECT]: { label: "Object", color: colors.teal, tint: colors.tealTint, icon: "cube-outline" },
  [EVENT_TYPES.SCENE]: { label: "Scene", color: colors.tealDark, tint: colors.tealTint, icon: "image-outline" },
  [EVENT_TYPES.AUDIO]: { label: "Audio", color: colors.teal, tint: colors.tealTintFaint, icon: "mic-outline" },
  [EVENT_TYPES.PERSON]: { label: "Person", color: colors.textSecondary, tint: colors.backgroundAlt, icon: "person-outline" },
};

export const MATCH_TYPES = {
  EXACT: { key: "exact", label: "Exact", color: "matchExact" },
  SEMANTIC: { key: "semantic", label: "Semantic", color: "matchSemantic" },
  BM25: { key: "bm25", label: "Keyword", color: "matchKeyword" },
};

// A day-grouped stream of "memory events" — this is the data the on-device
// event segmentation + embedding pipeline would have produced.
// mapPos is a normalized {x,y} (0-1) placement used by Echoes' Map view — an
// abstract, non-georeferenced canvas rather than a real maps SDK dependency.
export const memoryEvents = [
  {
    id: "ev_0142",
    type: EVENT_TYPES.TEXT,
    title: "Whiteboard — Marketing sync",
    summary: "Wi-Fi password written on the whiteboard during the marketing sync.",
    ocrText: "Xk9#mPq2",
    location: "Conference Room B",
    source: "glasses",
    timestamp: "2026-06-14T11:22:00",
    confidence: 0.97,
    tags: ["password", "whiteboard", "meeting"],
    icon: "grid-outline",
    mapPos: { x: 0.62, y: 0.28 },
    pinned: true,
    hidden: false,
  },
  {
    id: "ev_0139",
    type: EVENT_TYPES.OBJECT,
    title: "Keys — hallway console table",
    summary: "Keys placed on the console table by the front door.",
    location: "Home entryway",
    source: "glasses",
    timestamp: "2026-06-14T08:07:00",
    confidence: 0.91,
    tags: ["keys", "home"],
    icon: "key-outline",
    mapPos: { x: 0.22, y: 0.58 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0136",
    type: EVENT_TYPES.TEXT,
    title: "Lecture board — Thermodynamics",
    summary: "Professor wrote the entropy formula and a worked example on the board.",
    ocrText: "ΔS = Q/T  (reversible process)",
    location: "Room 214, FAST-NUCES",
    source: "glasses",
    timestamp: "2026-06-13T14:41:00",
    confidence: 0.95,
    tags: ["lecture", "thermodynamics", "formula"],
    icon: "school-outline",
    mapPos: { x: 0.74, y: 0.62 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0133",
    type: EVENT_TYPES.AUDIO,
    title: "Voice memo — Grocery list",
    summary: "Quick spoken reminder to pick up milk, eggs, and detergent on the way home.",
    transcript: "Don't forget — milk, eggs, and the blue detergent from the corner store.",
    audioDurationSec: 14,
    location: "Walking — Service Road",
    source: "phone",
    timestamp: "2026-06-12T18:44:00",
    confidence: 0.93,
    tags: ["reminder", "groceries"],
    icon: "mic-outline",
    mapPos: { x: 0.4, y: 0.42 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0131",
    type: EVENT_TYPES.OBJECT,
    title: "Receipt — Hardware store",
    summary: "Receipt for a fuse box, order #FX-8827, kept in the top drawer of the workbench.",
    ocrText: "Order #FX-8827 · Total Rs. 2,450",
    location: "Home workshop",
    source: "phone",
    timestamp: "2026-06-12T17:03:00",
    confidence: 0.89,
    tags: ["receipt", "workshop"],
    icon: "receipt-outline",
    mapPos: { x: 0.2, y: 0.6 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0127",
    type: EVENT_TYPES.PERSON,
    title: "Conversation — Career fair",
    personName: "Ayesha Raza",
    summary: "Spoke with Ayesha Raza, a recruiter from Synapse AI Solutions, about the ML internship track.",
    location: "FAST-NUCES Auditorium",
    source: "glasses",
    timestamp: "2026-06-10T13:15:00",
    confidence: 0.84,
    tags: ["people", "career fair"],
    icon: "person-outline",
    mapPos: { x: 0.78, y: 0.6 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0122",
    type: EVENT_TYPES.AUDIO,
    title: "Voice memo — Parking spot",
    summary: "Noted the level and section after parking at the mall.",
    transcript: "Parked on level 2, section C, near the pillar with the fire extinguisher.",
    audioDurationSec: 8,
    location: "Centaurus Mall — Parking",
    source: "phone",
    timestamp: "2026-06-08T19:12:00",
    confidence: 0.9,
    tags: ["parking", "reminder"],
    icon: "mic-outline",
    mapPos: { x: 0.86, y: 0.34 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0119",
    type: EVENT_TYPES.SCENE,
    title: "Jacket — display window",
    summary: "Saw a navy field jacket in the mall display window, priced at Rs. 6,900.",
    ocrText: "Rs. 6,900",
    location: "Centaurus Mall",
    source: "phone",
    timestamp: "2026-06-08T19:30:00",
    confidence: 0.88,
    tags: ["shopping"],
    icon: "shirt-outline",
    mapPos: { x: 0.85, y: 0.32 },
    pinned: false,
    hidden: false,
  },
  {
    id: "ev_0104",
    type: EVENT_TYPES.SCENE,
    title: "Fuse box — workshop shelf",
    summary: "Spare fuse box stored on the middle shelf, left side, in the workshop.",
    location: "Home workshop",
    source: "glasses",
    timestamp: "2026-06-02T10:12:00",
    confidence: 0.9,
    tags: ["workshop", "storage"],
    icon: "cube-outline",
    mapPos: { x: 0.19, y: 0.62 },
    pinned: false,
    hidden: false,
  },
];

// Chat conversation history — the canonical whiteboard-password recall demo,
// plus a couple of quick follow-ups to show multi-turn context.
export const chatMessages = [
  {
    id: "m1",
    role: "assistant",
    text: "Good evening, Zara. I logged 6 new moments today — 1 looks worth a look: the whiteboard in Conference Room B.",
    timestamp: "2026-09-10T19:02:00",
  },
  {
    id: "m2",
    role: "user",
    text: "What was that Wi-Fi password on the whiteboard?",
    timestamp: "2026-09-10T19:03:10",
  },
  {
    id: "m3",
    role: "assistant",
    text: "Xk9#mPq2 — from the marketing sync in Conference Room B, June 14th.",
    timestamp: "2026-09-10T19:03:12",
    retrieval: {
      hitAt1: true,
      latencyMs: 46,
      sources: [
        {
          eventId: "ev_0142",
          title: "Whiteboard — Marketing sync",
          match: MATCH_TYPES.EXACT,
          score: 0.98,
        },
      ],
    },
  },
  {
    id: "m4",
    role: "user",
    text: "Was that the one from last week or the one before?",
    timestamp: "2026-09-10T19:03:40",
  },
  {
    id: "m5",
    role: "assistant",
    text: "The one before — June 14th, not last week's sync. There's no whiteboard capture from last week's meeting.",
    timestamp: "2026-09-10T19:03:42",
    retrieval: {
      hitAt1: true,
      latencyMs: 52,
      sources: [
        { eventId: "ev_0142", title: "Whiteboard — Marketing sync", match: MATCH_TYPES.SEMANTIC, score: 0.91 },
      ],
    },
  },
];

export const suggestedPrompts = [
  "Where did I leave my keys?",
  "What was the price of that jacket?",
  "Who did I meet at the career fair?",
  "What did the professor write about entropy?",
];

// Past voice queries + spoken responses — Voice & Sounds' "replay any past
// voice query" list (UX plan, Section 4).
export const voiceHistory = [
  {
    id: "v1",
    query: "Where did I leave my keys?",
    response: "On the hallway console table, right by the front door.",
    timestamp: "2026-06-14T08:10:00",
    durationSec: 4,
  },
  {
    id: "v2",
    query: "What was that Wi-Fi password?",
    response: "Xk9#mPq2 — from the marketing sync in Conference Room B.",
    timestamp: "2026-06-14T11:25:00",
    durationSec: 5,
  },
  {
    id: "v3",
    query: "What did the professor write about entropy?",
    response: "Delta S equals Q over T, for a reversible process — from Thursday's lecture.",
    timestamp: "2026-06-13T14:45:00",
    durationSec: 6,
  },
];

// The daily audio digest — a spoken recap, not just a scripted demo mic
// (UX plan, Section 5: "makes listening to audio a genuine daily habit").
export const dailyDigest = {
  script:
    "Today, Eykon noticed six moments worth keeping — a Wi-Fi password on the whiteboard in Conference Room B, your keys on the hallway console table, and a grocery reminder on your way home. Nothing urgent needs your attention.",
  durationSec: 18,
  generatedAt: "2026-09-10T20:00:00",
};

// Connected device state
export const glassesDevice = {
  connected: true,
  name: "Eykon Frame — 01",
  battery: 68,
  storageUsedGb: 4.2,
  storageTotalGb: 32,
  firmware: "1.3.0",
  captureMode: "continuous", // continuous | standby | off
  temperature: "nominal", // nominal | warm | hot
  lastSync: "2 min ago",
};

export const phoneCaptureStats = {
  eventsToday: 6,
  eventsThisWeek: 9,
  hoursActive: 9.5,
  storageUsedGb: 1.1,
};

// Mutators for the per-item privacy actions on Memory Detail (Pin / Hide from
// search / Delete). This is an in-memory mock store, not a real backend — these
// mutate the shared array in place so Echoes reflects the change immediately.
export function toggleEventPinned(id) {
  const e = memoryEvents.find((x) => x.id === id);
  if (e) e.pinned = !e.pinned;
  return e;
}

export function toggleEventHidden(id) {
  const e = memoryEvents.find((x) => x.id === id);
  if (e) e.hidden = !e.hidden;
  return e;
}

export function deleteEvent(id) {
  const idx = memoryEvents.findIndex((x) => x.id === id);
  if (idx !== -1) memoryEvents.splice(idx, 1);
}

export const retrievalStats = {
  hitAt5: 93.3,
  hitAt1: 100,
  avgLatencyMs: 45,
  memoriesStored: 499,
};
