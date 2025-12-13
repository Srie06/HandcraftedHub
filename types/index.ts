import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

/**
 * User profile stored in Firestore /users/{uid}
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "buyer" | "seller";
  createdAt: Timestamp;
  photoURL?: string;
  bio?: string;
  // Seller-specific fields
  shopName?: string;
  shopDescription?: string;
  location?: string;
  phone?: string;
  profileComplete?: boolean;
}

/**
 * Product document stored in Firestore /products/{productId}
 */
export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[]; // Array of Firebase Storage URLs
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Cart item with product reference and quantity
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Filters for querying products
 */
export interface ProductFilters {
  category?: string;
  searchQuery?: string;
  sellerId?: string;
  craftType?: string;
  occasion?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price-asc" | "price-desc" | "newest" | "popular";
}

/**
 * Enhanced search dimensions for cultural products
 */
export interface CulturalSearchFilters {
  craftType?: string; // "Madhubani painting", "Terracotta pottery", etc.
  occasion?: string; // "Wedding gifts", "Festive decor", etc.
  region?: string; // "Rajasthani", "Kashmiri", etc.
}

/**
 * Buyer address for checkout
 */
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Timestamp;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: "buyer" | "seller",
    displayName: string,
    sellerProfile?: SellerProfileData
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

/**
 * Seller profile data for signup
 */
export interface SellerProfileData {
  shopName: string;
  shopDescription: string;
  location: string;
  phone: string;
}

/**
 * Cart context type
 */
export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Order status types
 */
export type OrderStatus = "pending" | "accepted" | "completed" | "cancelled";

/**
 * Order document stored in Firestore /orders/{orderId}
 */
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: OrderStatus;
  buyerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Timestamp;
    note?: string;
  }>;
}

/**
 * Notification types
 */
export type NotificationType =
  | "order"
  | "payment"
  | "stock"
  | "profile"
  | "system";

/**
 * Notification document stored in Firestore /notifications/{notificationId}
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}

/**
 * Earnings summary
 */
export interface EarningsSummary {
  totalEarnings: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayouts: number;
  completedPayouts: number;
  commission: number;
}

/**
 * WhatsApp session status
 */
export type SessionStatus = "active" | "completed" | "expired";

/**
 * Session state machine steps
 */
export type SessionStep =
  | "greeting"
  | "collecting_media"
  | "processing"
  | "completed";

/**
 * Message in a WhatsApp session
 */
export interface SessionMessage {
  id: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  timestamp: Timestamp;
  processed: boolean;
}

/**
 * Collected media in a WhatsApp session
 */
export interface CollectedMedia {
  images: string[];
  audio?: string;
  video?: string;
  textNotes: string[];
}

/**
 * WhatsApp session document stored in Firestore /whatsappSessions/{sessionId}
 */
export interface WhatsAppSession {
  id: string;
  phone: string;
  sellerId?: string;
  status: SessionStatus;
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  expiresAt: Timestamp;
  messages: SessionMessage[];
  collectedMedia: CollectedMedia;
  currentStep: SessionStep;
  draftId?: string;
}

/**
 * Product draft status
 */
export type DraftStatus =
  | "pending"
  | "processing"
  | "review"
  | "approved"
  | "rejected";

/**
 * Transcription result from AI processing
 */
export interface TranscriptionResult {
  text: string;
  detectedLanguage: string;
  confidence: number;
}

/**
 * Translation for a specific language
 */
export interface LanguageTranslation {
  title: string;
  description: string;
}

/**
 * Translations for all supported languages
 */
export interface Translations {
  [languageCode: string]: LanguageTranslation;
}

/**
 * AI-generated product data
 */
export interface GeneratedProductData {
  category: string;
  subcategory?: string;
  tags: string[];
  suggestedPrice?: number;
  materials: string[];
  techniques: string[];
  region?: string;
  confidence: number;
}

/**
 * AI processing results
 */
export interface AIProcessing {
  transcription: TranscriptionResult;
  translations: Translations;
  generated: GeneratedProductData;
}

/**
 * Original media from WhatsApp submission
 */
export interface OriginalMedia {
  images: string[];
  audio?: string;
  video?: string;
  textMessages: string[];
}

/**
 * Admin edits to product draft
 */
export interface AdminEdits {
  title?: { [lang: string]: string };
  description?: { [lang: string]: string };
  category?: string;
  tags?: string[];
  price?: number;
  stock?: number;
}

/**
 * Admin review information
 */
export interface AdminReview {
  reviewerId: string;
  reviewerName: string;
  reviewedAt: Timestamp;
  action: "approved" | "rejected";
  feedback?: string;
  edits: AdminEdits;
}

/**
 * Product draft document stored in Firestore /productDrafts/{draftId}
 */
export interface ProductDraft {
  id: string;
  sellerId: string;
  sellerPhone: string;
  sellerName: string;
  status: DraftStatus;
  submittedAt: Timestamp;
  processedAt?: Timestamp;
  reviewedAt?: Timestamp;
  originalMedia: OriginalMedia;
  aiProcessing: AIProcessing;
  adminReview?: AdminReview;
  productId?: string;
}
