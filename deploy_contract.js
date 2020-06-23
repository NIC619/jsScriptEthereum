"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "infura_api_key");
var wallet = new ethers_1.ethers.Wallet("private_key", provider);
console.log(wallet.address);
var ERC20_json_1 = __importDefault(require("./ERC20.json"));
var factory = new ethers_1.ethers.ContractFactory(ERC20_json_1["default"].abi, ERC20_json_1["default"].bytecode, wallet);
var name = "token_name";
var symbol = "token_symbol";
var decimal = 6;
var init_supply = ethers_1.ethers.utils.parseUnits("1.0", 18);
factory.deploy(name, symbol, decimal, init_supply).then(function (contract) {
    console.log(contract.address);
    console.log(contract.deployTransaction);
});
