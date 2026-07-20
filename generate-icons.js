import sharp from 'sharp';

async function generate() {
  await sharp('public/icon.svg')
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
  console.log('Generated icon-512.png');

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
}

generate().catch(console.error);
