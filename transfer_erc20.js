"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "YOUR_INFURA_API_KEY");
var wallet = new ethers_1.ethers.Wallet("YOUR_PRIVATE_KEY", provider);
console.log(wallet.address);
var ERC20_json_1 = __importDefault(require("./ERC20.json"));
var contractAddress = "CONTRACT_ADDRESS";
var erc20Contract = new ethers_1.ethers.Contract(contractAddress, ERC20_json_1["default"].abi, provider);
var contractSigner = erc20Contract.connect(wallet);
erc20Contract.balanceOf(wallet.address).then(function (balance) {
    console.log(balance.toString());
    var receiver = "RECEIVER_ADDRESS";
    return contractSigner.transfer(receiver, ethers_1.ethers.utils.parseUnits("1.0", 6));
}).then(function (tx) {
    console.log(tx);
});
