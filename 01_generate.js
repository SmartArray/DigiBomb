#!/usr/bin/env node

const config = require('./config');
const REQUEST_AMOUNT = config.REQUEST_AMOUNT;

const digibyte = require('digibyte');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const PrivateKey = digibyte.PrivateKey;

let privateKey = new PrivateKey();
let address = privateKey.toAddress();

let addressStr = address.toString();
console.log(`Send ${REQUEST_AMOUNT} DGB to ${addressStr}`);
qrcode.generate(`digibyte:${addressStr}?amount=${REQUEST_AMOUNT}`);

fs.writeFileSync('data/input', privateKey);

console.log('');
console.log('Execute the next script after your transaction has one confirmation');
