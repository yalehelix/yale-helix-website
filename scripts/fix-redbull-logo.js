const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixRedBullLogo() {
  try {
    const input = 'public/assets/img/red-bull-logo.png';
    const output = 'public/assets/img/red-bull-logo-fixed.png';
    
    console.log('🔧 Fixing Red Bull logo transparency...');
    
    // Check if input file exists
    if (!fs.existsSync(input)) {
      console.log('❌ Input file not found:', input);
      return;
    }

    // Get original file size
    const originalStats = fs.statSync(input);
    const originalSizeKB = Math.round(originalStats.size / 1024);
    console.log(`   Input: ${input} (${originalSizeKB}KB)`);

    // Compress PNG while preserving transparency
    await sharp(input)
      .resize(300, 200, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(output);

    // Get compressed file size
    const compressedStats = fs.statSync(output);
    const compressedSizeKB = Math.round(compressedStats.size / 1024);
    const savings = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);

    console.log(`   Output: ${output} (${compressedSizeKB}KB)`);
    console.log(`   Savings: ${savings}% (${originalSizeKB - compressedSizeKB}KB saved)`);
    console.log(`   ✅ Red Bull logo fixed with transparency preserved!\n`);

    console.log('🎯 Next steps:');
    console.log('   1. Check the fixed logo: red-bull-logo-fixed.png');
    console.log('   2. If it looks good, update your HTML to use it');
    console.log('   3. Or replace the original with the fixed version');

  } catch (error) {
    console.error('❌ Error fixing Red Bull logo:', error.message);
  }
}

// Run the fix
fixRedBullLogo();
