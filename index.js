import * as dotenv from "dotenv";
import axios from "axios";
// import printTree from "print-tree";

dotenv.config();

const { BLOCK_HEIGHT, BLOCKSTREAM_API_URL } = process.env;

const transactionMap = {};
const rootNode = {
  id: BLOCK_HEIGHT,
  parentMap: {},
  parents: [],
};

const getBlockHashFromBlockHeight = async (blockHeight) => {
  try {
    const config = {
      method: "get",
      url: `${BLOCKSTREAM_API_URL}/block-height/${blockHeight}`,
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data: blockHash } = await axios(config);
    return blockHash;
  } catch (error) {
    console.log("Error fetching block hash from block height", error);
    return null;
  }
};

const getTransactionsFromBlockHash = async (blockHash) => {
  const upToTransactionCount = 25;
  let startIndex = 0;
  let allTransactions = [];

  while (true) {
    try {
      const config = {
        method: "get",
        url: `${BLOCKSTREAM_API_URL}/block/${blockHash}/txs/${
          startIndex * upToTransactionCount
        }`,
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data: transactions } = await axios(config);
      allTransactions = allTransactions.concat(transactions);
      startIndex++;
    } catch (error) {
      break;
    }
  }

  return allTransactions;
};

const constructNodes = (transactions, node) => {
  const nodes = [];
  transactions.forEach((transaction) => {
    if (!transactionMap[transaction.txid]) {
      const currentNode = {
        id: transaction.txid,
        parentMap: {},
        parents: [],
        vin: transaction.vin,
      };

      nodes.push(currentNode);
      transactionMap[transaction.txid] = currentNode;
    }
  });

  node.parentMap = transactionMap;
  node.parents = node.parents.concat(nodes);

  return nodes;
};

const addAncestor = (transaction, node) => {
  const currentNode = transactionMap[transaction.txid];
  if (currentNode && !node.parentMap[currentNode.id]) {
    node.parentMap[currentNode.id] = currentNode;
    node.parents.push(currentNode);
    currentNode.vin.forEach((inputTxn) => addAncestor(inputTxn, node));
  }
};

const getAncestorList = (node) => {
  let list = [node];
  Object.keys(node.parentMap).forEach((transaction) => {
    list = list.concat(getAncestorList(node.parentMap[transaction]));
  });
  return list;
};

const displayAncestryTree = (transactionId, limit = null) => {
  console.log(`Ancestry set for transaction ${transactionId}: \n`);
  const listLimit = limit || transactionMap[transactionId].list.length;
  const list = transactionMap[transactionId].list.slice(0, listLimit);
  console.log(" -" + list.map((node) => node.id).join("\r\n -"));
  console.log("\n");
};

const getLargestAncestorTransactionId = (transactionMap) => {
  let largestAncestrySetLength = -1;
  let largestAncestrySetTxId = null;
  console.log(
    `Ancestry set for all transactions in the block ${BLOCK_HEIGHT}: \n`
  );
  Object.keys(transactionMap).forEach((transactionId) => {
    const list = getAncestorList(transactionMap[transactionId]);
    transactionMap[transactionId].list = list.slice(1);
    if (list.length > largestAncestrySetLength) {
      largestAncestrySetLength = list.length;
      largestAncestrySetTxId = transactionId;
    }
    displayAncestryTree(transactionId);
  });
  return largestAncestrySetTxId;
};

const displayLargestAncestrySet = (transactionId, limit = 10) => {
  console.log("Largest Ancestry Set - 10 transactions: \n");
  displayAncestryTree(transactionId, limit);
};

const displayLargestAncestrySets = () => {
  const largestAncestorTxId = getLargestAncestorTransactionId(transactionMap);
  displayLargestAncestrySet(largestAncestorTxId);
  // printTree(
  //   rootNode,
  //   (rootNode) => rootNode.id,
  //   (rootNode) => rootNode.parents
  // );
};

(async () => {
  try {
    const blockHash = await getBlockHashFromBlockHeight(BLOCK_HEIGHT);
    let allBlockTransactions = await getTransactionsFromBlockHash(blockHash);
    allBlockTransactions = allBlockTransactions.slice(1);
    const nodes = constructNodes(allBlockTransactions, rootNode);
    nodes.forEach((node) => {
      node.vin.forEach((inputTxn) => addAncestor(inputTxn, node));
    });
    displayLargestAncestrySets();
  } catch (error) {
    console.log(error);
  }
})();
