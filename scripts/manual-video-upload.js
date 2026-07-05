const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function main(){
  const tokenPath = path.join(__dirname,'..','temp.jwt');
  if (!fs.existsSync(tokenPath)) {
    console.error('Missing temp.jwt - create a temp admin token first');
    process.exit(1);
  }
  let token = '';
  try {
    token = fs.readFileSync(tokenPath,'utf8').trim();
  } catch (e) {
    console.error('Failed to read token:', e && e.message);
    console.error(e && e.stack);
    process.exit(1);
  }

  // Default to a Playwright test artifact video if present
  const defaultVideo = path.join(__dirname,'..','test-results','admin-media-Admin-media-op-50c57-em-optimistic-edit-persists-Mobile-Safari','video.webm');
  const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultVideo;

  console.log('Uploading file:', filePath);
  if (!fs.existsSync(filePath)) {
    console.error('Video file not found:', filePath);
    process.exit(1);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', 'VIDEO');
  form.append('title', 'Manual Video Upload');
  form.append('description', 'Uploaded via manual-video-upload.js');

  try {
    const res = await axios.post('http://localhost:3000/api/admin/media', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    console.log('POST status', res.status);
    console.log('POST data', JSON.stringify(res.data));
  } catch (e) {
    console.error('Upload failed');
    try { console.error('Error name:', e.name); } catch (_) {}
    try { console.error('Error message:', e.message); } catch (_) {}
    try { console.error('Error code:', e.code); } catch (_) {}
    try { console.error('Error toJSON:', e.toJSON ? e.toJSON() : '<no toJSON>'); } catch (_) {}
    if (e.response) {
      try { console.error('Response status', e.response.status); } catch (_) {}
      try { console.error('Response data', JSON.stringify(e.response.data)); } catch (_) {}
    }
    if (e.errors && Array.isArray(e.errors)) {
      console.error('AggregateError.errors:');
      e.errors.forEach((er, i) => {
        console.error(i, er && er.stack ? er.stack : er && er.message ? er.message : er);
      });
    }
    console.error(e && e.stack ? e.stack : e.message || e);
    process.exit(1);
  }
}

main();
