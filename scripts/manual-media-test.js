const fs = require('fs');
const path = require('path');

async function main(){
  const token = fs.readFileSync(path.join(__dirname,'..','temp.jwt'),'utf8').trim();
  const filePath = path.join(__dirname,'..','public','images','homepage1.jpg');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  // Node 18+ provides global fetch and FormData
  const FormData = global.FormData || require('form-data');
  const fetchFn = global.fetch || require('node-fetch');

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', 'IMAGE');
  form.append('title', 'Node Test Upload');
  form.append('description', 'Uploaded via Node test script');

  console.log('Uploading...');
  const res = await fetchFn('http://localhost:3000/api/admin/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  console.log('POST status', res.status);
  let created;
  try { created = await res.json(); console.log('POST response', created); } catch(e){ console.error('No JSON in POST response', e.message); }

  if (!created || !created.id) {
    console.error('Upload did not return created media');
    return;
  }

  const patchBody = { id: created.id, title: 'Node Edited Title', description: 'Edited via node script', order: 2 };
  console.log('Patching id', created.id);
  const p = await fetchFn('http://localhost:3000/api/admin/media', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(patchBody),
  });
  console.log('PATCH status', p.status);
  try { const upd = await p.json(); console.log('PATCH response', upd); } catch(e){ console.error('No JSON in PATCH response', e.message); }
}

main().catch(e=>{ console.error('Error', e); process.exit(1); });
