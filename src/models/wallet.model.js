import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';

class Wallet extends Model {}

Wallet.init(
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
    balance: {
      type: DataTypes.DECIMAL(20, 8), // For handling crypto amounts
      defaultValue: 0,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BTC',
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Wallet',
    tableName: 'wallets',
    timestamps: true,
  }
);

// Define associations
Wallet.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Wallet, { foreignKey: 'userId' });

export default Wallet;
