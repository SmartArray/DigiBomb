#!/usr/bin/env node

const config = require('./config');
const ADDRESSES = config.ADDRESSES;
const EACH = config.EACH;
const HOST = config.HOST; //'https://digiexplorer.info/api'; 
const MAX_OUTPUTS = config.MAX_OUTPUTS;
const SATOSHI = 100000000;

const digibyte = require('digibyte');
const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const PrivateKey = digibyte.PrivateKey;
const Transaction = digibyte.Transaction;

console.log('Generating private keys...');
const privateKeys = new Array(ADDRESSES).fill(null).map(() => new PrivateKey());

const input = fs.readFileSync('data/input').toString().trim();
console.log(`Using private key ${input} as an input`);
const inputKey = new PrivateKey(input);

fs.writeFileSync('data/outputs', privateKeys.map(val => val.toString()).join('\n'));

function generateTxId(tx) {
	const h = tx.serialize();
	const buffer = Buffer.from(h, 'hex');
	const hash1 = crypto.createHash('sha256').update(buffer).digest();
	const hash2 = crypto.createHash('sha256').update(hash1).digest().reverse().toString('hex');
	return hash2;
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

const doIt = (async () => {
	const addr = inputKey.toAddress().toString();
	console.log(`Fetching address utxo for ${addr}...`);
	const address = await fetch(`${HOST}/addr/${addr}`);
	const json = await address.json();

	if (json.transactions.length == 0) {
		console.error('No transaction found');
		process.exit(1);
	}

	var firstTx = json.transactions[0];
	if (process.argv[2]) {
		firstTx = process.argv[2]
		console.log(`Using ${firstTx} instead of ${json.transactions[0]}`);
	}

	const utxoResp = await fetch(`${HOST}/tx/${firstTx}`);
	const json2 = await utxoResp.json();
	const u = json2.vout.find(u => u.scriptPubKey.addresses.indexOf(addr) >= 0);

	var utxo = {
		txId: firstTx,
		outputIndex: u.n,
		address: addr, // input
		script: u.scriptPubKey.hex,
		satoshis: parseFloat(u.value) * SATOSHI
	};

	var counter = 0;

	for (let i = 0; i < ADDRESSES; ) {
		var tx = new Transaction().from(utxo)

		for (let b = 0; b < MAX_OUTPUTS && i + b < ADDRESSES; ++b) {
			const priv = privateKeys[i + b];
			tx = tx.to(priv.toAddress(), parseInt(Math.round(EACH * SATOSHI)));
		}

		tx = tx.change(addr)
		if (!tx.isFullySigned()) {
			throw 'Some tx was not fully signed';
		}

		// Use change output utxo for next transaction
		const changeOutput = tx.outputs[tx.outputs.length - 1];

		utxo = {
			txId: generateTxId(tx),
			outputIndex: tx.outputs.length - 1,
			address: addr,
			script: changeOutput._script,
			satoshis: changeOutput._satoshis
		}

		console.log('txid', utxo.txId);

		// Save tx
		tx = tx.sign(new PrivateKey(input));
		fs.writeFileSync(`data/tx_${counter.pad(5)}`, tx.serialize());

		i += MAX_OUTPUTS;
		++counter;		
	}

	console.log('Transaction(s) generated!');
	console.log('Execute the next script in order to broadcast your tx(s)');
});

doIt();
