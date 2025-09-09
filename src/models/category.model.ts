import database from "../config/database.ts";
import { DataTypes, Model, Optional } from "sequelize";

export interface CategoryAttributes {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
}
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id" | "createdAt"> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare createdAt: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "categories",
    timestamps: false,
  }
);