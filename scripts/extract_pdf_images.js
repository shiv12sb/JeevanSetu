const fs = require('fs');
const zlib = require('zlib');
const { PNG } = require('pngjs');
const path = require('path');

const pdfPath = path.join(__dirname, '../assets/media_1787940817137.pdf');
const buf = fs.readFileSync(pdfPath);
const str = buf.toString('binary');

// Find objects with FlateDecode and image properties
const objRegex = /(\d+)\s+0\s+obj\s*<<([^>]+)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
const objects = {};

while ((match = objRegex.exec(str)) !== null) {
  const id = parseInt(match[1]);
  const dictStr = match[2];
  const streamBuf = Buffer.from(match[3], 'binary');
  objects[id] = { id, dictStr, streamBuf };
}

console.log('Total stream objects:', Object.keys(objects).length);

// Parse image streams
for (const id in objects) {
  const obj = objects[id];
  if (obj.dictStr.includes('/Subtype/Image') || (obj.dictStr.includes('/Width') && obj.dictStr.includes('/Height'))) {
    const widthM = obj.dictStr.match(/\/Width\s+(\d+)/);
    const heightM = obj.dictStr.match(/\/Height\s+(\d+)/);
    const csM = obj.dictStr.match(/\/ColorSpace\/([A-Za-z]+)/);
    const smaskM = obj.dictStr.match(/\/SMask\s+(\d+)\s+0\s+R/);
    
    if (widthM && heightM) {
      const width = parseInt(widthM[1]);
      const height = parseInt(heightM[1]);
      const isRGB = !csM || csM[1] === 'DeviceRGB';
      const isGray = csM && csM[1] === 'DeviceGray';
      
      console.log(`Obj ${id}: ${width}x${height}, cs=${csM ? csM[1] : 'none'}, smask=${smaskM ? smaskM[1] : 'none'}`);
      
      try {
        const decompressed = zlib.inflateSync(obj.streamBuf);
        obj.decompressed = decompressed;
        obj.width = width;
        obj.height = height;
        obj.isRGB = isRGB;
        obj.isGray = isGray;
        obj.smaskId = smaskM ? parseInt(smaskM[1]) : null;
      } catch (err) {
        console.error(`Error decompressing obj ${id}:`, err.message);
      }
    }
  }
}

// Now save composite images (RGB + Alpha mask)
for (const id in objects) {
  const obj = objects[id];
  if (obj.decompressed && obj.isRGB) {
    const png = new PNG({ width: obj.width, height: obj.height, hasAlpha: true });
    let maskData = null;
    if (obj.smaskId && objects[obj.smaskId] && objects[obj.smaskId].decompressed) {
      maskData = objects[obj.smaskId].decompressed;
    }
    
    for (let y = 0; y < obj.height; y++) {
      for (let x = 0; x < obj.width; x++) {
        const idx = (obj.width * y + x);
        const rgbIdx = idx * 3;
        const pngIdx = idx * 4;
        
        png.data[pngIdx] = obj.decompressed[rgbIdx];
        png.data[pngIdx + 1] = obj.decompressed[rgbIdx + 1];
        png.data[pngIdx + 2] = obj.decompressed[rgbIdx + 2];
        png.data[pngIdx + 3] = maskData ? maskData[idx] : 255;
      }
    }
    
    const outPath = path.join(__dirname, `../assets/extracted_img_${id}_${obj.width}x${obj.height}.png`);
    fs.writeFileSync(outPath, PNG.sync.write(png));
    console.log(`Saved extracted image: ${outPath}`);
  }
}
