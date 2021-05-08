
const SHA256 = require("crypto-js/sha256");

class Block {
    constructor(timestamp, data, previousHash = '') {
      this.previousHash = previousHash;
      this.timestamp = timestamp;
      this.data = data;
          
          // When creating a new Block, automatically calculate its hash.
      this.hash = this.calculateHash();
    }
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
      this.chain = [this.createGenesisBlock()];
    }
    createGenesisBlock() {
        return new Block("05/03/2021", "First Block", "0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    addBlock(newBlock){

        // The new block needs to point to the hash of the latest block on the chain.
      newBlock.previousHash = this.getLatestBlock().hash;
        
        // Calculate the hash of the new block
      newBlock.hash = newBlock.calculateHash();
    
        // Now the block is ready and can be added to chain!
        this.chain.push(newBlock);
    }
    
}

let exaltCoin = new Blockchain();
exaltCoin.addBlock(new Block("", { amount: 4 }));
exaltCoin.addBlock(new Block("", { amount: 10 }));
console.log(JSON.stringify(exaltCoin, null, 4))
=======
class crypto = require("crypto");

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.newBlock();
    }

