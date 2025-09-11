import { User, UserAttributes } from "../../models/user.model.ts";
import env from "../../config/env.ts";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";


export const createUserFixture = async () => {
  const user= {
    email: faker.internet.email(),
    password: bcrypt.hashSync("Password123@", env.SALT_ROUNDS || 10),
    firstname: "John",
    lastname: "Doe",
    isVerified: true,
    isAdmin: false,
    
  };
 

  const newUser = await User.create(user);
  return newUser.toJSON();
};

export const createAdminFixture = async () => {
  const admin: UserAttributes = {
    email: "admin@example.com",
    password: bcrypt.hashSync("adminpassword", env.SALT_ROUNDS || 10),
    firstname: "Admin",
    lastname: "User",
    isVerified: true,
    isAdmin: true,
  };
 

  const newAdmin = await User.create(admin);
  return newAdmin.toJSON();
};