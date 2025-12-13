/**
 * Google Sheets API Client
 * Fetches product data directly from Google Sheets
 */

export interface SheetProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url_1: string;
  image_url_2?: string;
  image_url_3?: string;
  images: string[];
}

/**
 * Fetch products from Google Sheets
 */
export async function getProductsFromSheet(): Promise<SheetProduct[]> {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    
    if (!SHEET_ID || !API_KEY) {
      console.error('Missing Google Sheets credentials');
      return [];
    }

    // Fetch data from Google Sheets API
    const range = 'Sheet1!A2:I1000'; // Adjust range as needed
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error('Failed to fetch from Google Sheets:', response.statusText);
      return [];
    }

    const data = await response.json();
    const rows = data.values || [];

    // Convert rows to products
    const products: SheetProduct[] = rows
      .filter((row: any[]) => row.length >= 7) // Must have at least basic fields
      .map((row: any[], index: number) => {
        const images = [row[6], row[7], row[8]].filter(url => url && url.trim() !== '');
        
        return {
          id: `sheet-${index + 2}`, // Row number as ID
          title: row[1] || 'Untitled Product',
          description: row[2] || '',
          price: parseFloat(row[3]) || 0,
          stock: parseInt(row[4]) || 0,
          category: row[5] || 'Uncategorized',
          image_url_1: row[6] || '',
          image_url_2: row[7] || '',
          image_url_3: row[8] || '',
          images: images,
        };
      })
      .filter(product => product.images.length > 0 && product.stock > 0); // Only show products with images and stock

    return products;
  } catch (error) {
    console.error('Error fetching products from Google Sheets:', error);
    return [];
  }
}
