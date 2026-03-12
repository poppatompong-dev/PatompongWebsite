import puppeteer from "puppeteer";
import { buildManifestData } from "./build-manifest.mjs";
import { dataCatalogPath, ensureDir, loadCatalog, loadCredentialProfiles, matchCredentialProfile, projectOutputPaths, writeJson } from "./shared.mjs";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findSelector(page, selectors) {
  for (const selector of selectors) {
    const handle = await page.$(selector);
    if (handle) return selector;
  }
  return null;
}

async function typeIntoFirst(page, selectors, value) {
  const selector = await findSelector(page, selectors);
  if (!selector) return false;
  await page.click(selector, { clickCount: 3 }).catch(() => undefined);
  await page.focus(selector).catch(() => undefined);
  await page.keyboard.down("Control").catch(() => undefined);
  await page.keyboard.press("KeyA").catch(() => undefined);
  await page.keyboard.up("Control").catch(() => undefined);
  await page.type(selector, value, { delay: 25 }).catch(() => undefined);
  return true;
}

async function clickByText(page, texts) {
  return page.evaluate((values) => {
    const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"], input[type="button"]'));
    const target = elements.find((element) => values.some((value) => ((element.textContent || element.getAttribute("value") || "").trim().toLowerCase().includes(value.toLowerCase()))));
    if (!target) return false;
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  }, texts);
}

async function detectLoginState(page) {
  const currentUrl = page.url().toLowerCase();
  if (currentUrl.includes("accounts.google.com") || currentUrl.includes("login") || currentUrl.includes("signin")) {
    return true;
  }

  const bodyText = await page.evaluate(() => (document.body?.innerText || "").slice(0, 5000));
  return /sign in|signin|log in|login|ลงชื่อเข้าใช้|เข้าสู่ระบบ|บัญชี google|google account|choose an account/i.test(bodyText);
}

async function attemptLogin(page, profile) {
  if (!profile) return false;

  if (profile.loginUrl) {
    await page.goto(profile.loginUrl, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => undefined);
    await wait(1500);
  }

  if (profile.email) {
    const emailFilled = await typeIntoFirst(page, [
      'input[type="email"]',
      'input[name="identifier"]',
      'input[name*="email" i]',
      'input[id*="email" i]',
    ], profile.email);

    if (emailFilled) {
      await clickByText(page, ["next", "ถัดไป", "sign in", "continue"]);
      await wait(2000);
    }
  }

  if (profile.username) {
    const usernameFilled = await typeIntoFirst(page, [
      'input[type="text"]',
      'input[name*="user" i]',
      'input[name*="login" i]',
      'input[id*="user" i]',
      'input[id*="login" i]',
    ], profile.username);

    if (usernameFilled) {
      await clickByText(page, ["next", "ถัดไป", "continue"]);
      await wait(1200);
    }
  }

  if (profile.password) {
    const passwordFilled = await typeIntoFirst(page, [
      'input[type="password"]',
      'input[name*="pass" i]',
      'input[id*="pass" i]',
    ], profile.password);

    if (passwordFilled) {
      await clickByText(page, ["sign in", "login", "log in", "เข้าสู่ระบบ", "ลงชื่อเข้าใช้", "next", "ถัดไป", "continue"]);
      await wait(4000);
    }
  }

  return !(await detectLoginState(page));
}

async function captureHero(page, outputPath, width, height) {
  const pageHeight = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0, window.innerHeight));
  await page.screenshot({
    path: outputPath,
    clip: {
      x: 0,
      y: 0,
      width,
      height: Math.min(height, pageHeight),
    },
  });
}

async function captureProject(page, project, profiles) {
  const credentialProfile = matchCredentialProfile(project.url, profiles);
  const captureInfo = {
    status: "pending",
    attemptedAt: new Date().toISOString(),
    finalUrl: project.url,
    credentialProfile: credentialProfile?.label || null,
    error: null,
  };

  if (!project.url) {
    captureInfo.status = "skipped";
    captureInfo.error = "Missing URL";
    return captureInfo;
  }

  if (project.captureStrategy === "cover_only") {
    captureInfo.status = "skipped";
    captureInfo.error = "Configured as cover-only";
    return captureInfo;
  }

  const output = projectOutputPaths(project.id);
  await ensureDir(output.screenshotProjectDir);

  try {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await wait(3000);

    let loginRequired = await detectLoginState(page);
    if (loginRequired && credentialProfile) {
      const loginSucceeded = await attemptLogin(page, credentialProfile);
      if (loginSucceeded) {
        await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => undefined);
        await wait(2500);
      }
      loginRequired = !loginSucceeded && (await detectLoginState(page));
    }

    if (loginRequired) {
      captureInfo.status = "fallback";
      captureInfo.error = "Authentication required";
      captureInfo.finalUrl = page.url();
      await writeJson(output.screenshotMetadataAbsolutePath, captureInfo);
      return captureInfo;
    }

    await wait(2000);
    await page.screenshot({ path: output.desktopScreenshotAbsolutePath, fullPage: true });
    await captureHero(page, output.heroScreenshotAbsolutePath, 1440, 820);

    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await wait(2000);
    await captureHero(page, output.mobileScreenshotAbsolutePath, 430, 932);

    captureInfo.status = "captured";
    captureInfo.finalUrl = page.url();
    await writeJson(output.screenshotMetadataAbsolutePath, captureInfo);
    return captureInfo;
  } catch (error) {
    captureInfo.status = "error";
    captureInfo.error = error instanceof Error ? error.message : String(error);
    try {
      captureInfo.finalUrl = page.url();
    } catch {}
    await writeJson(output.screenshotMetadataAbsolutePath, captureInfo);
    return captureInfo;
  }
}

async function captureProjectWithRetry(page, project, profiles) {
  let latestResult = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    latestResult = await captureProject(page, project, profiles);

    if (latestResult.status !== "error") {
      return {
        ...latestResult,
        attempts: attempt,
      };
    }

    if (attempt < 2) {
      await wait(1500);
    }
  }

  return {
    ...latestResult,
    attempts: 2,
  };
}

async function main() {
  const catalog = await loadCatalog();
  if (!catalog) {
    throw new Error(`Catalog not found at ${dataCatalogPath}. Run 01-build-catalog.mjs first.`);
  }

  const credentialProfiles = await loadCredentialProfiles();
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();

  for (const project of catalog.projects) {
    console.log(`Capturing ${project.id} ${project.projectName}`);
    const result = await captureProjectWithRetry(page, project, credentialProfiles);
    project.capture = {
      ...project.capture,
      ...result,
    };
  }

  await browser.close();
  await writeJson(dataCatalogPath, catalog);
  await buildManifestData();
  console.log("Screenshot capture phase completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
