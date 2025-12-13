/**
 * Simple script to validate Firebase Security Rules syntax
 * This checks that the rules files exist and have valid basic structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Firebase Security Rules...\n');

// Check Firestore rules
const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');
console.log('Checking Firestore rules...');
if (fs.existsSync(firestoreRulesPath)) {
  const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');
  
  // Basic syntax checks
  if (firestoreRules.includes('rules_version')) {
    console.log('✅ Firestore rules file exists and has rules_version');
  } else {
    console.error('❌ Firestore rules missing rules_version');
    process.exit(1);
  }
  
  if (firestoreRules.includes('service cloud.firestore')) {
    console.log('✅ Firestore rules has service declaration');
  } else {
    console.error('❌ Firestore rules missing service declaration');
    process.exit(1);
  }
  
  if (firestoreRules.includes('match /users/{userId}')) {
    console.log('✅ Firestore rules includes users collection rules');
  } else {
    console.error('❌ Firestore rules missing users collection rules');
    process.exit(1);
  }
  
  if (firestoreRules.includes('match /products/{productId}')) {
    console.log('✅ Firestore rules includes products collection rules');
  } else {
    console.error('❌ Firestore rules missing products collection rules');
    process.exit(1);
  }
} else {
  console.error('❌ Firestore rules file not found');
  process.exit(1);
}

console.log('');

// Check Storage rules
const storageRulesPath = path.join(__dirname, '..', 'storage.rules');
console.log('Checking Storage rules...');
if (fs.existsSync(storageRulesPath)) {
  const storageRules = fs.readFileSync(storageRulesPath, 'utf8');
  
  // Basic syntax checks
  if (storageRules.includes('rules_version')) {
    console.log('✅ Storage rules file exists and has rules_version');
  } else {
    console.error('❌ Storage rules missing rules_version');
    process.exit(1);
  }
  
  if (storageRules.includes('service firebase.storage')) {
    console.log('✅ Storage rules has service declaration');
  } else {
    console.error('❌ Storage rules missing service declaration');
    process.exit(1);
  }
  
  if (storageRules.includes('match /products/{productId}')) {
    console.log('✅ Storage rules includes products path rules');
  } else {
    console.error('❌ Storage rules missing products path rules');
    process.exit(1);
  }
} else {
  console.error('❌ Storage rules file not found');
  process.exit(1);
}

console.log('');

// Check firebase.json
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
console.log('Checking firebase.json configuration...');
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  
  if (firebaseConfig.firestore && firebaseConfig.firestore.rules) {
    console.log('✅ firebase.json includes Firestore rules configuration');
  } else {
    console.error('❌ firebase.json missing Firestore rules configuration');
    process.exit(1);
  }
  
  if (firebaseConfig.storage && firebaseConfig.storage.rules) {
    console.log('✅ firebase.json includes Storage rules configuration');
  } else {
    console.error('❌ firebase.json missing Storage rules configuration');
    process.exit(1);
  }
  
  if (firebaseConfig.emulators) {
    console.log('✅ firebase.json includes emulator configuration');
  } else {
    console.warn('⚠️  firebase.json missing emulator configuration (optional)');
  }
} else {
  console.error('❌ firebase.json not found');
  process.exit(1);
}

console.log('');
console.log('✅ All Firebase Security Rules validation checks passed!');
console.log('');
console.log('Next steps:');
console.log('1. Update .firebaserc with your Firebase project ID');
console.log('2. Test rules with: npm run emulators');
console.log('3. Deploy rules with: npx firebase deploy --only firestore:rules,storage:rules');
