import Web3 from 'web3'

const provider = new Web3.providers.HttpProvider('https://eth-sepolia.g.alchemy.com/v2/LIPwUHW_YI1mDX_Z9Lyph')
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
]
const contractAddress = '0xe446a520E9304F123F888209711b0cC03016cF69'
const web3 = new Web3(provider)

const contract = new web3.eth.Contract(contractABI, contractAddress);

export const connnectWallet = async (req,res) => {
  const accounts = await web3.eth.getAccounts()
  res.send(accounts)
  console.log(accounts[0])

  const balance = web3.eth.getBalance(accounts[0])
  const balanceeth = web3.utils.fromWei(balance, "ether")
  console.log(balanceeth)
}