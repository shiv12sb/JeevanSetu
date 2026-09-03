const fs = require('fs');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('❌ Missing GITHUB_TOKEN environment variable');
  process.exit(1);
}

const apkPath = 'build-artifacts/JeevanSetu-v1.0.0.apk';
if (!fs.existsSync(apkPath)) {
  console.error(`❌ APK file not found at ${apkPath}`);
  process.exit(1);
}

const stat = fs.statSync(apkPath);
const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
console.log(`📦 Found APK: ${apkPath} (${sizeMb} MB)`);

function apiRequest(options, writeData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (writeData) req.write(writeData);
    req.end();
  });
}

async function main() {
  try {
    const repo = 'shiv12sb/JeevanSetu';
    const tag = 'v1.0.0-apk';

    console.log(`🔍 Checking if release "${tag}" exists on ${repo}...`);
    let releaseRes = await apiRequest({
      hostname: 'api.github.com',
      path: `/repos/${repo}/releases/tags/${tag}`,
      method: 'GET',
      headers: {
        'User-Agent': 'JeevanSetu-APK-Uploader',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let release;
    if (releaseRes.statusCode === 200) {
      release = JSON.parse(releaseRes.body);
      console.log(`✓ Existing release found: ID ${release.id}`);
    } else {
      console.log(`ℹ️ Release not found (status ${releaseRes.statusCode}). Creating release "${tag}"...`);
      const createRes = await apiRequest({
        hostname: 'api.github.com',
        path: `/repos/${repo}/releases`,
        method: 'POST',
        headers: {
          'User-Agent': 'JeevanSetu-APK-Uploader',
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({
        tag_name: tag,
        name: 'JeevanSetu Android APK v1.0.0',
        body: '## 📱 JeevanSetu Native Android Application\n\nOfficial Android APK with real-time 108 Emergency Ambulance tracking, Verified Doctor Directory, ABHA ID storage, and Multilingual AI Voice Assistant for Maharashtra.',
        draft: false,
        prerelease: false
      }));

      if (createRes.statusCode >= 200 && createRes.statusCode < 300) {
        release = JSON.parse(createRes.body);
        console.log(`✓ Created new release: ID ${release.id}`);
      } else {
        throw new Error(`Failed to create release (status ${createRes.statusCode}): ${createRes.body}`);
      }
    }

    // Remove any existing APK assets from this release
    if (release.assets && release.assets.length > 0) {
      for (const asset of release.assets) {
        if (asset.name.toLowerCase().endsWith('.apk')) {
          console.log(`🗑️ Removing previous APK asset: ${asset.name} (ID: ${asset.id})...`);
          await apiRequest({
            hostname: 'api.github.com',
            path: `/repos/${repo}/releases/assets/${asset.id}`,
            method: 'DELETE',
            headers: {
              'User-Agent': 'JeevanSetu-APK-Uploader',
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          console.log(`✓ Previous asset removed.`);
        }
      }
    }

    // Upload the APK asset to the upload URL
    const uploadUrlRaw = release.upload_url.replace('{?name,label}', '');
    const uploadUrl = new URL(uploadUrlRaw);
    uploadUrl.searchParams.set('name', 'JeevanSetu-v1.0.0.apk');

    console.log(`🚀 Uploading ${sizeMb} MB APK to ${uploadUrl.origin}${uploadUrl.pathname}...`);

    await new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(apkPath);
      const req = https.request({
        hostname: uploadUrl.hostname,
        path: uploadUrl.pathname + uploadUrl.search,
        method: 'POST',
        headers: {
          'User-Agent': 'JeevanSetu-APK-Uploader',
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Length': stat.size
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`Upload finished with HTTP status: ${res.statusCode}`);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const asset = JSON.parse(body);
              console.log('====================================================');
              console.log('🎉 SUCCESS! APK ATTACHED TO GITHUB RELEASE!');
              console.log(`📥 Direct Download Link: ${asset.browser_download_url}`);
              console.log('====================================================');
              resolve();
            } catch (e) {
              console.log('Uploaded successfully.');
              resolve();
            }
          } else {
            console.error(`Upload error: ${body}`);
            reject(new Error(`Upload failed with status code ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      fileStream.pipe(req);
    });

  } catch (err) {
    console.error('❌ Error during release asset upload:', err.message || err);
    process.exit(1);
  }
}

main();
