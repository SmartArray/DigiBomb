#!/usr/bin/env node

const config = require('./config');
const ADDRESSES = config.ADDRESSES;
const EACH = config.EACH;
const HOST = config.HOST; //'https://digiexplorer.info/api'; 
const SATOSHI = 100000000;

const digibyte = require('digibyte');
const fs = require('fs');
const fetch = require('node-fetch');

const PrivateKey = digibyte.PrivateKey;
const Transaction = digibyte.Transaction;

console.log('Generating private keys...');
const privateKeys = new Array(ADDRESSES).fill(null).map(() => new PrivateKey());

const input = fs.readFileSync('data/input').toString();
console.log(`Using private key ${input} as an input`);
const inputKey = new PrivateKey(input);

fs.writeFileSync('data/outputs', privateKeys.map(val => val.toString()).join('\n'));

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
	console.log(u);

	/*
	 *   {
	 *       value: '1.00000000',
	 *           n: 1,
	 *               scriptPubKey: {
	 *                     asm: '0 0020a05f26ade5d71c3695ccd2dd0b3e95a3e565',
	 *                           hex: '00140020a05f26ade5d71c3695ccd2dd0b3e95a3e565',
	 *                                 reqSigs: 1,
	 *                                       type: 'witness_v0_keyhash',
	 *                                             addresses: [Array]
	 *                                                 }
	 *                                                   }
	 *                                                   */
	const utxo = {
		txId: firstTx,
		outputIndex: u.n,
		address: addr,
		script: u.scriptPubKey.hex,
		satoshis: parseFloat(u.value) * SATOSHI
	};

	console.log(utxo);

	console.log('Creating transaction...');

	var tx = new Transaction()
		.from(utxo)


	for (const priv of privateKeys) {
		tx = tx.to(priv.toAddress(), parseInt(Math.round(EACH * SATOSHI)));
	}

	tx = tx
		.change(addr)
		.sign(new PrivateKey(input));

	console.log(tx);

	fs.writeFileSync('data/tx', tx.serialize());

	console.log('Tx generated!');
	console.log('Execute the next script in order to broadcast your tx');
});

doIt();




