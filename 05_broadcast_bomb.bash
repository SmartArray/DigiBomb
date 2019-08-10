#!/bin/bash

set -e 
CLI="${CLI:-digibyte-cli}"

ls data/tx_* | while read line; do 
	echo "Using $CLI to broadcast the transaction..."
	filename=`basename $line`;

	$CLI sendrawtransaction "$(cat $line)" > data/txid_$filename
done


