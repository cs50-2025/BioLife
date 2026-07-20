const sharp = require('sharp');

sharp('public/icon.svg')
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png')
  .then(() => console.log('512 done'))
  .catch(err => console.error(err));

sharp('public/icon.svg')
  .resize(192, 192)
  .png()
  .toFile('public/icon-192.png')
  .then(() => console.log('192 done'))
  .catch(err => console.error(err));

sharp('public/icon.svg')
  .resize(512, 512)
  .png()
  .toFile('public/icon-maskable.png')
  .then(() => console.log('maskable done'))
  .catch(err => console.error(err));
