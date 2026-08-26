const assert = require("assert");
const http = require("http");
const app = require("../src/app");
const { requireRole } = require("../src/middleware/auth.middleware");

async function runTests() {
  console.log("==================================================");
  console.log("Running JeevanSetu Phase 4 Backend Auth Tests");
  console.log("==================================================");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  async function makeRequest(path, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(
        url,
        {
          method: "GET",
          headers,
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
      req.end();
    });
  }

  // Test 1: GET /api/health
  try {
    const res = await makeRequest("/api/health");
    assert.strictEqual(res.statusCode, 200, "Health check should return 200");
    assert.strictEqual(res.body.success, true);
    assert(res.body.message.includes("running") || res.body.message.includes("healthy"));
    console.log("✔ Test 1: GET /api/health returns 200 Healthy");
    passed++;
  } catch (err) {
    console.error("✖ Test 1 Failed:", err.message);
    failed++;
  }

  // Test 2: GET /api/auth/me without Authorization header
  try {
    const res = await makeRequest("/api/auth/me");
    assert.strictEqual(res.statusCode, 401, "Should return 401 without auth header");
    assert.strictEqual(res.body.success, false);
    assert(
      res.body.message && res.body.message.includes("Authentication required")
    );
    console.log("✔ Test 2: GET /api/auth/me without token returns 401 Unauthorized");
    passed++;
  } catch (err) {
    console.error("✖ Test 2 Failed:", err.message);
    failed++;
  }

  // Test 3: GET /api/auth/me with invalid token
  try {
    const res = await makeRequest("/api/auth/me", {
      Authorization: "Bearer invalid.fake.token",
    });
    assert.strictEqual(res.statusCode, 401, "Should return 401 with invalid token");
    assert.strictEqual(res.body.success, false);
    console.log("✔ Test 3: GET /api/auth/me with invalid token returns 401 Unauthorized");
    passed++;
  } catch (err) {
    console.error("✖ Test 3 Failed:", err.message);
    failed++;
  }

  // Test 4: requireRole Middleware unit logic
  try {
    // 4a. Matching role
    let nextCalled = false;
    const reqPatient = { user: { id: "p-1" }, role: "patient" };
    const resMock = {
      status(c) {
        this.code = c;
        return this;
      },
      json(data) {
        this.data = data;
        return this;
      },
    };
    const patientMiddleware = requireRole("patient", "district_admin");
    patientMiddleware(reqPatient, resMock, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true, "requireRole should pass for allowed role");

    // 4b. Disallowed role
    nextCalled = false;
    const reqDoctor = { user: { id: "d-1" }, role: "doctor" };
    const phcOnlyMiddleware = requireRole("phc_staff", "district_admin");
    phcOnlyMiddleware(reqDoctor, resMock, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false, "requireRole should block unauthorized role");
    assert.strictEqual(resMock.code, 403, "requireRole should return 403 status");

    console.log("✔ Test 4: Role-Based Authorization Middleware (requireRole) correctly permits & rejects roles");
    passed++;
  } catch (err) {
    console.error("✖ Test 4 Failed:", err.message);
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

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
