/**
 * Script to add sample orders and notifications to Firestore
 * Run this script to populate your database with test data
 * 
 * Usage: node scripts/add-sample-orders.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Make sure you have your service account key file
// Download it from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample data
const sampleOrders = [
  {
    buyerId: "REPLACE_WITH_BUYER_UID",
    sellerId: "REPLACE_WITH_SELLER_UID",
    productId: "REPLACE_WITH_PRODUCT_ID",
    productTitle: "Handwoven Basket",
    productImage: "https://via.placeholder.com/300",
    quantity: 1,
    price: 45.00,
    totalAmount: 45.00,
    status: "pending",
    buyerInfo: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      address: "456 Oak Avenue, Springfield, IL 62701"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      {
        status: "pending",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Order placed successfully"
      }
    ]
  },
  {
    buyerId: "REPLACE_WITH_BUYER_UID",
    sellerId: "REPLACE_WITH_SELLER_UID",
    productId: "REPLACE_WITH_PRODUCT_ID",
    productTitle: "Ceramic Pottery Set",
    productImage: "https://via.placeholder.com/300",
    quantity: 2,
    price: 35.00,
    totalAmount: 70.00,
    status: "accepted",
    buyerInfo: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      address: "456 Oak Avenue, Springfield, IL 62701"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      {
        status: "pending",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Order placed successfully"
      },
      {
        status: "accepted",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Seller confirmed the order"
      }
    ]
  },
  {
    buyerId: "REPLACE_WITH_BUYER_UID",
    sellerId: "REPLACE_WITH_SELLER_UID",
    productId: "REPLACE_WITH_PRODUCT_ID",
    productTitle: "Handmade Jewelry",
    productImage: "https://via.placeholder.com/300",
    quantity: 1,
    price: 25.00,
    totalAmount: 25.00,
    status: "completed",
    buyerInfo: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      address: "456 Oak Avenue, Springfield, IL 62701"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      {
        status: "pending",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Order placed successfully"
      },
      {
        status: "accepted",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Seller confirmed the order"
      },
      {
        status: "completed",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Order delivered successfully"
      }
    ]
  }
];

const sampleNotifications = [
  {
    userId: "REPLACE_WITH_BUYER_UID",
    type: "order",
    title: "Order Placed Successfully",
    message: "Your order for Handwoven Basket has been placed. We'll notify you when the seller confirms it.",
    read: false,
    actionUrl: "/orders/ORDER_ID_1",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    userId: "REPLACE_WITH_BUYER_UID",
    type: "order",
    title: "Order Confirmed",
    message: "Great news! Your order for Ceramic Pottery Set has been confirmed by the seller.",
    read: false,
    actionUrl: "/orders/ORDER_ID_2",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    userId: "REPLACE_WITH_BUYER_UID",
    type: "order",
    title: "Order Delivered",
    message: "Your order for Handmade Jewelry has been delivered. Enjoy your purchase!",
    read: true,
    actionUrl: "/orders/ORDER_ID_3",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    userId: "REPLACE_WITH_BUYER_UID",
    type: "system",
    title: "Welcome to HandcraftedHub!",
    message: "Thank you for joining our community of artisans and craft lovers.",
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addSampleData() {
  try {
    console.log('🚀 Starting to add sample data...\n');

    // Add orders
    console.log('📦 Adding sample orders...');
    const orderIds = [];
    for (const order of sampleOrders) {
      const orderRef = await db.collection('orders').add(order);
      orderIds.push(orderRef.id);
      console.log(`✅ Added order: ${orderRef.id}`);
    }

    // Update notification action URLs with actual order IDs
    sampleNotifications[0].actionUrl = `/orders/${orderIds[0]}`;
    sampleNotifications[1].actionUrl = `/orders/${orderIds[1]}`;
    sampleNotifications[2].actionUrl = `/orders/${orderIds[2]}`;

    // Add notifications
    console.log('\n🔔 Adding sample notifications...');
    for (const notification of sampleNotifications) {
      const notifRef = await db.collection('notifications').add(notification);
      console.log(`✅ Added notification: ${notifRef.id}`);
    }

    console.log('\n✨ Sample data added successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Replace REPLACE_WITH_BUYER_UID with actual buyer user ID');
    console.log('2. Replace REPLACE_WITH_SELLER_UID with actual seller user ID');
    console.log('3. Replace REPLACE_WITH_PRODUCT_ID with actual product IDs');
    console.log('4. Run the script again to add data with correct IDs');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    process.exit();
  }
}

// Run the script
addSampleData();
