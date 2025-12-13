import { NextRequest, NextResponse } from "next/server";
import { createDocument, queryDocuments, where, Timestamp } from "@/lib/firebase/firestore";

/**
 * Simple product creation endpoint for Google Sheets automation
 * Creates products directly from sheet data with image URLs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.AUTOMATION_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.error("[Automation] Unauthorized request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      sellerEmail,
      title,
      description,
      price,
      stock,
      category,
      images,
    } = body;

    console.log("[Automation] Creating product:", { sellerEmail, title, category });

    // Validate required fields
    if (!sellerEmail || !title || !description || !price || !stock || !category) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["sellerEmail", "title", "description", "price", "stock", "category"],
          received: { sellerEmail, title, description, price, stock, category }
        },
        { status: 400 }
      );
    }

    // Get seller by email
    const sellers = await queryDocuments(
      "users",
      where("email", "==", sellerEmail),
      where("role", "==", "seller")
    );

    if (sellers.length === 0) {
      console.error("[Automation] Seller not found:", sellerEmail);
      return NextResponse.json(
        { error: `Seller not found with email: ${sellerEmail}. Please ensure the seller account exists.` },
        { status: 404 }
      );
    }

    const sellerId = sellers[0].uid;
    console.log("[Automation] Found seller:", { sellerId, name: sellers[0].displayName });

    // Filter out empty image URLs
    const validImages = Array.isArray(images) 
      ? images.filter((url: string) => url && url.trim() !== "")
      : [];

    console.log("[Automation] Valid images:", validImages.length);

    // Create product document
    const productData = {
      sellerId,
      title,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: validImages,
      status: validImages.length > 0 ? "active" : "pending_images",
      createdAt: Timestamp.now(),
      source: "google_sheets_automation",
    };

    const productId = await createDocument("products", productData);
    console.log("[Automation] Product created:", productId);

    // Return success response
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/product/${productId}`;

    return NextResponse.json({
      success: true,
      productId,
      status: productData.status,
      productUrl,
      message: `Product "${title}" created successfully`,
    });
  } catch (error: any) {
    console.error("[Automation] Error creating product:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create product",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    message: "Google Sheets Automation API",
    status: "active",
    endpoint: "/api/automation/create-product-simple",
    method: "POST",
    requiredHeaders: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    requiredFields: [
      "sellerEmail",
      "title",
      "description",
      "price",
      "stock",
      "category",
      "images (array)"
    ]
  });
}
