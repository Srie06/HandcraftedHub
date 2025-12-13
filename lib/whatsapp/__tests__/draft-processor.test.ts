import { processDraft } from "../draft-processor";
import * as mockServices from "../../ai/mock-services";

// Mock Firebase
jest.mock("../../firebase/config", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({
      toMillis: () => Date.now(),
      toDate: () => new Date(),
    })),
  },
}));

// Mock AI services
jest.mock("../../ai/mock-services");

describe("Draft Processor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Audio Transcription", () => {
    it("should transcribe audio in Hindi", async () => {
      const mockTranscription = {
        text: "यह हस्तनिर्मित मिट्टी का बर्तन है",
        language: "hi",
        confidence: 0.95,
      };

      (mockServices.mockTranscribeAudio as jest.Mock).mockResolvedValue(
        mockTranscription
      );

      const result = await mockServices.mockTranscribeAudio(
        "https://example.com/audio.mp3"
      );

      expect(result.text).toBe("यह हस्तनिर्मित मिट्टी का बर्तन है");
      expect(result.language).toBe("hi");
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it("should transcribe audio in Tamil", async () => {
      const mockTranscription = {
        text: "இது கைவினை மண் பானை",
        language: "ta",
        confidence: 0.92,
      };

      (mockServices.mockTranscribeAudio as jest.Mock).mockResolvedValue(
        mockTranscription
      );

      const result = await mockServices.mockTranscribeAudio(
        "https://example.com/audio.mp3"
      );

      expect(result.language).toBe("ta");
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it("should handle transcription with low confidence", async () => {
      const mockTranscription = {
        text: "unclear audio",
        language: "en",
        confidence: 0.45,
      };

      (mockServices.mockTranscribeAudio as jest.Mock).mockResolvedValue(
        mockTranscription
      );

      const result = await mockServices.mockTranscribeAudio(
        "https://example.com/audio.mp3"
      );

      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe("Translation", () => {
    it("should translate to all supported languages", async () => {
      const mockTranslations = {
        en: "Handmade pottery bowl",
        hi: "हस्तनिर्मित मिट्टी का कटोरा",
        ta: "கைவினை மண் கிண்ணம்",
        te: "చేతితో తయారు చేసిన కుండ",
        bn: "হস্তনির্মিত মাটির বাটি",
        mr: "हस्तनिर्मित मातीचा वाटी",
        gu: "હસ્તનિર્મિત માટીનો વાટકો",
        kn: "ಕೈಯಿಂದ ಮಾಡಿದ ಮಣ್ಣಿನ ಬಟ್ಟಲು",
        ml: "കൈകൊണ്ട് നിർമ്മിച്ച മൺപാത്രം",
        pa: "ਹੱਥੀਂ ਬਣਾਇਆ ਮਿੱਟੀ ਦਾ ਕਟੋਰਾ",
      };

      (mockServices.mockTranslate as jest.Mock).mockResolvedValue(
        mockTranslations
      );

      const result = await mockServices.mockTranslate(
        "Handmade pottery bowl",
        Object.keys(mockTranslations)
      );

      expect(Object.keys(result)).toHaveLength(10);
      expect(result.en).toBe("Handmade pottery bowl");
      expect(result.hi).toBeDefined();
      expect(result.ta).toBeDefined();
    });

    it("should preserve original language in translations", async () => {
      const originalText = "यह हस्तनिर्मित है";
      const mockTranslations = {
        en: "This is handmade",
        hi: "यह हस्तनिर्मित है",
        ta: "இது கைவினை",
      };

      (mockServices.mockTranslate as jest.Mock).mockResolvedValue(
        mockTranslations
      );

      const result = await mockServices.mockTranslate(
        originalText,
        Object.keys(mockTranslations)
      );

      expect(result.hi).toBe(originalText);
    });
  });

  describe("Product Generation", () => {
    it("should generate product with all required fields", async () => {
      const mockProduct = {
        title: {
          en: "Handmade Blue Pottery Bowl",
          hi: "हस्तनिर्मित नीला मिट्टी का कटोरा",
        },
        description: {
          en: "Beautiful handcrafted pottery bowl with traditional blue glaze",
          hi: "पारंपरिक नीले ग्लेज़ के साथ सुंदर हस्तनिर्मित मिट्टी का कटोरा",
        },
        category: "Pottery",
        tags: ["handmade", "pottery", "blue-glaze", "traditional"],
        confidence: 0.88,
      };

      (mockServices.mockGenerateProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await mockServices.mockGenerateProduct(
        "This is a handmade pottery bowl",
        ["https://example.com/image1.jpg"]
      );

      expect(result.title.en).toBeDefined();
      expect(result.description.en).toBeDefined();
      expect(result.category).toBe("Pottery");
      expect(result.tags).toContain("handmade");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should categorize textile products correctly", async () => {
      const mockProduct = {
        title: {
          en: "Handwoven Silk Saree",
        },
        description: {
          en: "Traditional handwoven silk saree",
        },
        category: "Textiles",
        tags: ["handwoven", "silk", "saree", "traditional"],
        confidence: 0.92,
      };

      (mockServices.mockGenerateProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await mockServices.mockGenerateProduct(
        "Handwoven silk saree",
        ["https://example.com/saree.jpg"]
      );

      expect(result.category).toBe("Textiles");
      expect(result.tags).toContain("handwoven");
    });

    it("should categorize jewelry products correctly", async () => {
      const mockProduct = {
        title: {
          en: "Silver Filigree Earrings",
        },
        description: {
          en: "Intricate silver filigree earrings",
        },
        category: "Jewelry",
        tags: ["silver", "filigree", "earrings", "handcrafted"],
        confidence: 0.90,
      };

      (mockServices.mockGenerateProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await mockServices.mockGenerateProduct(
        "Silver filigree earrings",
        ["https://example.com/earrings.jpg"]
      );

      expect(result.category).toBe("Jewelry");
      expect(result.tags).toContain("silver");
    });

    it("should generate relevant tags based on content", async () => {
      const mockProduct = {
        title: {
          en: "Bamboo Basket",
        },
        description: {
          en: "Eco-friendly bamboo basket from Assam",
        },
        category: "Home Decor",
        tags: ["bamboo", "basket", "eco-friendly", "assam", "handwoven"],
        confidence: 0.85,
      };

      (mockServices.mockGenerateProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await mockServices.mockGenerateProduct(
        "Bamboo basket from Assam",
        ["https://example.com/basket.jpg"]
      );

      expect(result.tags).toContain("bamboo");
      expect(result.tags).toContain("assam");
      expect(result.tags.length).toBeGreaterThan(3);
    });
  });

  describe("Confidence Scoring", () => {
    it("should have high confidence for clear audio", async () => {
      const mockTranscription = {
        text: "Clear audio transcription",
        language: "en",
        confidence: 0.95,
      };

      (mockServices.mockTranscribeAudio as jest.Mock).mockResolvedValue(
        mockTranscription
      );

      const result = await mockServices.mockTranscribeAudio(
        "https://example.com/clear-audio.mp3"
      );

      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it("should have lower confidence for unclear audio", async () => {
      const mockTranscription = {
        text: "Unclear transcription",
        language: "en",
        confidence: 0.55,
      };

      (mockServices.mockTranscribeAudio as jest.Mock).mockResolvedValue(
        mockTranscription
      );

      const result = await mockServices.mockTranscribeAudio(
        "https://example.com/unclear-audio.mp3"
      );

      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe("Error Handling", () => {
    it("should handle transcription errors gracefully", async () => {
      (mockServices.mockTranscribeAudio as jest.Mock).mockRejectedValue(
        new Error("Transcription failed")
      );

      await expect(
        mockServices.mockTranscribeAudio("https://example.com/audio.mp3")
      ).rejects.toThrow("Transcription failed");
    });

    it("should handle translation errors gracefully", async () => {
      (mockServices.mockTranslate as jest.Mock).mockRejectedValue(
        new Error("Translation failed")
      );

      await expect(
        mockServices.mockTranslate("Test text", ["en", "hi"])
      ).rejects.toThrow("Translation failed");
    });

    it("should handle product generation errors gracefully", async () => {
      (mockServices.mockGenerateProduct as jest.Mock).mockRejectedValue(
        new Error("Product generation failed")
      );

      await expect(
        mockServices.mockGenerateProduct("Test", ["image.jpg"])
      ).rejects.toThrow("Product generation failed");
    });
  });
});
