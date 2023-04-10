# A basic transaction ancestry set calculator

## Run Instructions

```nodejs
npm install
npm run start
```

## Env Variables Stub

```.env
BLOCK_HEIGHT=123456 # The block height to calculate the largest ancestry set for
BLOCKSTREAM_API_URL=https://blockstream.info/api # The Blockstream API URL
```

### Code Explanation

This script in index.js retrieves transaction data from a Bitcoin block, constructs a tree of ancestry relationships between the transactions, and then displays the largest ancestry set for the block.

The script starts by importing required packages including dotenv for loading environment variables, axios for making HTTP requests, and print-tree for displaying the ancestry tree.

The script then loads environment variables from a .env file using the dotenv package. It expects BLOCK_HEIGHT and BLOCKSTREAM_API_URL to be defined in the .env file.

The script defines a transactionMap object to store transaction data, and a rootNode object to serve as the root node for the ancestry tree. The rootNode object has an id property set to the block height, and parentMap and parents properties to store ancestry relationships.

The script defines several functions to interact with the Blockstream API, including getBlockHashFromBlockHeight to get the block hash from the block height, and getTransactionsFromBlockHash to get a list of transactions for a given block hash.

The script defines the constructNodes function to create node objects for each transaction in the list, and adds each node to the transactionMap object. The addAncestor function is defined to add the ancestry relationship between a transaction and its ancestors. The getAncestorList function is defined to recursively retrieve the list of all ancestors of a given node.

The script defines the displayAncestryTree function to display the ancestry tree for a given transaction, and the getLargestAncestorTransactionId function to determine the transaction ID for the largest ancestry set for the block.

Finally, the script defines the displayLargestAncestrySet function to display the largest ancestry set for a given transaction, and the displayLargestAncestrySets function to display the largest ancestry set for the block and the entire ancestry tree.

The script wraps the code in an async function and immediately invokes it using an IIFE (Immediately Invoked Function Expression) syntax to start the script execution.