async function testLoginAPI() {
  const testCases = [
    { email: 'admin@delamere.com', password: 'AdminPassword123!' },
    { email: 'moderator@delamere.com', password: 'ModeratorPassword123!' },
    { email: 'user@delamere.com', password: 'UserPassword123!' },
    { email: 'admin@delamere.com', password: 'WrongPassword' }
  ];

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
