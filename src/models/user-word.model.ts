import { User } from "./user.model.ts";
import { Word } from "./word.model.ts";
import { Model, DataTypes } from "sequelize";
import database from "../config/database.ts";



export interface UserWordAttributes {
  id?: string;
  userId: string;
  wordId: string;
  isLearned?: boolean;
}

export class UserWord extends Model<UserWordAttributes> implements UserWordAttributes {
  declare id: string;
  declare userId: string;
  declare wordId: string;
  declare isLearned?: boolean;

}

UserWord.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    wordId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Word,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    isLearned: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize: database,
    tableName: "user_words",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'wordId'],
      },
    ],
  }
);

