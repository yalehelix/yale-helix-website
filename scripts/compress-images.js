const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration for different image types
const compressionConfig = {
  // Team member photos - high quality, square format
  team: {
    width: 400,
    height: 400,
    quality: 80,
    fit: 'cover',
    position: 'center'
  },
  // Advisor photos - high quality, square format  
  advisor: {
    width: 400,
    height: 400,
    quality: 80,
    fit: 'cover',
    position: 'center'
  },
  // Sponsor logos - maintain aspect ratio, high quality
  sponsor: {
    width: 300,
    height: 200,
    quality: 85,
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
};

// List of images to compress with their configurations
const imagesToCompress = [
  // Team members (large files that need compression)
  {
    input: 'public/assets/img/team/justin.jpg',
    output: 'public/assets/img/team/justin-optimized.jpg',
    config: compressionConfig.team,
    description: 'Justin - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/jiya.jpeg',
    output: 'public/assets/img/team/jiya-optimized.jpeg',
    config: compressionConfig.team,
    description: 'Jiya - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/kavya.jpg',
    output: 'public/assets/img/team/kavya-optimized.jpg',
    config: compressionConfig.team,
    description: 'Kavya - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/rohan.jpg',
    output: 'public/assets/img/team/rohan-optimized.jpg',
    config: compressionConfig.team,
    description: 'Rohan - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/gautham.jpg',
    output: 'public/assets/img/team/gautham-optimized.jpg',
    config: compressionConfig.team,
    description: 'Gautham - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/maya.jpeg',
    output: 'public/assets/img/team/maya-optimized.jpeg',
    config: compressionConfig.team,
    description: 'Maya - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/mark.jpg',
    output: 'public/assets/img/team/mark-optimized.jpg',
    config: compressionConfig.team,
    description: 'Mark - Executive Board Member'
  },
  {
    input: 'public/assets/img/team/david_rosenthal.jpg',
    output: 'public/assets/img/team/david_rosenthal-optimized.jpg',
    config: compressionConfig.team,
    description: 'David Rosenthal - Advisory Board'
  },
  {
    input: 'public/assets/img/team/jorge_torres.jpg',
    output: 'public/assets/img/team/jorge_torres-optimized.jpg',
    config: compressionConfig.advisor,
    description: 'Jorge Torres - Advisor'
  },
  {
    input: 'public/assets/img/team/howard_forman.jpg',
    output: 'public/assets/img/team/howard_forman-optimized.jpg',
    config: compressionConfig.advisor,
    description: 'Howard Forman - Advisor'
  },
  // Sponsor logos
  {
    input: 'public/assets/img/red-bull-logo.png',
    output: 'public/assets/img/red-bull-logo-optimized.png',
    config: compressionConfig.sponsor,
    description: 'Red Bull Logo'
  }
];

async function compressImage(imageConfig) {
  try {
    const { input, output, config, description } = imageConfig;
    
    // Check if input file exists
    if (!fs.existsSync(input)) {
      console.log(`⚠️  Skipping ${description}: Input file not found`);
      return;
    }

    // Get original file size
    const originalStats = fs.statSync(input);
    const originalSizeKB = Math.round(originalStats.size / 1024);

    console.log(`🔄 Compressing ${description}...`);
    console.log(`   Input: ${input} (${originalSizeKB}KB)`);

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Compress image based on configuration
    let sharpInstance = sharp(input);
    
    if (config.fit === 'cover') {
      // For team photos - crop to fit square
      sharpInstance = sharpInstance.resize(config.width, config.height, {
        fit: 'cover',
        position: config.position
      });
    } else if (config.fit === 'contain') {
      // For sponsor logos - maintain aspect ratio
      sharpInstance = sharpInstance.resize(config.width, config.height, {
        fit: 'contain',
        background: config.background
      });
    }

    // Apply quality settings
    if (input.toLowerCase().endsWith('.jpg') || input.toLowerCase().endsWith('.jpeg')) {
      sharpInstance = sharpInstance.jpeg({ quality: config.quality });
    } else if (input.toLowerCase().endsWith('.png')) {
      sharpInstance = sharpInstance.png({ quality: config.quality });
    }

    // Save compressed image
    await sharpInstance.toFile(output);

    // Get compressed file size
    const compressedStats = fs.statSync(output);
    const compressedSizeKB = Math.round(compressedStats.size / 1024);
    const savings = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);

    console.log(`   Output: ${output} (${compressedSizeKB}KB)`);
    console.log(`   Savings: ${savings}% (${originalSizeKB - compressedSizeKB}KB saved)`);
    console.log(`   ✅ ${description} compressed successfully!\n`);

    return {
      original: originalSizeKB,
      compressed: compressedSizeKB,
      savings: savings
    };

  } catch (error) {
    console.error(`❌ Error compressing ${imageConfig.description}:`, error.message);
    return null;
  }
}

async function compressAllImages() {
  console.log('🚀 Starting image compression process...\n');
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let successfulCompressions = 0;

  for (const imageConfig of imagesToCompress) {
    const result = await compressImage(imageConfig);
    if (result) {
      totalOriginalSize += result.original;
      totalCompressedSize += result.compressed;
      successfulCompressions++;
    }
  }

  // Summary
  console.log('📊 Compression Summary:');
  console.log(`   Total images processed: ${successfulCompressions}/${imagesToCompress.length}`);
  console.log(`   Total original size: ${totalOriginalSize}KB`);
  console.log(`   Total compressed size: ${totalCompressedSize}KB`);
  console.log(`   Total space saved: ${totalOriginalSize - totalCompressedSize}KB`);
  console.log(`   Average compression: ${Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)}%`);

  console.log('\n🎯 Next steps:');
  console.log('   1. Review the compressed images');
  console.log('   2. Update your HTML to use the optimized versions');
  console.log('   3. Test that images still fit properly in their components');
  console.log('   4. Replace original files with optimized versions if satisfied');
}

// Run the compression
if (require.main === module) {
  compressAllImages().catch(console.error);
}

module.exports = { compressImage, compressAllImages };
