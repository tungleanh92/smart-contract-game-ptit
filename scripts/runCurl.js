const { curly } = require('node-libcurl')
const Web3 = require('web3');
const web3 = new Web3('HTTP://127.0.0.1:8545');
const contractABI = require('../artifacts/contracts/Multiply7.sol/Multiply7.json')

// curl --data '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "latest"], "id":2}' -H "Content-Type: application/json" localhost:8545
// curl --data '{"jsonrpc":"2.0","method": "eth_estimateGas", "params": [{"from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "data": "0x6060604052341561000f57600080fd5b60eb8061001d6000396000f300606060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063c6888fa1146044575b600080fd5b3415604e57600080fd5b606260048080359060200190919050506078565b6040518082815260200191505060405180910390f35b60007f24abdb5865df5079dcc5ac590ff6f01d5c16edbc5fab4e195d9febd1114503da600783026040518082815260200191505060405180910390a16007820290509190505600a165627a7a7230582040383f19d9f65246752244189b02f56e8d0980ed44e7a56c0b200458caad20bb0029"}], "id": 5}' -H "Content-Type: application/json" localhost:8545
async function estimateGas() {
    console.log('---------estimateGas---------');
    const { data } = await curly.post('localhost:8545', {
        postFields: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "eth_estimateGas",
            "params": [
                {
                    "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "data": contractABI.bytecode
                }],
            "id": 5
        }
        ),
        httpHeader: [
            'Content-Type: application/json',
        ],
    })
    console.log(data)
    return data
}

async function deploy() {
    let estimateGasResult = await estimateGas()
    console.log('---------deploy---------');
    console.log('estimateGas', estimateGasResult);
    try {
        const { data } = await curly.post('localhost:8545', {
            postFields: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "eth_sendTransaction",
                "params": [
                    {
                        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                        "gas": estimateGasResult.result,
                        "data": contractABI.bytecode
                    }],
                "id": 5
            }
            ),
            httpHeader: [
                'Content-Type: application/json',
            ],
        })
        return data
    } catch (error) {
        console.log(error);
    }
}

async function getTxReceipt() {
    try {
        let deployResult = await deploy()
        console.log('---------getTxReceipt---------');
        console.log('deploy', deployResult);
        const { data } = await curly.post('localhost:8545', {
        postFields: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "eth_getTransactionReceipt",
            "params": [deployResult.result],
            "id": 5
        }
        ),
        httpHeader: [
            'Content-Type: application/json',
        ],
    })
        contractAddress = data.result.contractAddress
        return data
    } catch (error) {
        console.log(error);
    }
}

// curl --data '{"jsonrpc":"2.0","method": "eth_sendTransaction", "params": [{"from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "to": "0x99bba657f2bbc93c02d617f8ba121cb8fc104acf", "data": "0xc6888fa10000000000000000000000000000000000000000000000000000000000000006"}], "id": 8}' localhost:8545
multiply()
async function multiply() {
    // const contractAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1"
    try {
        let getTxReceiptResult = await getTxReceipt()
        console.log('---------multiply---------');
        console.log(getTxReceiptResult.result.contractAddress);
        const myContract = new web3.eth.Contract(
            contractABI.abi,
            getTxReceiptResult.result.contractAddress
        );

        const tx = myContract.methods.multiply(4);
        const txData = tx.encodeABI();

        const {data} = await curly.post('localhost:8545', {
            postFields: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "eth_sendTransaction",
                "params": [{
                    "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    "to": getTxReceiptResult.result.contractAddress,
                    "data": txData
                }],
                "id": 6
            }),
            httpHeader: [
                'Content-Type: application/json',
            ],
        })
        console.log('---------read state---------');
        let rs = await web3.eth.getTransactionReceipt(data.result);
        console.log(rs);
    } catch (error) {
        console.log(error);
    }
}

// curl --data '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "latest"], "id":2}' -H "Content-Type: application/json" localhost:8545