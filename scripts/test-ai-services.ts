/**
 * Test Script for AI Translation Services
 * 
 * This script tests Bhashini and Sarvam AI integration
 * Run with: npx ts-node scripts/test-ai-services.ts
 */

import { translateWithBhashini, batchTranslateWithBhashini } from '../lib/ai/bhashini-service';
import { translateWithSarvam, batchTranslateWithSarvam } from '../lib/ai/sarvam-service';

// Test data
const testText = "This is a beautiful handcrafted pottery vase made with traditional techniques.";
const testLanguages = ['hi', 'ta', 'te', 'bn'];

async function testBhashini() {
  console.log('\n🔵 Testing Bhashini Service...\n');
  
  try {
    // Test single translation
    console.log('Testing single translation (EN → HI)...');
    const singleTranslation = await translateWithBhashini(testText, 'en', 'hi');
    console.log('✅ Original:', testText);
    console.log('✅ Translated:', singleTranslation);
    
    // Test batch translation
    console.log('\nTesting batch translation (EN → Multiple)...');
    const batchTranslations = await batchTranslateWithBhashini(testText, 'en', testLanguages);
    console.log('✅ Batch translations:');
    for (const [lang, translation] of Object.entries(batchTranslations)) {
      console.log(`   ${lang}: ${translation.substring(0, 80)}...`);
    }
    
    console.log('\n✅ Bhashini tests completed successfully!\n');
  } catch (error) {
    console.error('❌ Bhashini test failed:', error);
  }
}

async function testSarvam() {
  console.log('\n🟢 Testing Sarvam AI Service...\n');
  
  try {
    // Test single translation
    console.log('Testing single translation (EN → HI)...');
    const singleTranslation = await translateWithSarvam(testText, 'en', 'hi');
    console.log('✅ Original:', testText);
    console.log('✅ Translated:', singleTranslation);
    
    // Test batch translation
    console.log('\nTesting batch translation (EN → Multiple)...');
    const batchTranslations = await batchTranslateWithSarvam(testText, 'en', testLanguages);
    console.log('✅ Batch translations:');
    for (const [lang, translation] of Object.entries(batchTranslations)) {
      console.log(`   ${lang}: ${translation.substring(0, 80)}...`);
    }
    
    console.log('\n✅ Sarvam AI tests completed successfully!\n');
  } catch (error) {
    console.error('❌ Sarvam AI test failed:', error);
  }
}

async function checkConfiguration() {
  console.log('\n🔍 Checking API Configuration...\n');
  
  const bhashiniConfigured = !!(process.env.BHASHINI_API_KEY && process.env.BHASHINI_USER_ID);
  const sarvamConfigured = !!process.env.SARVAM_API_KEY;
  
  console.log('Bhashini API:', bhashiniConfigured ? '✅ Configured' : '❌ Not configured');
  console.log('Sarvam AI API:', sarvamConfigured ? '✅ Configured' : '❌ Not configured');
  
  if (!bhashiniConfigured && !sarvamConfigured) {
    console.log('\n⚠️  Warning: No AI services configured!');
    console.log('The system will use mock translations for testing.');
    console.log('\nTo configure real AI services:');
    console.log('1. Copy .env.local.example to .env.local');
    console.log('2. Add your API keys for Bhashini and/or Sarvam AI');
    console.log('3. See docs/AI_TRANSLATION_INTEGRATION.md for details\n');
  }
  
  return { bhashiniConfigured, sarvamConfigured };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   AI Translation Services Test Suite');
  console.log('═══════════════════════════════════════════════════════');
  
  const config = await checkConfiguration();
  
  if (config.bhashiniConfigured) {
    await testBhashini();
  } else {
    console.log('\n⏭️  Skipping Bhashini tests (not configured)\n');
  }
  
  if (config.sarvamConfigured) {
    await testSarvam();
  } else {
    console.log('\n⏭️  Skipping Sarvam AI tests (not configured)\n');
  }
  
  if (!config.bhashiniConfigured && !config.sarvamConfigured) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Testing with Mock Services');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('Mock services will return sample translations.');
    console.log('Configure real API keys to test actual translation.\n');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Test Suite Complete');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
main().catch(console.error);
