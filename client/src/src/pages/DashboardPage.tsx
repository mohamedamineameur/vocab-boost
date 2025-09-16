import { useEffect, useState } from "react";
import CategoryList from "../components/CategoryListe";
import type { CategoryAttributes } from "../../../../src/models/category.model";
import {getCategories} from "../../services/category.services";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryAttributes[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">📂 Categories</h1>
      <CategoryList categories={categories} />
    </div>
  );
}


 