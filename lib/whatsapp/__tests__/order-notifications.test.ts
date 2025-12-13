import { generateOrderNotification, generateStatusUpdateNotification, detectSellerLanguage } from "../notification-message-generator";

// Mock Firebase
jest.mock("../../firebase/config", () => ({
  db: {},
}));

describe("Order Notifications", () => {
  const mockOrderParams = {
    orderId: "order123",
    productName: "Handmade Pottery Bowl",
    quantity: 2,
    buyerLocation: "Mumbai, Maharashtra",
    totalAmount: 1200,
    trackingLink: "https://example.com/track/order123",
  };

  describe("Order Notification Message Generation", () => {
    it("should generate notification in Hindi", () => {
      const message = generateOrderNotification(mockOrderParams, "hi");

      expect(message).toContain("नया ऑर्डर");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("2");
      expect(message).toContain("Mumbai");
      expect(message).toContain("order123");
      expect(message).toContain("₹1200");
    });

    it("should generate notification in English", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      expect(message).toContain("New Order");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("2");
      expect(message).toContain("Mumbai");
      expect(message).toContain("order123");
      expect(message).toContain("₹1200");
    });

    it("should generate notification in Tamil", () => {
      const message = generateOrderNotification(mockOrderParams, "ta");

      expect(message).toContain("புதிய ஆர்டர்");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("2");
    });

    it("should include all required order details", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      expect(message).toContain(mockOrderParams.productName);
      expect(message).toContain(mockOrderParams.quantity.toString());
      expect(message).toContain(mockOrderParams.buyerLocation);
      expect(message).toContain(mockOrderParams.orderId);
      expect(message).toContain(mockOrderParams.totalAmount.toString());
    });

    it("should include tracking link when provided", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      expect(message).toContain(mockOrderParams.trackingLink!);
    });

    it("should handle missing tracking link", () => {
      const paramsWithoutLink = { ...mockOrderParams };
      delete paramsWithoutLink.trackingLink;

      const message = generateOrderNotification(paramsWithoutLink, "en");

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe("Status Update Notifications", () => {
    it("should generate ready for pickup notification", () => {
      const params = {
        orderId: "order123",
        productName: "Handmade Pottery Bowl",
        status: "ready_for_pickup" as const,
      };

      const message = generateStatusUpdateNotification(params, "en");

      expect(message).toContain("Ready for Pickup");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("order123");
    });

    it("should generate picked up notification", () => {
      const params = {
        orderId: "order123",
        productName: "Handmade Pottery Bowl",
        status: "picked_up" as const,
      };

      const message = generateStatusUpdateNotification(params, "en");

      expect(message).toContain("Picked Up");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("order123");
    });

    it("should generate delivered notification", () => {
      const params = {
        orderId: "order123",
        productName: "Handmade Pottery Bowl",
        status: "delivered" as const,
      };

      const message = generateStatusUpdateNotification(params, "en");

      expect(message).toContain("Delivered");
      expect(message).toContain("Handmade Pottery Bowl");
      expect(message).toContain("order123");
    });
  });

  describe("Multi-language Support", () => {
    const languages = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"];

    languages.forEach((lang) => {
      it(`should generate notification in ${lang}`, () => {
        const message = generateOrderNotification(mockOrderParams, lang as any);

        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);
        expect(message).toContain(mockOrderParams.productName);
        expect(message).toContain(mockOrderParams.orderId);
      });
    });
  });

  describe("Language Detection", () => {
    it("should detect Tamil from Tamil Nadu location", () => {
      const sellerProfile = {
        location: "Chennai, Tamil Nadu",
      };

      const language = detectSellerLanguage(sellerProfile);

      expect(language).toBe("ta");
    });

    it("should detect Telugu from Telangana location", () => {
      const sellerProfile = {
        location: "Hyderabad, Telangana",
      };

      const language = detectSellerLanguage(sellerProfile);

      expect(language).toBe("te");
    });

    it("should detect Marathi from Maharashtra location", () => {
      const sellerProfile = {
        location: "Pune, Maharashtra",
      };

      const language = detectSellerLanguage(sellerProfile);

      expect(language).toBe("mr");
    });

    it("should use preferred language if set", () => {
      const sellerProfile = {
        preferredLanguage: "ta",
        location: "Mumbai, Maharashtra",
      };

      const language = detectSellerLanguage(sellerProfile);

      expect(language).toBe("ta");
    });

    it("should default to Hindi for unknown location", () => {
      const sellerProfile = {
        location: "Unknown City",
      };

      const language = detectSellerLanguage(sellerProfile);

      expect(language).toBe("hi");
    });

    it("should default to Hindi for empty profile", () => {
      const language = detectSellerLanguage({});

      expect(language).toBe("hi");
    });
  });

  describe("Message Content Validation", () => {
    it("should not exceed WhatsApp message length limit", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      // WhatsApp message limit is 4096 characters
      expect(message.length).toBeLessThan(4096);
    });

    it("should include order ID for tracking", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      expect(message).toContain("order123");
    });

    it("should format currency correctly", () => {
      const message = generateOrderNotification(mockOrderParams, "en");

      expect(message).toContain("₹");
      expect(message).toContain("1200");
    });
  });

  describe("Error Handling", () => {
    it("should handle empty product name gracefully", () => {
      const paramsWithEmptyName = {
        ...mockOrderParams,
        productName: "",
      };

      const message = generateOrderNotification(paramsWithEmptyName, "en");

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });

    it("should handle zero quantity", () => {
      const paramsWithZeroQty = {
        ...mockOrderParams,
        quantity: 0,
      };

      const message = generateOrderNotification(paramsWithZeroQty, "en");

      expect(message).toBeDefined();
      expect(message).toContain("0");
    });

    it("should default to English for unsupported language", () => {
      const message = generateOrderNotification(mockOrderParams, "fr" as any);

      expect(message).toContain("New Order");
    });
  });

  describe("Notification Timing", () => {
    it("should be suitable for immediate sending", () => {
      const startTime = Date.now();
      const message = generateOrderNotification(mockOrderParams, "en");
      const endTime = Date.now();

      const generationTime = endTime - startTime;

      // Should generate quickly (under 100ms)
      expect(generationTime).toBeLessThan(100);
      expect(message).toBeDefined();
    });
  });

  describe("Status Update Messages in Multiple Languages", () => {
    it("should generate ready for pickup in Hindi", () => {
      const params = {
        orderId: "order123",
        productName: "Handmade Pottery Bowl",
        status: "ready_for_pickup" as const,
      };

      const message = generateStatusUpdateNotification(params, "hi");

      expect(message).toContain("तैयार");
      expect(message).toContain("order123");
    });

    it("should generate delivered in Tamil", () => {
      const params = {
        orderId: "order123",
        productName: "Handmade Pottery Bowl",
        status: "delivered" as const,
      };

      const message = generateStatusUpdateNotification(params, "ta");

      expect(message).toContain("வழங்கப்பட்டது");
      expect(message).toContain("order123");
    });
  });
});
