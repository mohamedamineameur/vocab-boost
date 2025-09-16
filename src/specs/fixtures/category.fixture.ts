import { Category, CategoryCreationAttributes } from "../../models/category.model.ts";

export const createCategoryFixture = async (overrides: Partial<CategoryCreationAttributes> = {}) => {
  const categoryData: CategoryCreationAttributes = {
    name: overrides.name ?? `Category ${Math.random().toString(36).substring(7)}`,
    description: overrides.description ?? "Sample category description",
    frTranslation: overrides.frTranslation ?? "Catégorie Exemple",
    esTranslation: overrides.esTranslation ?? "Categoría de Ejemplo",
    arTranslation: overrides.arTranslation ?? "فئة مثال",
    ...overrides,
  };
  return Category.create(categoryData);
};

