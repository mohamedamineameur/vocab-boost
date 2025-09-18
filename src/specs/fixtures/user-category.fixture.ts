import { UserCategory } from "../../models/user-category.model";
import { createUserFixture } from "./user.fixture";
import { createCategoryFixture } from "./category.fixture";

export const createUserCategoryFixture = async (overrides: Partial<{userId: string; categoryId: string;}> = {}) => {
  const user = overrides.userId ? { id: overrides.userId } : await createUserFixture();
  const category = overrides.categoryId ? { id: overrides.categoryId } : await createCategoryFixture();

  if (!user.id || !category.id) {
    throw new Error("user.id and category.id must be defined");
  }

  const userCategoryData = {
    userId: user.id as string,
    categoryId: category.id as string,
  };

  const userCategory = await UserCategory.create(userCategoryData);
  return userCategory.toJSON();
};
