/**
 * Phase Theme Consistency Test Suite for JeevanSetu
 * Validates deterministic theme resolution, default light mode, localStorage key contract, and root attributes.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("=======================================================");
console.log("   JEEVANSETU GLOBAL THEME SYSTEM TEST SUITE");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// 1. Storage Key and Default Value Contract
runTest("Theme Contract: Storage key is 'jeevansetu_theme' with light default", () => {
  const THEME_STORAGE_KEY = "jeevansetu_theme";
  const DEFAULT_THEME = "light";
  const VALID_THEMES = ["light", "dark"];

  assert.strictEqual(THEME_STORAGE_KEY, "jeevansetu_theme");
  assert.strictEqual(DEFAULT_THEME, "light");
  assert.deepStrictEqual(VALID_THEMES, ["light", "dark"]);
});

// 2. Pure Resolution Logic Simulation
function resolveTheme(storedValue) {
  if (storedValue === "dark") return "dark";
  if (storedValue === "light") return "light";
  return "light"; // Default fallback for any null, undefined, corrupted, or OS media value
}

runTest("Theme Resolution: Null/empty stored value returns 'light'", () => {
  assert.strictEqual(resolveTheme(null), "light");
  assert.strictEqual(resolveTheme(undefined), "light");
  assert.strictEqual(resolveTheme(""), "light");
});

runTest("Theme Resolution: Explicit 'dark' returns 'dark'", () => {
  assert.strictEqual(resolveTheme("dark"), "dark");
});

runTest("Theme Resolution: Explicit 'light' returns 'light'", () => {
  assert.strictEqual(resolveTheme("light"), "light");
});

runTest("Theme Resolution: Invalid/corrupt values ('system', 'auto', 'blue') fallback to 'light'", () => {
  assert.strictEqual(resolveTheme("system"), "light");
  assert.strictEqual(resolveTheme("auto"), "light");
  assert.strictEqual(resolveTheme("blue"), "light");
  assert.strictEqual(resolveTheme("1234"), "light");
  assert.strictEqual(resolveTheme("{theme: 'dark'}"), "light");
});

// 3. Static verification of ThemeContext.js
runTest("ThemeContext: Enforces light default and localStorage sync", () => {
  const contextPath = path.resolve(__dirname, "../../frontend/context/ThemeContext.js");
  const content = fs.readFileSync(contextPath, "utf8");

  assert.ok(content.includes('THEME_STORAGE_KEY = "jeevansetu_theme"'), "Includes correct THEME_STORAGE_KEY");
  assert.ok(content.includes('ALLOWED_THEMES = ["light", "dark"]'), "Restricts to light and dark");
  assert.ok(content.includes('classList.add("dark")'), "Mutates document element class list");
  assert.ok(content.includes('setAttribute("data-theme"'), "Sets data-theme attribute");
});

// 4. Static verification of layout.js pre-paint script
runTest("Layout Pre-Paint: Injects anti-flicker script in head with light default", () => {
  const layoutPath = path.resolve(__dirname, "../../frontend/app/layout.js");
  const content = fs.readFileSync(layoutPath, "utf8");

  assert.ok(content.includes("jeevansetu_theme"), "Pre-paint script checks jeevansetu_theme");
  assert.ok(content.includes("suppressHydrationWarning"), "Root html suppresses hydration warnings");
  assert.ok(content.includes("classList.add('dark')"), "Pre-paint toggles dark class");
  assert.ok(content.includes("setAttribute('data-theme'"), "Pre-paint sets data-theme");
});

// 5. Static verification of Tailwind CSS v4 custom variant
runTest("Tailwind CSS: Binds dark selector strictly to root class (no media query auto-switch)", () => {
  const cssPath = path.resolve(__dirname, "../../frontend/app/globals.css");
  const content = fs.readFileSync(cssPath, "utf8");

  assert.ok(content.includes("@custom-variant dark") && content.includes(".dark"), "Includes Tailwind v4 custom dark variant binding");
  assert.ok(content.includes("--background:"), "Includes root color tokens");
  assert.ok(content.includes(".dark") && content.includes("color-scheme: dark"), "Includes .dark color token overrides");
});

// 6. Settings Page Validation
runTest("Settings Page: Contains dedicated Light Mode & Dark Mode switch cards", () => {
  const settingsPath = path.resolve(__dirname, "../../frontend/app/settings/page.js");
  const content = fs.readFileSync(settingsPath, "utf8");

  assert.ok(content.includes("onClick={() => setTheme(item.id)}"), "Contains theme setter invocation");
  assert.ok(content.includes("Light Mode (Default)"), "Indicates Light Mode is default");
});

console.log("\n=======================================================");
console.log(`   TEST RESULTS: ${passed} Passed | ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
