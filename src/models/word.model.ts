import database from "../config/database.ts";
import { DataTypes, Model, type Optional } from "sequelize";
import { Category } from "./category.model.ts";

type Level = 'beginnerLevelOne' | 'beginnerLevelTwo' | 'intermediateLevelOne' | 'intermediateLevelTwo' | 'advancedLevelOne' | 'advancedLevelTwo';

export interface WordAttributes {
  id?: string;
  text: string;
  meaning: string;
  example: string;
  categoryId: string | null;
  pronunciation: string;
  frTranslation: string;
  esTranslation: string;
  arTranslation: string;
  createdAt?: Date;
  updatedAt?: Date;
  level: Level;
  synonyms: string[];
  antonyms: string[];
  lexicalField: string[];
}

export interface WordCreationAttributes extends Optional<WordAttributes, "id" | "createdAt" | "updatedAt" | "example" | "categoryId" | "frTranslation" | "esTranslation" | "arTranslation" |  "synonyms" | "antonyms" | "lexicalField" | "pronunciation"> {}

export class Word extends Model<WordAttributes, WordCreationAttributes> implements WordAttributes {
  declare id: string;
  declare text: string;
  declare meaning: string;
  declare example: string;
  declare categoryId: string | null;
  declare frTranslation: string;
  declare esTranslation: string;
  declare arTranslation: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare level: Level;
    declare synonyms: string[];
    declare antonyms: string[];
    declare lexicalField: string[];
    declare pronunciation: string;

}

Word.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    meaning: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Category,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    frTranslation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    esTranslation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    arTranslation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    level: {
      type: DataTypes.ENUM('beginnerLevelOne', 'beginnerLevelTwo', 'intermediateLevelOne', 'intermediateLevelTwo', 'advancedLevelOne', 'advancedLevelTwo'),
      allowNull: false,
      defaultValue: 'beginnerLevelOne',
    },
   
    synonyms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    antonyms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    lexicalField: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    pronunciation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "words",
    timestamps: true,
  }
);

