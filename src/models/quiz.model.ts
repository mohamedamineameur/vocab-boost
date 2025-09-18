import { UserWord } from "./user-word.model.ts";
import { DataTypes, Model } from "sequelize";
import database from "../config/database.ts";

type QuizType = "translationEnglishToOther" | "translationOtherToEnglish" | "meaning" | "audio" | "wordSorting" | "spelling" | "speaking";

export interface QuizAttributes {
  id?: string;
  userWordId: string;
  question: string;
  options?: string[]; 
  correctAnswer: string;
  type: QuizType;
  createdAt?: Date;
  updatedAt?: Date;
  areUserAnswersCorrect?: boolean[]; 

}

export class Quiz extends Model<QuizAttributes> implements QuizAttributes {
    declare id?: string;
    declare userWordId: string;
    declare question: string;
    declare options?: string[];
    declare correctAnswer: string;
    declare type: QuizType;
    declare createdAt?: Date;
    declare updatedAt?: Date;
    declare areUserAnswersCorrect?: boolean[];
}

Quiz.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userWordId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserWord,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("translationEnglishToOther", "translationOtherToEnglish", "meaning", "audio", "wordSorting", "spelling", "speaking"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    areUserAnswersCorrect: {
      type: DataTypes.ARRAY(DataTypes.BOOLEAN),
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: "quizzes",
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
  }
);


export default Quiz;  