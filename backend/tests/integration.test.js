const assert = require("assert");
const http = require("http");
const app = require("../src/app");

async function runIntegrationTests() {
  console.log("==================================================");
  console.log("Running JeevanSetu Phase 5 Application Integration Tests");
  console.log("==================================================");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(
        url,
        {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: data ? JSON.parse(data) : null,
              });
            } catch (e) {
              resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: data,
              });
            }
          });
        }
      );
      req.on("error", reject);
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  // 1. Health endpoint
  try {
    const res = await request("/api/health");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    console.log("✔ Test 1: GET /api/health returns 200 OK");
    passed++;
  } catch (err) {
    console.error("✖ Test 1 Failed:", err.message);
    failed++;
  }

  // 2. Public Resources Directory
  try {
    const res = await request("/api/resources");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.data.hospitals !== undefined, "Directory should contain hospitals");
    assert(res.body.data.schemes !== undefined, "Directory should contain schemes");
    assert(res.body.data.ngos !== undefined, "Directory should contain ngos");
    console.log("✔ Test 2: GET /api/resources returns verified directory");
    passed++;
  } catch (err) {
    console.error("✖ Test 2 Failed:", err.message);
    failed++;
  }

  // 3. Public Hospitals list
  try {
    const res = await request("/api/resources/hospitals");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data));
    console.log("✔ Test 3: GET /api/resources/hospitals returns hospital list");
    passed++;
  } catch (err) {
    console.error("✖ Test 3 Failed:", err.message);
    failed++;
  }

  // 4. Public Medicine Master Catalogue
  try {
    const res = await request("/api/inventory/master/medicines");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data));
    console.log("✔ Test 4: GET /api/inventory/master/medicines returns catalogue");
    passed++;
  } catch (err) {
    console.error("✖ Test 4 Failed:", err.message);
    failed++;
  }

  // 5. Public Feedback Submission
  try {
    const res = await request("/api/feedback", {
      method: "POST",
      body: {
        rating: 5,
        category: "phc_visit",
        message: "Excellent prompt triage and consultation at Ashti PHC.",
        is_anonymous: false,
        contact_name: "Rameshwar Patil",
      },
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    console.log("✔ Test 5: POST /api/feedback accepts citizen feedback");
    passed++;
  } catch (err) {
    console.error("✖ Test 5 Failed:", err.message);
    failed++;
  }

  // 6. Feedback Validation Failure
  try {
    const res = await request("/api/feedback", {
      method: "POST",
      body: {
        rating: 10, // Invalid rating > 5
        message: "", // Empty message
      },
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 6: POST /api/feedback rejects invalid rating/empty message with 400");
    passed++;
  } catch (err) {
    console.error("✖ Test 6 Failed:", err.message);
    failed++;
  }

  // 7. Protected Profile Endpoint - Rejects Unauthenticated
  try {
    const res = await request("/api/profile");
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 7: GET /api/profile blocks unauthenticated request (401)");
    passed++;
  } catch (err) {
    console.error("✖ Test 7 Failed:", err.message);
    failed++;
  }

  // 8. Protected Cases Endpoint - Rejects Unauthenticated
  try {
    const res = await request("/api/cases");
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 8: GET /api/cases blocks unauthenticated request (401)");
    passed++;
  } catch (err) {
    console.error("✖ Test 8 Failed:", err.message);
    failed++;
  }

  // 9. Protected Referrals Endpoint - Rejects Unauthenticated
  try {
    const res = await request("/api/referrals");
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 9: GET /api/referrals blocks unauthenticated request (401)");
    passed++;
  } catch (err) {
    console.error("✖ Test 9 Failed:", err.message);
    failed++;
  }

  // 10. Protected Notifications Endpoint - Rejects Unauthenticated
  try {
    const res = await request("/api/notifications");
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 10: GET /api/notifications blocks unauthenticated request (401)");
    passed++;
  } catch (err) {
    console.error("✖ Test 10 Failed:", err.message);
    failed++;
  }

  // 11. Protected Inventory Modification - Rejects Unauthenticated
  try {
    const res = await request("/api/inventory", {
      method: "POST",
      body: {
        phc_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
        medicine_id: "a1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
        current_quantity: 100,
      },
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 11: POST /api/inventory blocks unauthenticated stock modification (401)");
    passed++;
  } catch (err) {
    console.error("✖ Test 11 Failed:", err.message);
    failed++;
  }

  // 12. UUID Parameter Validation
  try {
    const res = await request("/api/facilities/phcs/invalid-id-format");
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Must be a valid UUID"));
    console.log("✔ Test 12: GET /api/facilities/phcs/:id rejects malformed UUID with 400");
    passed++;
  } catch (err) {
    console.error("✖ Test 12 Failed:", err.message);
    failed++;
  }

  server.close();

  console.log("==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests().catch((e) => {
  console.error("Integration test execution error:", e);
  process.exit(1);
});
