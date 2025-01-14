import { test, expect } from '@playwright/test';
import {regionsList} from './constants';
import {awaitSpinner, sleep} from './utils';

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
  await page.goto('https://apps2.dpwh.gov.ph/infra_projects/default.aspx?region=National%20Capital%20Region');
  const spinner = await page.locator('#UpdateProgress1');

  await expect(page.locator("#UpdateProgress1")).toBeHidden();
  for (let year = 2024; year >= 2016; year--) {
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