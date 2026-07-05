const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function main(){
  const token = fs.readFileSync(path.join(__dirname,'..','temp.jwt'),'utf8').trim();
  const filePath = path.join(__dirname,'..','public','images','homepage1.jpg');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', 'IMAGE');
  form.append('title', 'Axios Test Upload');
  form.append('description', 'Uploaded via axios test script');

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
    console.log('POST data', res.data);

    const created = res.data;
    const patchBody = { id: created.id, title: 'Axios Edited Title', description: 'Edited via axios script', order: 3 };
    const p = await axios.patch('http://localhost:3000/api/admin/media', patchBody, { headers: { Authorization: `Bearer ${token}` } });
    console.log('PATCH status', p.status);
    console.log('PATCH data', p.data);
  } catch (e) {
    if (e.response) {
      console.error('Response status', e.response.status);
      console.error('Response data', e.response.data);
    } else {
      console.error('Error', e.message);
    }
    process.exit(1);
  }
}

main();
