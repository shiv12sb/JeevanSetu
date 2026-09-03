const fs = require('fs');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN environment variable');
  process.exit(1);
}

const apkPath = 'build-artifacts/JeevanSetu-v1.0.0.apk';
if (!fs.existsSync(apkPath)) {
  console.error(`APK file not found at ${apkPath}`);
  process.exit(1);
}

const apkData = fs.readFileSync(apkPath);
const sizeMb = (apkData.length / (1024 * 1024)).toFixed(2);
console.log(`📦 Preparing to upload ${apkPath} (${sizeMb} MB) to GitHub Release...`);

function apiRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  try {
    // 1. Fetch release details for v1.0.0-apk
    console.log('🔍 Fetching release tag v1.0.0-apk...');
    const releaseRes = await apiRequest({
      hostname: 'api.github.com',
      path: '/repos/shiv12sb/JeevanSetu/releases/tags/v1.0.0-apk',
      method: 'GET',
      headers: {
        'User-Agent': 'JeevanSetu-APK-Uploader',
        'Authorization': `Bearer ${token}`
      }
    });

    if (releaseRes.statusCode !== 200) {
      console.error(`Failed to fetch release (HTTP ${releaseRes.statusCode}): ${releaseRes.body}`);
      process.exit(1);
    }

    const release = JSON.parse(releaseRes.body);
    console.log(`✓ Release found: ID ${release.id}, name: "${release.name}"`);

    // 2. Remove previous APK asset if it exists
    if (release.assets && release.assets.length > 0) {
      for (const asset of release.assets) {
        if (asset.name === 'JeevanSetu-v1.0.0.apk' || asset.name.endsWith('.apk')) {
          console.log(`🗑️ Removing existing asset ${asset.name} (ID: ${asset.id})...`);
          await apiRequest({
            hostname: 'api.github.com',
            path: `/repos/shiv12sb/JeevanSetu/releases/assets/${asset.id}`,
            method: 'DELETE',
            headers: {
              'User-Agent': 'JeevanSetu-APK-Uploader',
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`✓ Removed old asset.`);
        }
      }
    }

    // 3. Upload the APK file
    const uploadUrlRaw = release.upload_url.replace('{?name,label}', '');
    const uploadUrl = new URL(uploadUrlRaw);
    uploadUrl.searchParams.set('name', 'JeevanSetu-v1.0.0.apk');

    console.log(`🚀 Uploading new APK to: ${uploadUrl.origin}${uploadUrl.pathname}...`);
    const uploadRes = await apiRequest({
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + uploadUrl.search,
      method: 'POST',
      headers: {
        'User-Agent': 'JeevanSetu-APK-Uploader',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': apkData.length
      }
    }, apkData);

    if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
      const assetJson = JSON.parse(uploadRes.body);
      console.log(`🎉 SUCCESS! APK uploaded to GitHub Release!`);
      console.log(`📥 Direct Download URL: ${assetJson.browser_download_url}`);
    } else {
      console.error(`Upload failed (HTTP ${uploadRes.statusCode}): ${uploadRes.body}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during upload:', err);
    process.exit(1);
  }
}

main();
