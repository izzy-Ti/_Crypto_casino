import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import Game from './game.model.js';

class Bet extends Model {}

Bet.init(
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
    gameId: {
      type: DataTypes.UUID,
      references: {
        model: Game,
        key: 'id',
      },
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    payout: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BTC',
    },
    status: {
      type: DataTypes.ENUM('pending', 'won', 'lost', 'refunded', 'cancelled'),
      defaultValue: 'pending',
    },
    result: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Bet',
    tableName: 'bets',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['gameId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

// Define associations
Bet.belongsTo(User, { foreignKey: 'userId' });
Bet.belongsTo(Game, { foreignKey: 'gameId' });
User.hasMany(Bet, { foreignKey: 'userId' });
Game.hasMany(Bet, { foreignKey: 'gameId' });

export default Bet;
