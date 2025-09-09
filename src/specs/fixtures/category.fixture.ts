import { Category, CategoryCreationAttributes } from "../../models/category.model.ts";

export const createCategoryFixture = async (overrides: Partial<CategoryCreationAttributes> = {}) => {
  const categoryData: CategoryCreationAttributes = {
    name: overrides.name ?? `Category ${Math.random().toString(36).substring(7)}`,
    description: overrides.description ?? "Sample category description",
    ...overrides,
  };
  return Category.create(categoryData);
};

