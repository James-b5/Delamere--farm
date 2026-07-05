import axios from "axios";

const BASE_URL = "http://localhost:3000";
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXE1MTRzMWkwMDAwcDBnd2I5cXl3czJmIiwiZW1haWwiOiJhZG1pbkBkZWxhbWVyZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTg5MDAwMDAsImV4cCI6MTcxODk4NjQwMH0";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`,
  },
});

async function testAdminFeatures() {
  console.log("🧪 Testing Admin Dashboard Features...\n");

  const tests = [
    {
      name: "Admin Dashboard Page",
      method: "GET",
      endpoint: "/admin",
      expectStatus: 200,
    },
    {
      name: "Admin Orders Page",
      method: "GET",
      endpoint: "/admin/orders",
      expectStatus: 200,
    },
    {
      name: "Admin Products Page",
      method: "GET",
      endpoint: "/admin/products",
      expectStatus: 200,
    },
    {
      name: "Admin New Product Page",
      method: "GET",
      endpoint: "/admin/products/new",
      expectStatus: 200,
    },
    {
      name: "Admin Users Page",
      method: "GET",
      endpoint: "/admin/users",
      expectStatus: 200,
    },
    {
      name: "Admin Bookings Page",
      method: "GET",
      endpoint: "/admin/bookings",
      expectStatus: 200,
    },
    {
      name: "Admin Messages Page",
      method: "GET",
      endpoint: "/admin/messages",
      expectStatus: 200,
    },
    {
      name: "Admin Analytics Page",
      method: "GET",
      endpoint: "/admin/analytics",
      expectStatus: 200,
    },
    {
      name: "Admin Settings Page",
      method: "GET",
      endpoint: "/admin/settings",
      expectStatus: 200,
    },
    {
      name: "Analytics API",
      method: "GET",
      endpoint: "/api/admin/analytics",
      expectStatus: 200,
    },
    {
      name: "Products API",
      method: "GET",
      endpoint: "/api/admin/products",
      expectStatus: 200,
    },
    {
      name: "Orders API",
      method: "GET",
      endpoint: "/api/admin/orders",
      expectStatus: 200,
    },
    {
      name: "Users API",
      method: "GET",
      endpoint: "/api/admin/users",
      expectStatus: 200,
    },
    {
      name: "Bookings API",
      method: "GET",
      endpoint: "/api/admin/bookings",
      expectStatus: 200,
    },
    {
      name: "Messages API",
      method: "GET",
      endpoint: "/api/admin/messages",
      expectStatus: 200,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await api({
        method: test.method,
        url: test.endpoint,
      });

      if (response.status === test.expectStatus) {
        console.log(`✅ ${test.name}: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expectStatus}, got ${response.status}`);
        failed++;
      }
    } catch (error: any) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
}

testAdminFeatures();
