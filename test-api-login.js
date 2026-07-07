async function testLoginAPI() {
  // Use environment-provided test passwords to avoid committing secrets.
  const testCases = [];
  const adminPass = process.env.TEST_ADMIN_PASSWORD;
  const modPass = process.env.TEST_MODERATOR_PASSWORD;
  const userPass = process.env.TEST_USER_PASSWORD;

  if (adminPass) testCases.push({ email: 'admin@delamere.com', password: adminPass });
  if (modPass) testCases.push({ email: 'moderator@delamere.com', password: modPass });
  if (userPass) testCases.push({ email: 'user@delamere.com', password: userPass });
  // Add a negative test if admin password is available
  if (adminPass) testCases.push({ email: 'admin@delamere.com', password: 'WrongPassword' });

  if (testCases.length === 0) {
    console.warn('No TEST_*_PASSWORD environment variables set. Skipping login API tests.');
    return;
  }

  console.log('🧪 Testing Login API Endpoint\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.email} with password "${testCase.password}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testCase.email,
          password: testCase.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ SUCCESS (${response.status})`);
        console.log(`   Token: ${data.token ? data.token.substring(0, 20) + '...' : 'N/A'}`);
        console.log(`   User: ${data.user?.email}`);
      } else {
        console.log(`❌ FAILED (${response.status})`);
        console.log(`   Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    console.log();
  }
}

testLoginAPI();
