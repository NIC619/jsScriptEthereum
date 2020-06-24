"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "infura_api_key");
var wallet = new ethers_1.ethers.Wallet("private_key", provider);
// Factory
// Factory contract is used to generate token pair contract and query token pair contract address
// import factoryContractJSON from "./IUniswapV2Factory.json";
// const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// const uniswapFactoryContract = new ethers.Contract(factoryAddress, factoryContractJSON.abi, provider);
// uniswapFactoryContract.allPairsLength().then(pairLength => {
//     console.log(pairLength.toString());
//     return uniswapFactoryContract.getPair(tt1Address, tt2Address);
// }).then(tt1tt2PairAddress => {
//     console.log(tt1tt2PairAddress);
// });
// Pair
// Our tt1/tt2 pair contract
var IUniswapV2Pair_json_1 = __importDefault(require("./IUniswapV2Pair.json"));
var tt1tt2PairAddress = "0x34460716ea801C5EF2080B978aE6d2BD42F1929B";
var pairContract = new ethers_1.ethers.Contract(tt1tt2PairAddress, IUniswapV2Pair_json_1["default"].abi, provider);
var pairContractSigner = pairContract.connect(wallet);
// RouterV2
// Library provided by uniswap to interact with pair, e.g., add/remove liquidity and swap tokens
var IUniswapV2Router02_json_1 = __importDefault(require("./IUniswapV2Router02.json"));
var routerV2Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
var routerV2Contract = new ethers_1.ethers.Contract(routerV2Address, IUniswapV2Router02_json_1["default"].abi, provider);
var routerContractSigner = routerV2Contract.connect(wallet);
// Add liquidity and remove liquidity
// First we need to approve router contract to withdraw with enough amount
var ERC20_json_1 = __importDefault(require("./ERC20.json"));
var tt1Address = "0x30eE63b46C73817ef883eA4aB6BAbB954B54588d";
var tt2Address = "0x4cA466252cc976c4C729E58bAE309032a868E7BF";
var tt1Contract = new ethers_1.ethers.Contract(tt1Address, ERC20_json_1["default"].abi, provider);
var tt2Contract = new ethers_1.ethers.Contract(tt2Address, ERC20_json_1["default"].abi, provider);
var tt1ContractSigner = tt1Contract.connect(wallet);
var tt2ContractSigner = tt2Contract.connect(wallet);
// Approve on both tt1 and tt2 contract
var tt1ApproveAmount; // Amount of tt1 token to approve
var tt2ApproveAmount; // Amount of tt2 token to approve
var latestTT1Reserve; // Latest query of amount of tt1 token reserve
var latestTT2Reserve; // Latest query of amount of tt2 token reserve
var latestLiquidity; // Latest query of liquidity token
var liquidityToWithdraw; // Amount of liquidity token to withdraw(this is to remove liquidity)
tt1Contract.balanceOf(wallet.address).then(function (balance) {
    console.log("My TT1 balance:", balance.toString());
    return tt2Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT2 balance:", balance.toString());
    return pairContract.getReserves();
}).then(function (result) {
    latestTT1Reserve = result.reserve0;
    latestTT2Reserve = result.reserve1;
    console.log("TT1 reserve amount:", latestTT1Reserve.toString());
    console.log("TT2 reserve amount:", latestTT2Reserve.toString());
    console.log("Timestamp at which latest liquidity update is performed(add or remove):", result.blockTimestampLast);
    return pairContract.balanceOf(wallet.address);
}).then(function (balance) {
    latestLiquidity = balance;
    console.log("Amount of liquidity token we own:", latestLiquidity.toString());
    // Approve with specified amount of tt1
    tt1ApproveAmount = ethers_1.ethers.utils.parseUnits("8000.0", 6);
    // tt1ApproveAmount = latestTT1Reserve.div(10);
    return tt1ContractSigner.approve(routerV2Contract.address, tt1ApproveAmount);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    // Verify tt1 amount approved
    return tt1Contract.allowance(wallet.address, routerV2Contract.address);
}).then(function (allowance) {
    console.log("Approved routerV2 to withdraw this much tt1:", allowance.toString());
    // Approve with specified amount of tt2
    tt2ApproveAmount = ethers_1.ethers.utils.parseUnits("400.0", 6);
    // tt2ApproveAmount = latestTT2Reserve.div(10);
    return tt2ContractSigner.approve(routerV2Contract.address, tt2ApproveAmount);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    // Verify tt2 amount approved
    return tt2Contract.allowance(wallet.address, routerV2Contract.address);
}).then(function (allowance) {
    console.log("Approved routerV2 to withdraw this much tt2:", allowance.toString());
    // Next we add liquidity
    var amountADesired = tt1ApproveAmount; // The amount of A to add as liquidity if A depreciates
    var amountBDesired = tt2ApproveAmount; // The amount of B to add as liquidity if B depreciates
    var amountAMin = tt1ApproveAmount.div(2); // Minimum amount of A to add to liquidity
    var amountBMin = tt2ApproveAmount.div(2); // Minimum amount of B to add to liquidity
    var deadline = Math.floor(Date.now() / 1000) + 3600; // Deadline when this request(add liquidity) expires
    return routerContractSigner.addLiquidity(tt1Address, tt2Address, amountADesired, amountBDesired, amountAMin, amountBMin, wallet.address, deadline);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    return pairContract.getReserves();
}).then(function (result) {
    latestTT1Reserve = result.reserve0;
    latestTT2Reserve = result.reserve1;
    console.log("TT1 reserve amount:", latestTT1Reserve.toString());
    console.log("TT2 reserve amount:", latestTT2Reserve.toString());
    console.log("Timestamp at which latest liquidity update is performed(add or remove):", result.blockTimestampLast);
    return pairContract.balanceOf(wallet.address);
}).then(function (balance) {
    latestLiquidity = balance;
    console.log("Amount of liquidity token we own:", latestLiquidity.toString());
    return tt1Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT1 balance:", balance.toString());
    return tt2Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT2 balance:", balance.toString());
    // Then we remove liquidity
    liquidityToWithdraw = latestLiquidity;
    // We need to approve routerV2 to withdraw from pair contract
    return pairContractSigner.approve(routerV2Contract.address, liquidityToWithdraw);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    // Verify liquidity token amount approved
    return pairContract.allowance(wallet.address, routerV2Contract.address);
}).then(function (allowance) {
    console.log("Approved routerV2 to withdraw this much liquidity token", allowance.toString());
    var amountAMin = 0; // The minimum amount of A that must be received
    var amountBMin = 0; // The minimum amount of B that must be received
    var deadline = Math.floor(Date.now() / 1000) + 3600; // Deadline when this request(remove liquidity) expires
    return routerContractSigner.removeLiquidity(tt1Address, tt2Address, liquidityToWithdraw, amountAMin, amountBMin, wallet.address, deadline);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    return pairContract.getReserves();
}).then(function (result) {
    latestTT1Reserve = result.reserve0;
    latestTT2Reserve = result.reserve1;
    console.log("TT1 reserve amount:", latestTT1Reserve.toString());
    console.log("TT2 reserve amount:", latestTT2Reserve.toString());
    console.log("Timestamp at which latest liquidity update is performed(add or remove):", result.blockTimestampLast);
    return pairContract.balanceOf(wallet.address);
}).then(function (balance) {
    latestLiquidity = balance;
    console.log("Amount of liquidity token we own:", latestLiquidity.toString());
    return tt1Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT1 balance:", balance.toString());
    return tt2Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT2 balance:", balance.toString());
})["catch"](function (error) {
    console.log("Error:", error);
});
