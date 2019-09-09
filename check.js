const config = require('./config');
const fetch = require('node-fetch');
const HOST = config.HOST;

const args = process.argv.slice(2);
if (args.length == 0) process.exit(1);

sleep = (ms) => {
  return new Promise((fulfill, reject) => {
    setTimeout(fulfill, ms);
  });
}

const doIt = (async () => {
  const txid = args[0];
  var max = 10;

  console.log(`Observing ${txid}...`);

  while (max > 0) {
    const url = `${HOST}/tx/${txid}`;
    console.log(`Checking ${url}`);
    const resp = await fetch(url);

    try {
      const json = await resp.json();
      if (json.hash) process.exit(0);
    } catch(e) {
      //
    }

    await sleep(10000);
    max -= 1;
  }

  process.exit(1);
});

doIt();