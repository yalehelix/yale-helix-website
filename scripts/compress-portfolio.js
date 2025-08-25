const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration for portfolio images - maintaining original dimensions
const portfolioConfig = {
  // High quality compression while preserving dimensions
  quality: 85,
  compressionLevel: 9,
  adaptiveFiltering: true
};

// List of portfolio images to compress
const portfolioImages = [
  {
    input: 'public/assets/img/masonry-portfolio/upkeepcare.png',
    output: 'public/assets/img/masonry-portfolio/upkeepcare-optimized.png',
    description: 'UpkeepCare Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/luminous2.png',
    output: 'public/assets/img/masonry-portfolio/luminous2-optimized.png',
    description: 'Luminous2 Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/luminous.png',
    output: 'public/assets/img/masonry-portfolio/luminous-optimized.png',
    description: 'Luminous Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/lucidcare.png',
    output: 'public/assets/img/masonry-portfolio/lucidcare-optimized.png',
    description: 'LucidCare Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/fulcrum-care2.png',
    output: 'public/assets/img/masonry-portfolio/fulcrum-care2-optimized.png',
    description: 'Fulcrum Care2 Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/fulcrum-care.png',
    output: 'public/assets/img/masonry-portfolio/fulcrum-care-optimized.png',
    description: 'Fulcrum Care Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/epitet.png',
    output: 'public/assets/img/masonry-portfolio/epitet-optimized.png',
    description: 'Epitet Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/enlighten.png',
    output: 'public/assets/img/masonry-portfolio/enlighten-optimized.png',
    description: 'Enlighten Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/ctrltrial.png',
    output: 'public/assets/img/masonry-portfolio/ctrltrial-optimized.png',
    description: 'CtrlTrial Portfolio'
  },
  {
    input: 'public/assets/img/masonry-portfolio/ceidon.png',
    output: 'public/assets/img/masonry-portfolio/ceidon-optimized.png',
    description: 'Ceidon Portfolio'
  }
];

async function compressPortfolioImage(imageConfig) {
  try {
    const { input, output, description } = imageConfig;
    
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

    // Get original image dimensions
    const originalImage = sharp(input);
    const metadata = await originalImage.metadata();
    
    console.log(`   Original dimensions: ${metadata.width}x${metadata.height}px`);

    // Compress PNG while preserving original dimensions
    await originalImage
      .png({ 
        quality: portfolioConfig.quality,
        compressionLevel: portfolioConfig.compressionLevel,
        adaptiveFiltering: portfolioConfig.adaptiveFiltering
      })
      .toFile(output);

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
      savings: savings,
      dimensions: `${metadata.width}x${metadata.height}px`
    };

  } catch (error) {
    console.error(`❌ Error compressing ${imageConfig.description}:`, error.message);
    return null;
  }
}

async function compressAllPortfolioImages() {
  console.log('🚀 Starting portfolio image compression process...\n');
  console.log('📐 Note: All images will maintain their original dimensions\n');
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let successfulCompressions = 0;

  for (const imageConfig of portfolioImages) {
    const result = await compressPortfolioImage(imageConfig);
    if (result) {
      totalOriginalSize += result.original;
      totalCompressedSize += result.compressed;
      successfulCompressions++;
    }
  }

  // Summary
  console.log('📊 Portfolio Compression Summary:');
  console.log(`   Total images processed: ${successfulCompressions}/${portfolioImages.length}`);
  console.log(`   Total original size: ${totalOriginalSize}KB`);
  console.log(`   Total compressed size: ${totalCompressedSize}KB`);
  console.log(`   Total space saved: ${totalOriginalSize - totalCompressedSize}KB`);
  console.log(`   Average compression: ${Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)}%`);

  console.log('\n🎯 Next steps:');
  console.log('   1. Review the compressed portfolio images');
  console.log('   2. Update your HTML to use the optimized versions');
  console.log('   3. Verify that images still fit properly in their components');
  console.log('   4. Replace original files with optimized versions if satisfied');
  console.log('\n💡 Benefits:');
  console.log('   - Images maintain exact same dimensions');
  console.log('   - Components will look identical');
  console.log('   - Significant file size reduction');
  console.log('   - Better loading performance');
}

// Run the compression
if (require.main === module) {
  compressAllPortfolioImages().catch(console.error);
}

module.exports = { compressPortfolioImage, compressAllPortfolioImages };
