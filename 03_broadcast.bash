#!/bin/bash

set -e 
CLI="${CLI:-digibyte-cli}"

echo "Using $CLI to broadcast the transaction..."

rm -f data/txid
ls data/tx_* | while read line; do 
	$CLI sendrawtransaction "$(cat $line)" > data/tmpid

	txid="$(data/tmpid)"

	# Wait for transaction to happen
	node check.js "$txid"

	if [[ "$?" -ne "0" ]]; then
		echo "$txid not confirmed after 100 seconds"
		exit 1
	fi

	echo "$txid" >> data/txid
done


