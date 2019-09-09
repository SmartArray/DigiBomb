#!/bin/bash

CLI="${CLI:-digibyte-cli}"
ls data/tx_* | while read line; do 
	$CLI decoderawtransaction "$(cat $line)" | head | grep txid | tr -d '"' | tr -d ',' | sed 's/txid: //g' | awk '{$1=$1};1'
done