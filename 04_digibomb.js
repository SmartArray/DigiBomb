#!/usr/bin/env node

const config = require('./config');
const REQUEST_AMOUNT = config.REQUEST_AMOUNT;

const ADDRESSES = config.ADDRESSES;
const EACH = config.EACH;
const HOST = config.HOST; 
const RECEIVE_ADDR = config.RECEIVE_ADDRESS;
const MAX_OUTPUTS = config.MAX_OUTPUTS;

const SATOSHI = 100000000;

const digibyte = require('digibyte');
const fs = require('fs');
const fetch = require('node-fetch');

const PrivateKey = digibyte.PrivateKey;
const Transaction = digibyte.Transaction;

const txhashes = fs.readFileSync('data/txid').toString().split('\n').map(l => l.trim());
const privKeys = fs.readFileSync('data/outputs').toString().trim().split('\n').map(l => new PrivateKey(l));

const doIt = (async () => {
	console.log('Creating transactions...');
	var counter = 0;

	for (const txhashIdx in txhashes) {
		const txhash = txhashes[txhashIdx];
		const url = `${HOST}/tx/${txhash}`;
		console.log(`Fetching ${url} ...`)
		const resp = await fetch(url);
		const json = await resp.json();

		const utxos = json.vout;

		var max = MAX_OUTPUTS;
		if (txhashIdx == txhashes.length - 1) {
			max = ADDRESSES % MAX_OUTPUTS;
		}

		for (var i = 0; i < max; ++i) {
			var utxo = {
				txId: txhash,
				outputIndex: i,
				address: utxos[i].scriptPubKey.addresses[0],
				script: utxos[i].scriptPubKey.hex,
				satoshis: parseInt(Math.round(parseFloat(utxos[i].value) * SATOSHI))
			};

			var tx = new Transaction()
				.from(utxo)
				.to(RECEIVE_ADDR, 1000)
				.change(RECEIVE_ADDR)
				.sign(privKeys)

			let bytes = tx.serialize().length / 2 / 1000.0;
			let fee = bytes * Transaction.FEE_PER_KB + Transaction.DUST_AMOUNT + 15;

			if (fee > utxo.satoshis) {
				console.error("Not enough balance to pay fees");
				process.exit(1);
			}	
		
			tx = tx
				.clearOutputs()
				.to(RECEIVE_ADDR, utxo.satoshis - fee)
				.sign(privKeys)
				.fee(fee);

			console.log(`\rGenerating tx no. ${counter}/${ADDRESSES}`);
			counter++;

			fs.writeFileSync(`data/bomb_${txhashIdx}_${i}`, tx.serialize());
		}
	}

	console.log(`${ADDRESSES} transaction(s) generated`);
	console.log("Proceed with the next script (broadcast all tx)");
});

doIt();