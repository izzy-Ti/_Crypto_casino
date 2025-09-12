import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import Wallet from './wallet.model.js';

class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    walletId: {
      type: DataTypes.UUID,
      references: {
        model: Wallet,
        key: 'id',
      },
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'deposit',
        'withdrawal',
        'bet',
        'win',
        'refund',
        'bonus',
        'fee'
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['walletId'],
      },
      {
        fields: ['txHash'],
      },
    ],
  }
);

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });
User.hasMany(Transaction, { foreignKey: 'userId' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId' });

export default Transaction;
