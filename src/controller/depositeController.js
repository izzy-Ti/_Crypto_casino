import Web3 from 'web3';
import pool from "../config/db.js";
import transporter from "../config/nodeMailer.js";

// Initialize Web3 with Sepolia RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider("https://eth-sepolia.alchemyapi.io/v2/9KFjCrNm5WQmqW9RWoOTW"));

// Your contract details
const contractAddress = "0xe446a520E9304F123F888209711b0cC03016cF69";  // Sepolia Testnet contract address
const contractABI = [/* Contract ABI remains the same */];

// Create the contract instance
const casinoContract = new web3.eth.Contract(contractABI, contractAddress);

// Controller function to interact with the contract for deposit
export const createDeposite = async (req, res) => {
  const { userId } = req.body;
  const price = parseInt(req.body.price, 10);  // Ensure price is an integer

  try {
    // Fetch user data from the database
    const sql = `SELECT * FROM "Users" WHERE id = $1 LIMIT 1;`;
    const result = await pool.query(sql, [userId]);
    const User = result.rows[0];

    if (!User) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if the user is verified
    if (User.isaccverified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // Convert price to Wei (ETH -> Wei conversion)
    const priceInWei = web3.utils.toWei(price.toString(), 'ether');  // Ensure it's a string

    // Get wallet address and private key
    const walletAddress = User.walletAddress;
    const privateKey = process.env.PRIVATE_KEY;  // Your private key stored in .env file

    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Check account balance before making the transaction
    const balance = await web3.eth.getBalance(account.address);
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    console.log(`Account balance: ${balanceInEther} ETH`);

    // Ensure enough funds to cover both transaction and gas
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await casinoContract.methods.deposit().estimateGas({
      from: account.address,
      value: priceInWei,
    });

    console.log(`Gas price: ${gasPrice}`);
    console.log(`Gas estimate: ${gasEstimate}`);

    const totalCostInWei = web3.utils.toBN(priceInWei).add(web3.utils.toBN(gasEstimate).mul(web3.utils.toBN(gasPrice)));
    const totalCostInEther = web3.utils.fromWei(totalCostInWei, 'ether');

    if (parseFloat(balanceInEther) < parseFloat(totalCostInEther)) {
      return res.json({ success: false, message: "Insufficient funds to cover gas and transaction value" });
    }

    // Set the transaction parameters
    const tx = {
      from: account.address,
      to: contractAddress,
      value: priceInWei,  // value is a string (already in Wei)
      gas: gasEstimate,   // Set dynamic gas estimate
      gasPrice: gasPrice,  // Use dynamic gas price
      data: casinoContract.methods.deposit().encodeABI(),
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);

    // Send the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Log the transaction in the database
    const userBalance = User.balance + price;
    const sql_update = `UPDATE "Users" SET balance = $1 WHERE id = $2`;
    await pool.query(sql_update, [userBalance, userId]);

    // Send email notification to the user
    const mailOption = {
      from: process.env.EMAIL,
      to: User.email,
      subject: 'Deposit Confirmation - E_Casino',
      html: `...` // Your HTML for email remains the same
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: `Deposit of ${price} is successful` });

  } catch (error) {
    console.error("Error processing deposit:", error);
    res.json({ success: false, message: error.message });
  }
};
