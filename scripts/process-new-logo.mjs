import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';

const INPUT_PATH = 'public/logo-upload-temp.png';
const OUTPUT_PATH = 'public/logo-new.png';

async function processLogo() {
  if (!existsSync(INPUT_PATH)) {
    console.error(`❌ Input file not found: ${INPUT_PATH}`);
    console.log('\nPlease save the uploaded logo image to:');
    console.log(`  ${INPUT_PATH}`);
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  console.log('📸 Processing logo image...');

  try {
    // Load image and get metadata
    const image = sharp(INPUT_PATH);
    const metadata = await image.metadata();
    console.log(`   Original size: ${metadata.width}x${metadata.height}`);

    // Process: remove black background, crop, optimize
    const processed = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = processed;
    const { width, height, channels } = info;

    // Remove black/dark background aggressively (preserve only logo and text)
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate brightness and color saturation
      const brightness = (r + g + b) / 3;
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const saturation = maxChannel - minChannel;

      // Pure black/dark background → fully transparent
      if (brightness < 30) {
        data[i + 3] = 0;
      }
      // Dark gray shadows → fade out
      else if (brightness < 80 && saturation < 30) {
        data[i + 3] = Math.round((brightness / 80) * 255);
      }
      // Keep colored pixels (logo) and bright pixels (text) fully opaque
    }

    // Save processed image with transparency
    await sharp(data, { raw: { width, height, channels } })
      .png({ compressionLevel: 9, quality: 90 })
      .trim() // Auto-crop transparent edges
      .resize(800, null, { // Max width 800px, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(OUTPUT_PATH);

    const outputMeta = await sharp(OUTPUT_PATH).metadata();
    console.log(`   Output size: ${outputMeta.width}x${outputMeta.height}`);
    console.log(`   File size: ${(outputMeta.size / 1024).toFixed(1)} KB`);
    console.log(`✅ Logo processed successfully: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ Error processing logo:', error.message);
    process.exit(1);
  }
}

processLogo();
