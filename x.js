import {chromium} from 'playwright';
import ngrok from 'ngrok';

const BROWSER_PORT = 9222;


const testUrl = process.argv[2];

console.log(testUrl);


const browser = await chromium.launch({
    headless: true,
    args: [
        '--no-sandbox',
        `--remote-debugging-port=${BROWSER_PORT}`,
        '--remote-debugging-address=0.0.0.0',
        '--remote-allow-origins=*',
    ],
});

const url = await ngrok.connect({ addr: BROWSER_PORT, host_header: `localhost:${BROWSER_PORT}` });
console.log(url);



const context = await browser.newContext();
const page = await context.newPage();
await page.goto(testUrl);
const response = await fetch(`http://localhost:9222/json`);
console.log(response);
const data = await response.json();
console.log(data);
const devUrl = url + data[0].devtoolsFrontendUrl.replace('ws=localhost:9222', url.replace('https://', 'wss='));
console.log(devUrl);
 const visibleFrames = await page.locator('iframe').filter({ visible: true }).all();
    const lastSnapshotFrames = visibleFrames.map(frame => frame.contentFrame());

    const snapshots = await Promise.all([
      page.locator('html').ariaSnapshot({ ref: true }),
      ...lastSnapshotFrames.map(async (frame, index) => {
        const snapshot = await frame.locator('html').ariaSnapshot({ ref: true });
        const args = [];
        const src = await frame.owner().getAttribute('src');
        if (src)
          args.push(`src=${src}`);
        const name = await frame.owner().getAttribute('name');
        if (name)
          args.push(`name=${name}`);
        return `\n# iframe ${args.join(' ')}\n` + snapshot.replaceAll('[ref=', `[ref=f${index}`);
      })
    ]);

    console.log(snapshots.join('\n'));

while (true) {
    await new Promise((resolve, reject) => { setTimeout(() => { resolve(); }, 1000); });
}
await browser.close();