
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const eslint = require('eslint')
const path = require('path');
const routes = require('./seeds');

// import sequelize connection

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// sync sequelize models to the database, then turn on the server

sequelize.sync({force: false}).then(() => {

app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}!`));
});
=======
const express = require('express');
const app = express();
const Blockchain = require("./blockchain/example"); 


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

let node_id = uuidv4();
app.get('/',function (req,res){
    res.send(JSON.stringify(Blockchain.chain));
});
app.get('/chain',function (req,res){
    res.send(JSON.stringify(Blockchain.chain));
});

app.get('/mine',function (req,res){
    var last_proof;
    let  last_block = Blockchain.last_block();
    if (last_block == 0)
    {
        last_proof = 0;
    }
    else
    {
        last_proof = last_block.proof;
    }
    var proof = Blockchain.proof_of_work(last_proof);

    /*  
        Add a bitcoin for the miner
        0 in sender means it is being mined (no sender, sender is the blockchain)
        recipient is node ID
    */
    var index = Blockchain.new_transaction(0, node_id,1);

    let previous_hash = Blockchain.hash(last_block);
    let block = Blockchain.new_block (proof, previous_hash);

    res.send(JSON.stringify(block));
});

app.post('/transactions/new',function (req,res){
    if (req.query.sender === ''  || req.query.ammount ==="" || req.query.recipient === "")
    {
        res.send("Missing values");
        return;
    } 
    let index = Blockchain.new_transaction(req.query.sender, req.query.recipient, req.query.ammount)
    res.send("Transaction will be added to block " + index);
});

const myArgs = process.argv.slice(2)[0];
console.log('Launching bitnode in port: ', myArgs);

const server = app.listen(myArgs,function(){

});

