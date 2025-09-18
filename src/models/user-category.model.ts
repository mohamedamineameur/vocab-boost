import { User } from "./user.model";
import { Category } from "./category.model";
import database from "../config/database";
import { DataTypes, Model } from "sequelize";

export interface UserCategoryAttributes{
    id?:string;
    userId:string;
    categoryId:string
}

export class UserCategory extends Model <UserCategoryAttributes> implements UserCategoryAttributes{
    declare id: string
    declare userId: string
    declare categoryId: string
}

UserCategory.init(
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
    categoryId:{

    type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    },{
        sequelize:database,
        tableName:"user_categories",
        timestamps:false,
        indexes:[
            {
                unique:true,
                fields:['userId','categoryId']
            }
        ]

    }
    
)