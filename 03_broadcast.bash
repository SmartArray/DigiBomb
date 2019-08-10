#!/bin/bash

set -e 
CLI="${CLI:-digibyte-cli}"

echo "Using $CLI to broadcast the transaction..."
$CLI sendrawtransaction "$(cat data/tx)" > data/txid


