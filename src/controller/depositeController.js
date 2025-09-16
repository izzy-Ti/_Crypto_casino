import Web3 from 'web3';
import pool from "../config/db.js";
import transporter from "../config/nodeMailer.js";

// Initialize Web3 with Sepolia RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc-sepolia.ethereum.org"));

// Your contract details
const contractAddress = "0xd8c53b23892862fdf54999975ebb65705e6829f8";  // Sepolia Testnet contract address
const contractABI = [
  {
    "constant": false,
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "betAmount", "type": "uint256"}],
    "name": "placeBet",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_houseEdge", "type": "uint256"}],
    "name": "setHouseEdge",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "betId", "type": "uint256"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "Deposit",
    "type": "event"
  }
];

// Create the contract instance
const casinoContract = new web3.eth.Contract(contractABI, contractAddress);

// Controller function to interact with the contract for deposit
export const createDeposite = async (req, res) => {
  const { userId } = req.body;
  const price = parseInt(req.body.price, 10);

  try {
    // Fetch user data from your database
    const sql = `
      SELECT * FROM "Users" WHERE id = $1 LIMIT 1;
    `;
    const result = await pool.query(sql, [userId]);
    const User = result.rows[0];

    if (!User) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if the user is verified or not
    if (User.isaccverified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // Convert price to Wei (since ETH is too small for transactions directly)
    const priceInWei = web3.utils.toWei(price.toString(), 'ether');

    // Get wallet address (Assuming the wallet address is stored in the User object or you could get it from elsewhere)
    const walletAddress = User.walletAddress;
    const privateKey = process.env.PRIVATE_KEY;

    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Set the transaction parameters
    const tx = {
      from: account.address,
      to: contractAddress,
      value: priceInWei,
      gas: 21000, // Basic gas limit for a simple ETH transfer
      gasPrice: await web3.eth.getGasPrice(),
      data: casinoContract.methods.deposit().encodeABI(),
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);

    // Send the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Log the transaction in the database
    const userBalance = User.balance + price;
    const sql_update = `
      UPDATE "Users"
      SET balance = $1
      WHERE id = $2
    `;
    await pool.query(sql_update, [userBalance, userId]);

    // Send email notification to the user
    const mailOption = {
      from: process.env.EMAIL,
      to: User.email,
      subject: 'Deposit Confirmation - E_Casino',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center;">
              <h2 style="color: #FFD700;">Deposit Successful!</h2>
              <p>Hello, ${User.name}!</p>
              <p>Your deposit of <strong>$${price.toFixed(2)} ${User.currency}</strong> has been successfully processed.</p>
              <p>Transaction ID: <strong>${receipt.transactionHash}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://www.e-casino.com/dashboard" style="background-color: #FFD700; color: #121212; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">If you have any issues, contact us at <a href="mailto:support@e-casino.com" style="color: #FFD700;">support@e-casino.com</a></p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: `Deposit of ${price} is successful` });

  } catch (error) {
    console.error("Error processing deposit:", error);
    res.json({ success: false, message: error.message });
  }
};
