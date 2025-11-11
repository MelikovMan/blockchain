const {Web3} = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const keythereum = require("keythereum");
const PWD_1 = process.env.ACC1_PWD;
const PWD_2 = process.env.ACC2_PWD;
const datadir = "C:/Users/roma_/dev-chain-dir";
const address_1 = "0x89EA56A4a89b2584b7B26AD89102E0e5273Bc5dC";
const keystrore_1 = "UTC--2025-10-30T11-07-25.004845000Z--89ea56a4a89b2584b7b26ad89102e0e5273bc5dc"
const address_2 = "0x83fce69d3dbfb9fb95d02f89ff913f869238185c";
const fs = require('fs');
const rawTransaction = {
    "from": address_1, // Keystore account id
    "to": address_2, // Account you want to transfer to
    "value": web3.utils.toWei("1", "ether"),
    "data": '',
    "chainId": 1337 // Geth --dev network id
};

async function signAndSendTransaction(partialTransaction, privateKay){
    try {
        if (!partialTransaction.nonce)
            partialTransaction.nonce = await web3.eth.getTransactionCount(partialTransaction.from,'pending');
        if (!partialTransaction.chainId)
            partialTransaction.chainId = await web3.eth.getChainId();
        const suggestion_gas = await web3.eth.getGasPrice();
        const estimate_gas = await web3.eth.estimateGas(partialTransaction)
        const transaction = {
            ...partialTransaction,
            gasLimit: web3.utils.toHex(estimate_gas),
            maxPriorityFeePerGas: web3.utils.toHex(suggestion_gas),
            maxFeePerGas: web3.utils.toHex(suggestion_gas)
        }
        const signedTx = await web3.eth.accounts.signTransaction(transaction,privateKay);
        console.log("Tranasaction signed!", signedTx);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Tr receipt: ", receipt);
        return receipt;

    } catch (error) {
        console.error("Error signing transaction: " + error)
    }
}
function createContract(jsonFilePath, fileName, contractName, address="") {
    const source = fs.readFileSync(jsonFilePath);
    const contracts = JSON.parse(source)["contracts"];
// ABI description as JSON structure
    const abi = contracts[fileName][contractName].abi;
// Smart contract EVM bytecode as hex
    const code = '0x' + contracts[fileName][contractName].evm.bytecode.object;
    if (address)
        return {
            contract: new web3.eth.Contract(abi,address),
            code:code,
        };
    else 
        return {
            contract: new web3.eth.Contract(abi),
            code:code,
        };
    
}
async function deployContractFromNaught(myContract, code, ...deployArgs){
    const deployment = myContract.deploy({
        data:code,
        arguments:deployArgs
    });
    const estimated_gas = await deployment.estimateGas();
    const suggestion_gas = await web3.eth.getGasPrice();
    deployment
    .send({
        from: (await web3.eth.getAccounts())[0], // The address the transaction should be sent from.
        gas: estimated_gas, // (optional): The maximum gas provided for this transaction (gas limit).
        gasPrice: suggestion_gas // (optional): The gas price in wei to use for this transaction.
    }, function(error, transactionHash){ console.error(error)})
        .on('error', function(error){console.error(error) })
        .on('transactionHash', function(transactionHash){ })
        .on('receipt', function(receipt){
            console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', function(confirmationNumber, receipt){ })
            .then(function(newContractInstance){
                console.log(newContractInstance.options.address)
                 // instance with the new contract address
                 fs.writeFileSync("contract-address.md", newContractInstance.options.address);
            });

}
async function deployContract(myContract, code, address, privateKey, ...deployArgs){
    const deployment = myContract.deploy({
        data:code,
        arguments:deployArgs
    }).encodeABI();
    const tx = {
        from: address,
        data: deployment,
        chainId: 1337
    };
    return (await signAndSendTransaction(tx,privateKey));
    

}
async function callImpureFunction(address, key, contract, method_name,  ...method_params){
    const func = contract._methods[method_name];
    const func_arg = func.apply(this,method_params);
    const encodedABI = func_arg.encodeABI();
    const tx = {
    from: address,
    to: contract.options.address,
    data: encodedABI,
    chainId: 1337
  };
  await signAndSendTransaction(tx,key);
}

async function transferERC20(myContract, from_addr, from_key, to_addr,amount){
    myContract._methods.balanceOf(from_addr).call()
    .then((value)=>{
        console.log("Amount in from account:" ,value);
        if (value < amount)
            throw new Error("Insufficent funds!");
    });
    myContract._methods.balanceOf(to_addr).call()
    .then((value)=>{
        console.log("Amount in to account:" ,value);
    });
    await callImpureFunction(from_addr,from_key,myContract,"transfer",to_addr,amount);
    myContract._methods.balanceOf(to_addr).call()
    .then((value)=>{
        console.log("New amount in to account:" ,value);
    });
        myContract._methods.balanceOf(from_addr).call()
    .then((value)=>{
        console.log("New amount in from account:" ,value);
    });
}
try {
    const keyFile = fs.readFileSync(`${datadir}/keystore/${keystrore_1}`, {encoding: "utf-8"});
    const dk = keythereum.recover(PWD_1,JSON.parse(keyFile));
    const privateKay = '0x' + dk.toString('hex');
    const metamaskaddr = "0x41070bCb696406a11ab1Fa49BDF637F303C30DE2"
    const contractAddr = "0x3294e36eeb00cd95788420c0f90dd5e17ccdc314"
    const {contract, code} = createContract("output-smart.json","ETCToken.sol","GLDToken", contractAddr)
    transferERC20(contract,address_1,privateKay,metamaskaddr,Web3.utils.toWei("0.001", 'ether')).then(()=>
        console.log("Transfer-done")
    )
    //signAndSendTransaction(rawTransaction, privateKay)
    /*const contract = createContract("output.json","Greeter.sol","Greeter",contractAddr).contract
    contract._methods.getGreet().call()
    .then(console.log)
    callImpureFunction(address_1,privateKay,contract,"setGreet","Hello, Eth").then(()=>{
            contract._methods.getGreet().call()
            .then(console.log)
    })*/
    
} catch (err) {
    console.error('Error opening file: ', err)
}