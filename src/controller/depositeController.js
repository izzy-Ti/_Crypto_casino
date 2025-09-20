import { ethers } from "ethers";
import pool from "../config/db.js";
import transporter from "../config/nodeMailer.js";

// Correct instantiation of JsonRpcProvider
const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/9KFjCrNm5WQmqW9RWoOTW");

// Your contract address
const contractAddress = "0xe446a520E9304F123F888209711b0cC03016cF69";

// **Insert the actual ABI for your contract here**
const contractABI = [
  {
    "inputs": [{"internalType": "uint64", "name": "_vrfSubscriptionId", "type": "uint64"},
      {"internalType": "address", "name": "_vrfCoordinator", "type": "address"},
      {"internalType": "uint256", "name": "_houseEdge", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "betId", "type": "uint256"}],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "betId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "result", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256"}],
    "name": "GameResult",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balances",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "houseEdge",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "betAmount", "type": "uint256"}],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_houseEdge", "type": "uint256"}],
    "name": "setHouseEdge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vrfSubscriptionId",
    "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Create contract instance
const casinoContract = new ethers.Contract(contractAddress, contractABI, provider);

// Now log contract methods to verify that `deposit` is available
console.log("Contract methods:", casinoContract);


export const createDeposite = async (req, res) => {
  const { userId } = req.body;
  let price = parseFloat(req.body.price);  // Convert price to float
  
  console.log("Deposit price:", price);

  if (price <= 0) {
    return res.json({ success: false, message: "Invalid deposit amount" });
  }

  try {
    // Fetch user data from the database
    const sql = `SELECT * FROM "Users" WHERE id = $1 LIMIT 1;`;
    const result = await pool.query(sql, [userId]);
    const User = result.rows[0];

    if (!User) {
      return res.json({ success: false, message: "User not found" });
    }

    // Ensure the user is not already verified
    if (User.isaccverified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // Convert the price from Ether to Wei (ensure it's an integer)
    const priceInWei = ethers.utils.parseEther(price.toString());
    
    // Ensure the price is an integer
    const priceInWeiString = priceInWei.toString(); // This will return a string without decimals
    const priceInWeiInteger = BigInt(priceInWeiString);  // BigInt conversion for precise handling

    console.log("Price in Wei as integer:", priceInWeiInteger);

    // Get wallet address and private key
    const walletAddress = User.walletAddress;
    const privateKey = process.env.PRIVATE_KEY;

    // Create the wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);

    // Check account balance before making the transaction
    const balance = await wallet.getBalance();
    const balanceInEther = ethers.utils.formatEther(balance);
    console.log(`Account balance: ${balanceInEther} ETH`);

    // Estimate gas
    const gasPrice = await provider.getGasPrice();
    const gasEstimate = await casinoContract.estimateGas.deposit({
      from: wallet.address,
      value: priceInWei,
    });

    console.log(`Gas price: ${gasPrice}`);
    console.log(`Gas estimate: ${gasEstimate}`);

    // Calculate the total cost
    const totalCostInWei = priceInWei.add(gasEstimate.mul(gasPrice));
    const totalCostInEther = ethers.utils.formatEther(totalCostInWei);

    // Check if balance is sufficient
    if (parseFloat(balanceInEther) < parseFloat(totalCostInEther)) {
      return res.json({ success: false, message: "Insufficient funds" });
    }

    // Transaction parameters
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const tx = {
      nonce: nonce,  // Add nonce here
      to: contractAddress,
      value: priceInWei,  // This is already in Wei
      gasLimit: gasEstimate,
      gasPrice: gasPrice,
      data: casinoContract.interface.encodeFunctionData("deposit", []),
    };

    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);
    const txResponse = await provider.sendTransaction(signedTx);

    // Wait for transaction receipt
    const receipt = await txResponse.wait();

    // Update the user's balance in the database
    const userBalance = BigInt(User.balance) + priceInWeiInteger;  // Ensure integer addition
    const sql_update = `UPDATE "Users" SET balance = $1 WHERE id = $2`;

    console.log("SQL Update Query:", sql_update, [userBalance.toString(), userId]);  // Use BigInt for SQL update
    await pool.query(sql_update, [userBalance.toString(), userId]);  // Pass as string (BigInt string representation)

    // Send email notification
    const mailOption = {
      from: process.env.EMAIL,
      to: User.email,
      subject: 'Deposit Confirmation - E_Casino',
      html: `...`  // Your HTML content remains the same
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: `Deposit of ${price} ETH is successful` });

  } catch (error) {
    console.error("Error processing deposit:", error);
    res.json({ success: false, message: error.message });
  }
};


