import { Category, CategoryAttributes } from "../models/category.model.ts";
import categories from './categories.json' with { type: "json" };

export async function addCategories() {
  for (const categoryData of categories) {
    const categoryExists = await Category.findOne({ where: { name: categoryData.name } });
    if (categoryExists) {
      continue; 
    }
    const category: CategoryAttributes = {
      name: categoryData.name,
      description: categoryData.description,
      frTranslation: categoryData.fr,
      esTranslation: categoryData.es,
      arTranslation: categoryData.ar,
    };
    await Category.create(category);
  }
    console.log("Categories added successfully.");
}
