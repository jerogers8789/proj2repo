const sha256 = require('crypto-js/sha256');
const MUTTPool = require('./MUTTPool');
const {map} = require('ramda');
const {transactionFromJSON} = require('./Transaction');

const DIFFICULTY = 5;

class Block {
    constructor(options) {
        const {
            blockchain,
            parentHash,
            height,
            nonce,
            muttPool,
            transactions,
            coinbaseBeneficiary
        } = {
            coinbaseBeneficiary: 'root',
            nonce: '',
            muttPool: new muttPool(),
            transctions: {},
            ...options
        };
        this.blockchain = blockchain;
        this.nonce = nonce;
        this.parentHash = parentHash;
        this.height = height;
        this.coinbaseBeneficiary = coinbaseBeneficiary;
        this.muttPool = muttPool;
        this.transactions = map(transactionFromJSON)(transactions);
        this._setHash();
        this.expanded = true;
    }
    isRoot() {
        return this.parentHash === 'root';
    }
    isValid() {
        return (
            this.isRoot() || (this.hash.substr(-DIFFICULTY)=== '0'.repeat(DIFFICULTY) &&
            this.hash === this._calculateHash())
        );
    }
    createChild(coinbaseBeneficiary) {
        const block = new Block({
            blockchain: this.blockchain,
            parentHash: this.hash,
            height: this.height + 1,
            muttPool: this.muttPool.clone(),
            coinbaseBeneficiary
        });
        block.muttPool.addMUTT(coinbaseBeneficiary, 12.5);
        return block;
    }
    addTransaction(transaction) {
        if (!this.isValidTransaction(transaction)) return;
        this.transactions[transaction.hash] = transaction;
        this.muttPool.handleTransaction(transaction, this.coinbaseBeneficiary);
        this._setHash();
    }
    isValidTransaction(transaction) {
        return (
            this.muttPool.isValidTransaction(transaction) &&
            transaction.hasValidSignature()
        );
    }
    addingTransactionErrorMessage(transaction) {
        if (!transaction.hasValidSignature()) return 'Signature not valid';
        return this.muttPool.addingTransactionErrorMessage(transaction);
    }
    setNonce(nonce) {
        this.nonce = nonce;
        this._setHash();
    }
    combinedTransactionHash() {
        if (Object.values(this.transactions).length === 0)
        return 'No Transaction in Block';
        return sha256(
            Object.values(this.transactions)
            .map(tx => tx.hash)
            .join('')
        );
    }
    toJSON() {
        return {
            hash: this.hash,
            nonce: this.nonce,
            parentHash: this.parentHash,
            height: this.height,
            coinbaseBeneficiary: this.coinbaseBeneficiary,
            transactions: map(transaction => transaction.toJSON(), this.transactions)
        };
    }
    _setHash() {
        this.hash = this._calculateHash();
    }
    _calculateHash() {
        return sha256(
            this.nonce +
            this.parentHash +
            this.coinbaseBeneficiary +
            this.combinedTransactionHash()
        ).toString();
    }
}
module.exports = Block;

export function blockFromJSON(blockchain, data) {
    return new Block({
        ...data,
        blockchain
    });
}