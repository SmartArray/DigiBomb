#!/bin/bash

set -e 
CLI="${CLI:-digibyte-cli}"

echo "Using $CLI to broadcast the transaction..."

rm data/txid
ls data/tx_* | while read line; do 
	$CLI sendrawtransaction "$(cat $line)" >> data/txid
done


