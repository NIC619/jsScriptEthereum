"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "infura_api_key");
var wallet = new ethers_1.ethers.Wallet("private_key", provider);
var tt1Address = "0x30eE63b46C73817ef883eA4aB6BAbB954B54588d";
var tt2Address = "0x4cA466252cc976c4C729E58bAE309032a868E7BF";
// Pair
// Our tt1/tt2 pair contract
var IUniswapV2Pair_json_1 = __importDefault(require("./IUniswapV2Pair.json"));
var tt1tt2PairAddress = "0x34460716ea801C5EF2080B978aE6d2BD42F1929B";
var pairContract = new ethers_1.ethers.Contract(tt1tt2PairAddress, IUniswapV2Pair_json_1["default"].abi, provider);
// RouterV2
// Library provided by uniswap to interact with pair, e.g., add/remove liquidity and swap tokens
var IUniswapV2Router02_json_1 = __importDefault(require("./IUniswapV2Router02.json"));
var routerV2Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
var routerV2Contract = new ethers_1.ethers.Contract(routerV2Address, IUniswapV2Router02_json_1["default"].abi, provider);
var routerContractSigner = routerV2Contract.connect(wallet);
// tt1/tt2
var ERC20_json_1 = __importDefault(require("./ERC20.json"));
var tt1Contract = new ethers_1.ethers.Contract(tt1Address, ERC20_json_1["default"].abi, provider);
var tt2Contract = new ethers_1.ethers.Contract(tt2Address, ERC20_json_1["default"].abi, provider);
var tt1ContractSigner = tt1Contract.connect(wallet);
var tt2ContractSigner = tt2Contract.connect(wallet);
// Flow:
// First swap exact `tt1TradeAmount` amount of tt1 for tt2 via `swapExactTokensForTokens`
// Then trade(buy) back exact `tt1TradeAmount` amount of tt1 with tt2 via `swapTokensForExactTokens`
// Before swapping, we need to approve routerV2 to swap on our behalf
var tt1TradeAmount; // Amount of tt1 we are swapping
var tt2AmountMin; // Minimum amount of tt2 to swap for, given a specified amount of tt1
var tt2AmountMax; // Maximum amount of tt2 allowed to swap for a specified amount of tt1
var latestTT1Reserve; // Latest query of amount of tt1 token reserve
var latestTT2Reserve; // Latest query of amount of tt2 token reserve
var tokenReceiver = wallet.address; // Address that will receive the tokens
tt1Contract.balanceOf(wallet.address).then(function (balance) {
    console.log("First we swap exact amount of tt1 for tt2");
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
    tt1TradeAmount = ethers_1.ethers.utils.parseUnits("1", 5);
    return tt1ContractSigner.approve(routerV2Contract.address, tt1TradeAmount);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    // Verify tt1 amount approved
    return tt1Contract.allowance(wallet.address, routerV2Contract.address);
}).then(function (allowance) {
    console.log("Approved routerV2 to withdraw this much tt1:", allowance.toString());
    tt2AmountMin = ethers_1.ethers.utils.parseUnits("0", 2);
    var deadline = Math.floor(Date.now() / 1000) + 3600;
    // Path consists of tokens on the route of swapping.
    // It begins with token we use for swapping and end with token we are swapping for.
    // In this case it only consists of tt1 and tt2.
    var path = [tt1Address, tt2Address];
    console.log("Now swapping exactly ", tt1TradeAmount.toString(), "of tt1 for a minimum of", tt2AmountMin.toString(), "tt2.");
    return routerContractSigner.swapExactTokensForTokens(tt1TradeAmount, tt2AmountMin, path, tokenReceiver, deadline);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    console.log("Finish swapping");
    // console.log("tx receipt:", tx_receipt);
    return tt1Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT1 balance:", balance.toString());
    return tt2Contract.balanceOf(wallet.address);
}).then(function (balance) {
    console.log("My TT2 balance:", balance.toString());
    return pairContract.getReserves();
}).then(function (result) {
    console.log("Next we swap tt2 for exact amount of tt1");
    latestTT1Reserve = result.reserve0;
    latestTT2Reserve = result.reserve1;
    console.log("TT1 reserve amount:", latestTT1Reserve.toString());
    console.log("TT2 reserve amount:", latestTT2Reserve.toString());
    // Add extra 10% to tt2 allowance to prevent rounding error from failing the transaction
    // i.e., not approving enough amount of tt2, we can not get exact `tt1TradeAmount` amount of tt1 back.
    // TODO: Use the uniswap SDK to calculate exact tt2 needed.
    tt2AmountMax = tt1TradeAmount.mul(latestTT2Reserve).mul(11).div(10).div(latestTT1Reserve);
    // tt2AmountMax = tt1TradeAmount.mul(latestTT2Reserve).div(latestTT1Reserve);
    return tt2ContractSigner.approve(routerV2Contract.address, tt2AmountMax);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    // console.log("tx receipt:", tx_receipt);
    // Verify tt1 amount approved
    return tt2Contract.allowance(wallet.address, routerV2Contract.address);
}).then(function (allowance) {
    console.log("Approved routerV2 to withdraw this much tt2:", allowance.toString());
    var deadline = Math.floor(Date.now() / 1000) + 3600;
    var path = [tt2Address, tt1Address];
    console.log("Now swapping a maximum of", tt2AmountMax.toString(), "tt2 for a exactly", tt1TradeAmount.toString(), "tt1.");
    return routerContractSigner.swapTokensForExactTokens(tt1TradeAmount, tt2AmountMax, path, tokenReceiver, deadline);
}).then(function (tx) {
    return provider.waitForTransaction(tx.hash);
}).then(function (tx_receipt) {
    console.log("Finish swapping");
    // console.log("tx receipt:", tx_receipt);
    return tt1Contract.balanceOf(wallet.address);
}).then(function (balance) {
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
})["catch"](function (error) {
    console.log("Oops an error occurred:", error);
});
