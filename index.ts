import * as puppeteer from "puppeteer";
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
    args: ["--allow-file-access-from-files"],
  });
  const page = await browser.newPage();

  await page.goto("https://www.latimes.com/games/daily-crossword", {});

  //Waiting for ads to finish
  var myFrameElement = await page.waitForSelector("iframe#crossword");
  var myFrame = await myFrameElement?.contentFrame();
  if (!myFrame) {
    throw new Error("couldn't find frame");
  }
  //Getting most recent crossword
  const button = await myFrame.waitForSelector("div.puzzle-link");
  await button?.evaluate((b) => b.click());

  //Click print button
  const printButton = await myFrame.waitForSelector(".print-selection");
  if (!printButton) {
    throw new Error();
  }
  await myFrame.click(".print-selection");

  //Wait for print popup button
  const actualPrintButton = await myFrame.waitForSelector(
    "button#print-button.btn.btn-default"
  );

  //Find new page that gets opened by the button
  const pageTarget = page.target();
  await actualPrintButton?.evaluate((b) => b.click());
  const newTarget = await browser.waitForTarget(
    (target) => target.opener() === pageTarget
  );
  const newPage = await newTarget.page();

  await newPage?.waitForSelector(".crossword");
  await newPage?.pdf({
    path: "crosswordOut.pdf",
    format: "letter",
  });

  await browser.close();
})();
