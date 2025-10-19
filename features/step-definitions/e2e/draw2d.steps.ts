import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import waitOn from 'wait-on';
import treeKill from 'tree-kill';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

setDefaultTimeout(120_000);

const SERVER_URL = 'http://localhost:4200/';
const DRAW_URL = SERVER_URL + 'draw';
const ROOT_DIR = path.resolve(__dirname, '../../..');

let serverProc: ChildProcess | null = null;
let serverExited = false;
let driver: WebDriver | null = null;

function spawnShell(command: string, cwd: string) {
  // Use shell true for Windows compatibility
  return spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
}

async function ensureServerRunning() {
  // If already started by us, just wait until up
  if (serverProc && !serverExited) {
    await waitOn({ resources: [SERVER_URL], timeout: 120_000, validateStatus: (s: number) => s >= 200 && s < 400 });
    return;
  }

  // Try to see if an external server is already up
  try {
    await waitOn({ resources: [SERVER_URL], timeout: 2_000, validateStatus: (s: number) => s >= 200 && s < 400 });
    return;
  } catch {
    // Not up, continue to start
  }

  // Start Angular dev server from repo root
  serverProc = spawnShell('npm run start', ROOT_DIR);
  serverExited = false;
  serverProc.on('exit', (code, signal) => {
    serverExited = true;
    // eslint-disable-next-line no-console
    console.log(`Angular dev server exited with code ${code}, signal ${signal}`);
  });

  // Wait until server becomes available
  await waitOn({ resources: [SERVER_URL], timeout: 120_000, validateStatus: (s: number) => s >= 200 && s < 400 });
}

async function ensureDriver() {
  if (driver) return;

  const options = new chrome.Options()
    .addArguments('--headless=new', '--window-size=1280,900', '--disable-gpu', '--no-sandbox');

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options as any)
    .build();
}

BeforeAll(async () => {
  // Nothing mandatory here; server will be lazily started by the step
});

AfterAll(async () => {
  if (driver) {
    try { await driver.quit(); } catch {}
    driver = null;
  }
  if (serverProc && !serverExited) {
    try { treeKill(serverProc.pid!, 'SIGTERM'); } catch {}
    serverProc = null;
  }
});

// Background
Given('the application dev server is running', async function () {
  await ensureServerRunning();
});

Given('I am on the Draw2d page', async function () {
  await ensureDriver();
  assert(driver);
  await driver!.get(DRAW_URL);

  // Wait for canvas to be present and visible
  const canvas = await driver!.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver!.wait(until.elementIsVisible(canvas), 20_000);
});

// Scenario: Page loads and renders the canvas
Then('the canvas should be visible', async function () {
  assert(driver);
  const canvas = await driver!.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  const visible = await canvas.isDisplayed();
  assert.strictEqual(visible, true);
});

Then('the canvas drawing surface should be greater than zero', async function () {
  assert(driver);
  const size = await driver!.executeScript(() => {
    const c = document.querySelector('canvas.canv') as HTMLCanvasElement | null;
    return c ? { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight } : null;
  });
  assert.ok(size, 'Canvas element not found');
  const { width, height } = size as any;
  assert.ok(width > 0, 'canvas.width should be > 0');
  assert.ok(height > 0, 'canvas.height should be > 0');
});

Then('the property size panel should be visible', async function () {
  assert(driver);
  const sidenav = await driver!.findElement(By.css('#property-size'));
  assert.strictEqual(await sidenav.isDisplayed(), true);
});

// Scenario: Draw, select, clear
When('I draw a rectangle from {int},{int} to {int},{int} on the canvas', async function (x1: number, y1: number, x2: number, y2: number) {
  assert(driver);
  const canvas = await driver!.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver!.wait(until.elementIsVisible(canvas), 20_000);

  await driver!.actions({ async: true })
    .move({ origin: canvas, x: x1, y: y1 })
    .press()
    .move({ origin: canvas, x: x2, y: y2 })
    .release()
    .perform();

  await driver!.sleep(300);
});

When('I switch to the select tool', async function () {
  assert(driver);
  // Try by value first
  try {
    const toggle = await driver!.wait(until.elementLocated(By.css('mat-button-toggle[value="select"]')), 5_000);
    await toggle.click();
    return;
  } catch {
    // fall back
  }
  // Fallback by icon text
  const selectIconBtn = await driver!.findElement(
    By.xpath("//mat-button-toggle[.//mat-icon[normalize-space(text())='select_all']]")
  );
  await selectIconBtn.click();
});

When('I click at {int},{int} on the canvas', async function (x: number, y: number) {
  assert(driver);
  const canvas = await driver!.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver!.wait(until.elementIsVisible(canvas), 20_000);

  await driver!.actions({ async: true })
    .move({ origin: canvas, x, y })
    .click()
    .perform();
});

Then('the width and height inputs should be visible', async function () {
  assert(driver);
  const widthInput = await driver!.wait(until.elementLocated(By.css('input[title=\"width\"]')), 10_000);
  const heightInput = await driver!.wait(until.elementLocated(By.css('input[title=\"height\"]')), 10_000);
  assert.strictEqual(await widthInput.isDisplayed(), true);
  assert.strictEqual(await heightInput.isDisplayed(), true);
});

When('I clear all elements in the UI', async function () {
  assert(driver);
  const clearBtn = await driver!.findElement(
    By.xpath("//button[.//mat-icon[normalize-space(text())='clear_all']]")
  );
  await clearBtn.click();
  await driver!.sleep(300);
});

Then('the width and height inputs should not be present', async function () {
  assert(driver);
  const inputs = await driver!.findElements(By.css('input[title=\"width\"], input[title=\"height\"]'));
  assert.strictEqual(inputs.length, 0, 'size inputs should be removed after clearing');
});
