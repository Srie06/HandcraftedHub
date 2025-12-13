import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

/**
 * Fetch products directly from Google Sheets
 * GET /api/products/sheets
 */
export async function GET() {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    
    if (!SHEET_ID || !API_KEY) {
      return NextResponse.json({
        products: [],
        message: 'Google Sheets not configured'
      });
    }

    // Fetch data from Google Sheets API
    // Range: A2:I1000 (skip header row, columns A-I, up to 1000 rows)
    const range = 'product!A2:I1000'; // Sheet name is "product"
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch from Google Sheets:', response.statusText, errorText);
      return NextResponse.json({
        products: [],
        error: 'Failed to fetch from Google Sheets',
        details: errorText,
        sheetId: SHEET_ID,
        apiKeyPresent: !!API_KEY,
        sheetName: 'product'
      }, { status: 500 });
    }

    const data = await response.json();
    const rows = data.values || [];

    // Convert rows to products
    const products = rows
      .filter((row: any[]) => row.length >= 7) // Must have at least basic fields
      .map((row: any[], index: number) => {
        const images = [row[6], row[7], row[8]]
          .filter(url => url && url.trim() !== '');
        
        return {
          id: `sheet-${index + 2}`, // Row number as ID
          title: row[1] || 'Untitled Product',
          description: row[2] || '',
          price: parseFloat(row[3]) || 0,
          stock: parseInt(row[4]) || 0,
          category: row[5] || 'Uncategorized',
          images: images,
          source: 'google_sheets',
          sellerId: 'sheet-seller', // Placeholder
          createdAt: new Date().toISOString(),
        };
      })
      .filter(product => product.images.length > 0 && product.stock > 0); // Only show products with images and stock

    return NextResponse.json({
      products,
      count: products.length,
      source: 'google_sheets'
    });
  } catch (error: any) {
    console.error('Error fetching products from Google Sheets:', error);
    return NextResponse.json({
      products: [],
      error: error.message
    }, { status: 500 });
  }
}
