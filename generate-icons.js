import sharp from 'sharp';

async function generate() {
  await sharp('public/icon.svg')
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
  console.log('Generated icon-512.png');

  await sharp('public/feature-graphic.svg')
    .resize(1024, 500)
    .png()
    .toFile('public/feature-graphic.png');
  console.log('Generated feature-graphic.png');

  await sharp('public/icon.svg')
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
  console.log('Generated icon-192.png');

  await sharp('public/icon.svg')
    .resize(512, 512)
    .png()
    .toFile('public/icon-maskable.png');
  console.log('Generated icon-maskable.png');

  await sharp('public/screenshot1.svg')
    .resize(1080, 1920)
    .png()
    .toFile('public/screenshot1.png');
  console.log('Generated screenshot1.png');

  await sharp('public/screenshot2.svg')
    .resize(1080, 1920)
    .png()
    .toFile('public/screenshot2.png');
  console.log('Generated screenshot2.png');
}

generate().catch(console.error);
