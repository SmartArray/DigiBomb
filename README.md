# DigiBomb
Flood the network with some transactions

```
export CLI=~/digibyte/src/digibyte-cli

# Generate origin address
./01_generate.js

# Send 1 DGB using mobile wallet or so
# ...

# Create transaction that does 1000 outputs
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
