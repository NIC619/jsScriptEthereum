"use strict";
exports.__esModule = true;
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "infura_api_key");
var wallet = new ethers_1.ethers.Wallet("private_key", provider);
console.log(wallet.address);
provider.getBlockNumber().then(function (block_number) {
    console.log(block_number);
    return provider.getBalance(wallet.address);
}).then(function (balance) {
    console.log(balance.toString());
    // console.log(ethers.utils.parseEther("1.0"));
    console.log(ethers_1.ethers.utils.formatEther(balance));
    return provider.getTransactionCount(wallet.address);
}).then(function (nonce) {
    console.log(nonce);
    var raw_tx = {
        nonce: nonce,
        to: "receiver_address",
        value: ethers_1.ethers.utils.parseEther("0.01"),
        gasLimit: 21000,
        gasPrice: ethers_1.ethers.utils.parseEther("0.000000001") // 1G wei
    };
    return wallet.signTransaction(raw_tx);
}).then(function (signed_tx) {
    // console.log(signed_tx);
    return wallet.provider.sendTransaction(signed_tx);
}).then(function (tx_res) {
    console.log(tx_res["hash"]);
});
