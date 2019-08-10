# DigiBomb
Flood the network with some transactions

## Installation

```
git clone https://github.com/SmartArray/DigiBomb.git && cd DigiBomb && npm install && chmod u+x *.js *.bash
```

## Configuration
You may change the parameters in ```config.js```

## Usage

```
# You should adapt this path
export CLI=~/digibyte/src/digibyte-cli

# Generate origin address
./01_generate.js

# Send 1 DGB using mobile wallet or so
# ...

# Create transaction that does <CONFIG.ADDRESSES> outputs
./02_tx.js

# Broadcast using cli
./03_broadcast.bash

# Generate transactions
./04_digibomb.js

# Show tx hash
cat data/txid

# Broadcast all transactions
./05_broadcast_bomb.bash
```
