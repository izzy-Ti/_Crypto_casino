import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';

class Game extends Model {}

Game.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('slots', 'blackjack', 'roulette', 'poker', 'dice', 'custom'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'disabled'),
      defaultValue: 'active',
    },
    minBet: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0.0001,
      allowNull: false,
    },
    maxBet: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 10,
      allowNull: false,
    },
    houseEdge: {
      type: DataTypes.FLOAT,
      defaultValue: 0.02, // 2% house edge
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Game',
    tableName: 'games',
    timestamps: true,
  }
);

export default Game;
