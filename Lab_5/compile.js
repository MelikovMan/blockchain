const PATH = "Greeter.sol";
const fs = require('fs');
const solc = require('solc');

    const input = {
        language: 'Solidity',
        sources: {
            [PATH]: {
                content: fs.readFileSync(PATH,{encoding: "utf-8"})
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = solc.compile(JSON.stringify(input));
    const parsed = JSON.parse(output);
    // Access compiled contract details
    for (let contractName in parsed.contracts[PATH]) {
        console.log(contractName + ': ' + parsed.contracts[PATH][contractName].evm.bytecode.object);
    }

    fs.writeFileSync("output.json", output);