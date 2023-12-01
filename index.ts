import * as puppeteer from "puppeteer";
(async () => {
  const browser = await puppeteer.launch({
    headless: true  ,
    executablePath: "/usr/bin/chromium-browser",
    args: ["--allow-file-access-from-files"],
  });
  const page = await browser.newPage();
  //   await page.setViewport({width: 1080, height: 1024})
  await page.goto("https://www.latimes.com/games/daily-crossword", {});

  //    await page.waitForSelector('#crossword');
  // page.pdf() is currently supported only in headless mode.
  // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
  //   await page.waitForFrame('crossword');
  //   console.log("saw frame");
  var myFrameElement = await page.waitForSelector("iframe#crossword");
  var myFrame = await myFrameElement?.contentFrame();
  // var myFrame = await page.waitForFrame(async frame => {
  //     return (await frame.title()) === 'Daily Crossword';
  //   })
  //   console.log({ myFrame });
  //    var frames = await page.frames();
  //    console.log(await Promise.all(frames.map(async frame=>await frame.title())))
  //   var myFrame = frames.find((f)=>
  //     (await f.title())==="Daily Crossword");
  if (!myFrame) {
    throw new Error("couldn't find frame");
  }
  const button = await myFrame.waitForSelector("div.puzzle-link");
  await button?.evaluate((b) => b.click());
  //   console.log({ element });
  console.log("found first puzzle");

  //   await myFrame.click("div.puzzle-link");
  //   const elements = await myFrameElement?.select("div.puzzle-link");
  const printButton = await myFrame.waitForSelector(".print-selection");
  if (!printButton) {
    throw new Error();
  }
  //   const printElement = printButton.asElement();
  await myFrame.click(".print-selection");
  console.log("clicked print");
  //   await printButton?.evaluate(b=>b.click());

  const actualPrintButton = await myFrame.waitForSelector(
    "button#print-button.btn.btn-default"
  );
  console.log("Found Button");
  //   await myFrame.click("button#print-button.btn.btn-default");

  //await actualPrintButton?.evaluate((b) => b.click());
  // page.click('div.puzzle-link' );

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
