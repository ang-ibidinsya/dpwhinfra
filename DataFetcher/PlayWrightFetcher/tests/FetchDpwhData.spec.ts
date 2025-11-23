import { test, expect } from '@playwright/test';
import {regionsList} from './constants';
import {awaitSpinner, sleep} from './utils';
import { chromium } from 'playwright'; // Import the browser type

const fs = require("node:fs/promises");



test('FetchTest', async ({ page }) => {
  await page.goto('https://apps2.dpwh.gov.ph/infra_projects/default.aspx?region=National%20Capital%20Region');

  await expect(page.locator("#UpdateProgress1")).toBeHidden();

  await page.getByLabel('Region').selectOption('Central Office');
  // Wait for spinner to disappear
  console.log("Region Selected");
  const spinner = await page.locator('#UpdateProgress1');
  await awaitSpinner(spinner);
  
  
  await page.getByLabel('Infra Year').selectOption('2023');
  console.log("Infra Selected");
  await awaitSpinner(spinner);
  
  console.log('[Done Waiting] Ready to save page...');

  let pageContent:string = await page.content();

  await fs.writeFile("Output.html", pageContent);
});

test('FetchAll', async ({ page }) => {
  test.setTimeout(6_000_000); // 100mins to fetch all
  await page.goto('https://apps2.dpwh.gov.ph/infra_projects/default.aspx?region=Central%20Office');
  const spinner = await page.locator('#UpdateProgress1');

  await expect(page.locator("#UpdateProgress1")).toBeHidden();
  for (let year = 2025; year >= 2016; year--) {
    console.log('Year:', year);    
    await page.getByLabel('Infra Year').selectOption((year).toString());
    await sleep(2000);
    await awaitSpinner(spinner);    
    for (let i = 0; i < regionsList.length; i++) {
      let region = regionsList[i];
      console.log('Fetching Region', region);
      await page.getByLabel('Region').selectOption(region);
      await sleep(2000);
      await awaitSpinner(spinner);
      console.log('Saving Page', region);
      let pageContent:string = await page.content();
      await fs.writeFile(`${year}-${region}.html`, pageContent);
    }    
  }
});

// Manually launch a browser and connect to it 
// Go to http://localhost:9222/json/list to find the websocketURL (need to do each test)
test('FetchAllManualBrowserInstace', async ({ page: originalPage }) => {
  test.setTimeout(6_000_000); // 100mins to fetch all  
  const wsURL = 'ws://localhost:9222/devtools/page/FDD2FD3F76F37A8FB969A5FFE2A312AA'; // Your WS URL
  //const browser = await chromium.connectOverCDP(wsURL);
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const defaultContext = browser.contexts()[0];
  //const connectedPage = await defaultContext.newPage();
  const existingPages = defaultContext.pages();
  const preparedPage = existingPages[1]; 

  await originalPage.close();
  //await preparedPage.goto('https://apps2.dpwh.gov.ph/infra_projects/default.aspx?region=Central%20Office');
  const spinner = await preparedPage.locator('#UpdateProgress1');

  var currUrl = preparedPage.url();
  await expect(preparedPage.locator("#UpdateProgress1")).toBeHidden();
  for (let year = 2025; year >= 2016; year--) {
    console.log('Year:', year);    
    await preparedPage.getByLabel('Infra Year').selectOption((year).toString());
    await sleep(2000);
    await awaitSpinner(spinner);    
    for (let i = 0; i < regionsList.length; i++) {
      let region = regionsList[i];
      console.log('Fetching Region', region);
      await preparedPage.getByLabel('Region').selectOption(region);
      await sleep(2000);
      await awaitSpinner(spinner);
      console.log('Saving Page', region);
      let pageContent:string = await preparedPage.content();
      await fs.writeFile(`${year}-${region}.html`, pageContent);
    }    
  }
});