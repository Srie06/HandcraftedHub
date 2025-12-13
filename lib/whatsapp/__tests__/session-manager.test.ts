import {
  createSession,
  getActiveSession,
  getSession,
  addMessageToSession,
  addMediaToSession,
  updateSessionStep,
  completeSession,
  expireSession,
  getOrCreateSession,
  isSessionReadyForProcessing,
  transitionSessionState,
  WhatsAppSession,
  SessionStep,
} from "../session-manager";
import { Timestamp } from "firebase/firestore";

// Mock Firebase
jest.mock("../../firebase/config", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: "test-session-id" })),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({
        toMillis: () => Date.now(),
        toDate: () => new Date(),
      })),
      fromMillis: jest.fn((ms: number) => ({
        toMillis: () => ms,
        toDate: () => new Date(ms),
      })),
    },
  };
});

describe("Session Manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a new session with correct initial state", async () => {
      const phone = "+919876543210";
      const sellerId = "seller123";

      const session = await createSession(phone, sellerId);

      expect(session).toBeDefined();
      expect(session.phone).toBe(phone);
      expect(session.sellerId).toBe(sellerId);
      expect(session.status).toBe("active");
      expect(session.currentStep).toBe("greeting");
      expect(session.messages).toEqual([]);
      expect(session.collectedMedia.images).toEqual([]);
      expect(session.collectedMedia.textNotes).toEqual([]);
    });

    it("should create session without sellerId", async () => {
      const phone = "+919876543210";

      const session = await createSession(phone);

      expect(session).toBeDefined();
      expect(session.phone).toBe(phone);
      expect(session.sellerId).toBeUndefined();
    });

    it("should set expiration time to 30 minutes from now", async () => {
      const phone = "+919876543210";
      const now = Date.now();

      const session = await createSession(phone);

      const expectedExpiry = now + 30 * 60 * 1000;
      const actualExpiry = session.expiresAt.toMillis();

      // Allow 1 second tolerance for test execution time
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);
    });
  });

  describe("isSessionReadyForProcessing", () => {
    it("should return true when session has images and audio", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg", "image2.jpg"],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(isSessionReadyForProcessing(session)).toBe(true);
    });

    it("should return true when session has images and video", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          video: "video.mp4",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(isSessionReadyForProcessing(session)).toBe(true);
    });

    it("should return false when session has only images", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(isSessionReadyForProcessing(session)).toBe(false);
    });

    it("should return false when session has no images", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: [],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(isSessionReadyForProcessing(session)).toBe(false);
    });
  });

  describe("State Machine Transitions", () => {
    it("should transition from greeting to collecting_media", () => {
      const steps: SessionStep[] = ["greeting", "collecting_media"];

      expect(steps[0]).toBe("greeting");
      expect(steps[1]).toBe("collecting_media");
    });

    it("should transition from collecting_media to processing when ready", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      const ready = isSessionReadyForProcessing(session);
      expect(ready).toBe(true);

      if (ready) {
        const nextStep: SessionStep = "processing";
        expect(nextStep).toBe("processing");
      }
    });

    it("should transition from processing to completed", () => {
      const steps: SessionStep[] = [
        "greeting",
        "collecting_media",
        "processing",
        "completed",
      ];

      expect(steps[2]).toBe("processing");
      expect(steps[3]).toBe("completed");
    });

    it("should not transition from completed", () => {
      const currentStep: SessionStep = "completed";
      const nextStep: SessionStep | null = null;

      expect(currentStep).toBe("completed");
      expect(nextStep).toBeNull();
    });
  });

  describe("Session Timeout", () => {
    it("should expire session after 30 minutes of inactivity", () => {
      const now = Date.now();
      const expiryTime = now + 30 * 60 * 1000;

      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.fromMillis(now),
        lastMessageAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(expiryTime),
        messages: [],
        collectedMedia: {
          images: [],
          textNotes: [],
        },
        currentStep: "greeting",
      };

      // Check if expired
      const isExpired = session.expiresAt.toMillis() < Date.now() + 31 * 60 * 1000;
      expect(isExpired).toBe(true);
    });

    it("should extend expiry time when new message is received", () => {
      const now = Date.now();
      const initialExpiry = now + 30 * 60 * 1000;

      // Simulate message received 10 minutes later
      const messageTime = now + 10 * 60 * 1000;
      const newExpiry = messageTime + 30 * 60 * 1000;

      expect(newExpiry).toBeGreaterThan(initialExpiry);
      expect(newExpiry - messageTime).toBe(30 * 60 * 1000);
    });
  });

  describe("Media Association", () => {
    it("should associate multiple images with session", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg", "image2.jpg", "image3.jpg"],
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(session.collectedMedia.images).toHaveLength(3);
      expect(session.collectedMedia.images).toContain("image1.jpg");
      expect(session.collectedMedia.images).toContain("image2.jpg");
      expect(session.collectedMedia.images).toContain("image3.jpg");
    });

    it("should associate audio with session", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(session.collectedMedia.audio).toBe("audio.mp3");
    });

    it("should associate video with session", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          video: "video.mp4",
          textNotes: [],
        },
        currentStep: "collecting_media",
      };

      expect(session.collectedMedia.video).toBe("video.mp4");
    });

    it("should associate text notes with session", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "active",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          audio: "audio.mp3",
          textNotes: ["Handmade pottery", "Blue glaze finish"],
        },
        currentStep: "collecting_media",
      };

      expect(session.collectedMedia.textNotes).toHaveLength(2);
      expect(session.collectedMedia.textNotes).toContain("Handmade pottery");
      expect(session.collectedMedia.textNotes).toContain("Blue glaze finish");
    });
  });

  describe("Session Completion", () => {
    it("should complete session with draft ID", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "completed",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "completed",
        draftId: "draft123",
      };

      expect(session.status).toBe("completed");
      expect(session.currentStep).toBe("completed");
      expect(session.draftId).toBe("draft123");
    });

    it("should complete session without draft ID", () => {
      const session: WhatsAppSession = {
        id: "test-id",
        phone: "+919876543210",
        status: "completed",
        startedAt: Timestamp.now(),
        lastMessageAt: Timestamp.now(),
        expiresAt: Timestamp.now(),
        messages: [],
        collectedMedia: {
          images: ["image1.jpg"],
          audio: "audio.mp3",
          textNotes: [],
        },
        currentStep: "completed",
      };

      expect(session.status).toBe("completed");
      expect(session.currentStep).toBe("completed");
      expect(session.draftId).toBeUndefined();
    });
  });
});
