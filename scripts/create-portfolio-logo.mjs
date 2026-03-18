import sharp from 'sharp';

// Create infinity symbol line art SVG
const infinitySvg = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .infinity-outer {
        fill: none;
        stroke: #1e293b;
        stroke-width: 12;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .infinity-inner {
        fill: none;
        stroke: #475569;
        stroke-width: 6;
      }
      .symbol {
        fill: none;
        stroke: #64748b;
        stroke-width: 3;
      }
    </style>
  </defs>
  
  <!-- Left loop -->
  <ellipse cx="130" cy="200" rx="80" ry="100" class="infinity-outer" />
  <ellipse cx="130" cy="200" rx="60" ry="80" class="infinity-inner" />
  
  <!-- Right loop -->
  <ellipse cx="270" cy="200" rx="80" ry="100" class="infinity-outer" />
  <ellipse cx="270" cy="200" rx="60" ry="80" class="infinity-inner" />
  
  <!-- Center connection -->
  <path d="M 200,200 L 200,200" class="infinity-outer" />
  
  <!-- Left symbol (camera/eye) -->
  <circle cx="130" cy="200" r="35" class="symbol" />
  <circle cx="130" cy="200" r="20" class="symbol" />
  <circle cx="130" cy="200" r="8" fill="#1e293b" />
  
  <!-- Right symbol (network/asterisk) -->
  <line x1="270" y1="170" x2="270" y2="230" class="symbol" />
  <line x1="245" y1="185" x2="295" y2="215" class="symbol" />
  <line x1="245" y1="215" x2="295" y2="185" class="symbol" />
  <circle cx="270" cy="200" r="5" fill="#1e293b" />
</svg>
`;

async function createLogo() {
  try {
    // Create from SVG
    await sharp(Buffer.from(infinitySvg))
      .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile('public/logo-portfolio-lineart.png');
    
    console.log('✅ Created logo-portfolio-lineart.png');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLogo();
