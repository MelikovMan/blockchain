const PATH = "ETCToken.sol";
const fs = require('fs');
const solc = require('solc');
const path = require('path')

function findImports(importPath) {
      // Check if it's an npm package path
      if (importPath.startsWith('@')) {
        try {
          const resolvedPath = require.resolve(importPath, { paths: [path.resolve(__dirname, 'node_modules')] });
          return { contents: fs.readFileSync(resolvedPath, 'utf8') };
        } catch (e) {
          return { error: 'File not found: ' + importPath };
        }
      } else {
        try {
            const localPath = path.resolve(__dirname, importPath);
            return { contents: fs.readFileSync(localPath, 'utf8') };
        } catch (e) {
            return { error: 'File not found: ' + importPath };
        }
      }
    }

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

    const output = solc.compile(JSON.stringify(input), { import: findImports });
    const parsed = JSON.parse(output);
    // Access compiled contract details
    for (let contractName in parsed?.contracts[PATH]) {
        console.log(contractName + ': ' + parsed.contracts[PATH][contractName].evm.bytecode.object);
    }

    fs.writeFileSync("output-smart.json", output);