import { test, expect } from '@playwright/test';

// Just swallow exception.
// If page loads too fast, Playwright not able to catch spinner.
export const awaitSpinner = async (spinner) => {
    // a. Try to find Spinner
    console.warn("[Spinner] Trying to find Spinner");
    try {
      await expect(spinner).toHaveCSS('display', 'block');
    }
    catch(err) {
      console.warn("[Warning] Was not able to see spinner displayed");
    }

    // b. Make sure spinner is not visible
    console.warn("[Spinner] Trying to wait til Spinner is hidden");
    try {
        await expect(spinner).toHaveCSS('display', 'none', { timeout: 600_000 });  
      }
      catch(err) {
        console.warn("[Warning] Was not able to see spinner hidden");
      }
  }

export const sleep = async (ms) => {
  await new Promise(r => setTimeout(r, ms));
}