const Block = require('./block');
const { blockFromJSON } = require('./block'); 
const { transactionFromJSON } = require('./transaction');
const { rerender } = require('../store');
const { publish, subscribeTo } = require('../network');
const { maxBy, reduce, unfold, reverse, values, prop } = require('ramda');

class Blockchain {
  constructor(name) {
    this.name = name;
    this.genesis = null;
    this.blocks = {};

    this.pendingTransactions = {};

    this.createGenesisBlock();

    subscribeTo('BLOCKS_BROADCAST', ({ blocks, MUTT }) => {
      if (MUTT === this.name) {
        blocks.forEach(block => this._addBlock(blockFromJSON(this, block)));
      }
    });

    subscribeTo('TRANSACTION_BROADCAST', ({ transaction, MUTT }) => {
      if (MUTT === this.name) {
        this.pendingTransactions[transaction.hash] = transactionFromJSON(transaction);
      }
    });

    publish("REQUEST_BLOCKS", { MUTT: this.name });
    subscribeTo("REQUEST_BLOCKS", ({ MUTT }) => {
      if (MUTT === this.name)
        publish("BLOCKS_BROADCAST", {
          MUTT,
          blocks: Object.values(this.blocks).map(b => b.toJSON())
        });
    });
  }

  maxHeightBlock() {
    const blocks = values(this.blocks);
    const maxByHeight = maxBy(prop("height"));
    const maxHeightBlock = reduce(maxByHeight, blocks[0], blocks);
    return maxHeightBlock;
  }

  longestChain() {
    const getParent = x => {
      if (x === undefined) {
        return false;
      }

      return [x, this.blocks[x.parentHash]];
    };
    return reverse(unfold(getParent, this.maxHeightBlock()));
  }

  createGenesisBlock() {
    const block = new Block({
      blockchain: this,
      parentHash: "root",
      height: 1,
      nonce: this.name
    });
    this.blocks[block.hash] = block;
    this.genesis = block;
  }

  containsBlock(block) {
    return this.blocks[block.hash] !== undefined;
  }

  addBlock(newBlock) {
    this._addBlock(newBlock);
    publish("BLOCKS_BROADCAST", {
      blocks: [newBlock.toJSON()],
      MUTT: this.name
    });
  }

  _addBlock(block) {
    if (!block.isValid()) return;
    if (this.containsBlock(block)) return;

    const parent = this.blocks[block.parentHash];
    if (parent === undefined && parent.height + 1 !== block.height) return;

    const isParentMaxHeight = this.maxHeightBlock().hash === parent.hash;

    const newUtxoPool = parent.utxoPool.clone();
    block.utxoPool = newUtxoPool;

    block.utxoPool.addMUTT(block.coinbaseBeneficiary, 12.5);

    const transactions = block.transactions;
    block.transactions = {};
    let containsInvalidTransactions = false;

    Object.values(transactions).forEach(transaction => {
      if (block.isValidTransaction(transaction)) {
        block.addTransaction(transaction);

        if (isParentMaxHeight && this.pendingTransactions[transaction.hash])
          delete this.pendingTransactions[transaction.hash];
      } else {
        containsInvalidTransactions = true;
      }
    });

    if (containsInvalidTransactions) return;

    this.blocks[block.hash] = block;
    rerender();
  }
}
module.exports = Blockchain;