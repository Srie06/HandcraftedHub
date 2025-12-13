import { parseMessage, isValidMessage, normalizePhoneNumber } from "../message-parser";

// Mock Firebase
jest.mock("../../firebase/config", () => ({
  db: {},
}));

describe("WhatsApp Message Parser", () => {
  const mockMetadata = {
    phone_number_id: "test-phone-id",
    display_phone_number: "919876543210",
  };

  describe("Text Message Parsing", () => {
    it("should parse text message correctly", () => {
      const rawMessage = {
        id: "msg-123",
        from: "919876543210",
        type: "text",
        text: { body: "Hello, I want to list a product" },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("text");
      expect(result.from).toBe("919876543210");
      expect(result.content).toEqual({ body: "Hello, I want to list a product" });
      expect(result.messageId).toBe("msg-123");
      expect(result.timestamp).toBe(1234567890);
    });

    it("should handle empty text message", () => {
      const rawMessage = {
        id: "msg-124",
        from: "919876543210",
        type: "text",
        text: { body: "" },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("text");
      expect(result.content).toEqual({ body: "" });
    });
  });

  describe("Image Message Parsing", () => {
    it("should parse image message correctly", () => {
      const rawMessage = {
        id: "msg-125",
        from: "919876543210",
        type: "image",
        image: {
          id: "image123",
          mime_type: "image/jpeg",
          sha256: "hash123",
          caption: "My handmade pottery",
        },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("image");
      expect(result.from).toBe("919876543210");
      expect(result.content).toEqual({
        id: "image123",
        mimeType: "image/jpeg",
        sha256: "hash123",
        caption: "My handmade pottery",
      });
    });

    it("should parse image message without caption", () => {
      const rawMessage = {
        id: "msg-126",
        from: "919876543210",
        type: "image",
        image: {
          id: "image123",
          mime_type: "image/jpeg",
          sha256: "hash123",
        },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("image");
      expect(result.content).toHaveProperty("id", "image123");
      // Caption is undefined when not provided
      expect((result.content as any).caption).toBeUndefined();
    });
  });

  describe("Audio Message Parsing", () => {
    it("should parse audio message correctly", () => {
      const rawMessage = {
        id: "msg-127",
        from: "919876543210",
        type: "audio",
        audio: {
          id: "audio123",
          mime_type: "audio/ogg",
          sha256: "hash123",
          duration: 30,
        },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("audio");
      expect(result.from).toBe("919876543210");
      expect(result.content).toHaveProperty("id", "audio123");
      expect(result.content).toHaveProperty("duration", 30);
    });
  });

  describe("Video Message Parsing", () => {
    it("should parse video message correctly", () => {
      const rawMessage = {
        id: "msg-128",
        from: "919876543210",
        type: "video",
        video: {
          id: "video123",
          mime_type: "video/mp4",
          sha256: "hash123",
          caption: "Product demonstration",
        },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("video");
      expect(result.from).toBe("919876543210");
      expect(result.content).toHaveProperty("id", "video123");
      expect(result.content).toHaveProperty("caption", "Product demonstration");
    });
  });

  describe("Message Validation", () => {
    it("should validate correct message structure", () => {
      const validMessage = {
        id: "msg-129",
        from: "919876543210",
        type: "text",
        timestamp: "1234567890",
      };

      expect(isValidMessage(validMessage)).toBe(true);
    });

    it("should reject message without id", () => {
      const invalidMessage = {
        from: "919876543210",
        type: "text",
        timestamp: "1234567890",
      };

      expect(isValidMessage(invalidMessage)).toBe(false);
    });

    it("should reject message without from", () => {
      const invalidMessage = {
        id: "msg-130",
        type: "text",
        timestamp: "1234567890",
      };

      expect(isValidMessage(invalidMessage)).toBe(false);
    });

    it("should reject message without timestamp", () => {
      const invalidMessage = {
        id: "msg-131",
        from: "919876543210",
        type: "text",
      };

      expect(isValidMessage(invalidMessage)).toBe(false);
    });

    it("should reject null message", () => {
      expect(isValidMessage(null)).toBe(false);
    });
  });

  describe("Phone Number Normalization", () => {
    it("should normalize phone number with country code", () => {
      const phone = "+91 9876543210";
      const normalized = normalizePhoneNumber(phone);

      expect(normalized).toBe("919876543210");
    });

    it("should normalize phone number with dashes", () => {
      const phone = "91-987-654-3210";
      const normalized = normalizePhoneNumber(phone);

      expect(normalized).toBe("919876543210");
    });

    it("should handle already normalized phone number", () => {
      const phone = "919876543210";
      const normalized = normalizePhoneNumber(phone);

      expect(normalized).toBe("919876543210");
    });
  });

  describe("Metadata Extraction", () => {
    it("should extract metadata correctly", () => {
      const rawMessage = {
        id: "msg-132",
        from: "919876543210",
        type: "text",
        text: { body: "Test" },
        timestamp: "1234567890",
        from_name: "Ramesh Kumar",
      };

      const metadata = {
        phone_number_id: "test-phone-id",
        display_phone_number: "919876543210",
      };

      const result = parseMessage(rawMessage, metadata);

      expect(result.metadata.phoneNumberId).toBe("test-phone-id");
      expect(result.metadata.displayPhoneNumber).toBe("919876543210");
      expect(result.metadata.profileName).toBe("Ramesh Kumar");
    });

    it("should handle missing profile name", () => {
      const rawMessage = {
        id: "msg-133",
        from: "919876543210",
        type: "text",
        text: { body: "Test" },
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result.metadata.profileName).toBeUndefined();
    });
  });

  describe("Unknown Message Types", () => {
    it("should handle unknown message type", () => {
      const rawMessage = {
        id: "msg-134",
        from: "919876543210",
        type: "location",
        timestamp: "1234567890",
      };

      const result = parseMessage(rawMessage, mockMetadata);

      expect(result).toBeDefined();
      expect(result.type).toBe("unknown");
      expect(result.content).toBeNull();
    });
  });
});
