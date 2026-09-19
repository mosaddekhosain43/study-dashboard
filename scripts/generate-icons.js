const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function createSvg(size) {
  const padding = size * 0.20;
  const iconSize = size - padding * 2;
  const rx = size * 0.22; // rounded squircle corner

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0e8362" />
        <stop offset="100%" stop-color="#085741" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bgGrad)" />
    
    <g transform="translate(${padding}, ${padding}) scale(${iconSize / 24})">
      <path d="M12 5v16" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="m16 12 2 2 4-4" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 6V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2h4.001A2 2 0 0022 17v-1.344" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>`;
}

async function run() {
  const publicDir = path.join(__dirname, "..", "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targets = [
    { file: "icon.png", size: 512 },
    { file: "icon-512.png", size: 512 },
    { file: "icon-192.png", size: 192 },
    { file: "apple-touch-icon.png", size: 180 },
    { file: "favicon-32x32.png", size: 32 },
    { file: "favicon-16x16.png", size: 16 },
  ];

  for (const t of targets) {
    const svg = Buffer.from(createSvg(t.size));
    const outPath = path.join(publicDir, t.file);
    await sharp(svg).png().toFile(outPath);
    console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
  }

  // Also write SVG icon
  fs.writeFileSync(path.join(publicDir, "icon.svg"), createSvg(512));
  console.log("Generated: icon.svg");

  // Also generate favicon.ico from 32x32 png
  const faviconSvg = Buffer.from(createSvg(48));
  await sharp(faviconSvg).png().toFile(path.join(publicDir, "favicon.ico"));
  console.log("Generated: favicon.ico");
}

run().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
