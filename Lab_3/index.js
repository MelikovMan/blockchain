const fs = require('fs')
function listBalance(client){
    client.listUnspent()
    .then((result)=>{
        const total_sum=result.reduce(
            (accumulator,currentValue)=>accumulator+currentValue.amount,
            0
        );
        console.log(total_sum);
        fs.writeFile("UTXOs.txt",total_sum,function(){return});
    })
    .catch(e=>console.error(e))
}

function returnUTXOs(this_client){
    return this_client.listUnspent()
    .then((result)=>{
        return result.map(element=>{
            return {
                txid:element.txid,
                vout:element.vout,
            }
        })
    })
    .catch(e=>console.error(e))
}
function createSendToOneTransaction(client, toAdr, amount){
    return returnUTXOs(client).then(data=>{
    const outputs = 
    [
        {
            [toAdr]:amount
        }
    ];
    return client.createRawTransaction(data,outputs);
    });
}
function signTransactionWW(client,transaction,timeout=120){
    return client.walletPassphrase(process.env.wallet_pasphrase,timeout).then(()=>
        client.signRawTransactionWithWallet(transaction).then((signed)=>{
            if(!signed.complete) {
                return Promise.reject(signed.error)
            }
            return signed.hex;
        })
    )
}
const Client = require('bitcoin-core');
const client = new Client({
network: 'testnet4',
username:process.env.rpcuser,
password:process.env.rpcpassword,
port: 8332,
wallet: "cool_wallet"
});
listBalance(client);
const toAdr="tb1qxxn9stntupvms4qd5hmfnwhmp2uzcx06er8ty2";
const amount = 0.0045;
createSendToOneTransaction(client,toAdr,amount)
.then(hex=>{
    console.log("Unsigned transaction:\n");
    console.log(hex);
    signTransactionWW(client,hex)
    .then(sign=>{
        console.log("Signed transaction:\n");
        console.log(sign);
        client.sendRawTransaction(sign)
        .then((txid)=>{
            console.log("TX_ID:\n");
            console.log(txid);
            fs.writeFile("txid.txt",txid,function(){return});
        })
        .catch(error=>console.error(error))
    })
    .catch(e=>console.error(e))
})
.catch(err=>console.error(err));