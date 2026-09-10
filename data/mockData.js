// Dummy in-memory data for the FYP defense demo.
// Modeled directly on the scenarios in the project spec (whiteboard password,
// lost keys, lecture notes, receipts) and on real backend terms from the
// Eykon retrieval prototype (Hit@5, hybrid search, RRF fusion, match badges).

export const EVENT_TYPES = {
  TEXT: "text",       // OCR-heavy: whiteboards, screens, signs
  OBJECT: "object",   // object placement: keys, wallet, tools
  SCENE: "scene",     // general VLM scene description
  AUDIO: "audio",     // captured speech / ambient audio
  PERSON: "person",   // a person encountered (name + context)
};

export const MATCH_TYPES = {
  EXACT: { key: "exact", label: "Exact", color: "matchExact" },
  SEMANTIC: { key: "semantic", label: "Semantic", color: "matchSemantic" },
  BM25: { key: "bm25", label: "Keyword", color: "matchBM25" },
};

// A day-grouped stream of "memory events" — this is the data the on-device
// event segmentation + embedding pipeline would have produced.
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
    thumbnailColor: "#3A506B",
    icon: "grid-outline",
    pinned: true,
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
    thumbnailColor: "#26344A",
    icon: "key-outline",
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
    thumbnailColor: "#3A506B",
    icon: "school-outline",
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
    thumbnailColor: "#26344A",
    icon: "receipt-outline",
  },
  {
    id: "ev_0127",
    type: EVENT_TYPES.PERSON,
    title: "Conversation — Career fair",
    summary: "Spoke with a recruiter from Synapse AI Solutions about the ML internship track.",
    location: "FAST-NUCES Auditorium",
    source: "glasses",
    timestamp: "2026-06-10T13:15:00",
    confidence: 0.84,
    tags: ["people", "career fair"],
    thumbnailColor: "#3A506B",
    icon: "person-outline",
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
    thumbnailColor: "#26344A",
    icon: "shirt-outline",
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
    thumbnailColor: "#3A506B",
    icon: "cube-outline",
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
  hoursActive: 9.5,
  storageUsedGb: 1.1,
};

export const retrievalStats = {
  hitAt5: 93.3,
  hitAt1: 100,
  avgLatencyMs: 45,
  memoriesStored: 499,
};
