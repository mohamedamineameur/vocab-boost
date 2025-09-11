import { Category } from "../models/category.model.ts";
import { Request, Response } from "express";
import { bodyValidator, paramsValidator } from "../validations/bodyValidator.ts";
import { categoryCreationSchema } from "../validations/category.schemas.ts";
import { idParamSchema } from "../validations/params.schemas.ts";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, categoryCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }

    const { name, description } = req.body;

    // Check if category with the same name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }

    const newCategory = await Category.create({
      name,
      description,
    });

    res.status(201).json({ message: "Category created successfully", categoryId: newCategory.id });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = paramsValidator(req.params, idParamSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}