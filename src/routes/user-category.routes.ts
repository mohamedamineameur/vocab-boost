import { Router } from "express";
import { createUserCategory, getUserCategories, getUserCategoryById } from "../controllers/user-category.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const userCategoryRouter = Router();

userCategoryRouter.post("/:userId/:categoryId", isAuthenticated(), createUserCategory);
userCategoryRouter.get("/", isAuthenticated(), getUserCategories);
userCategoryRouter.get("/:id", isAuthenticated(), getUserCategoryById);

export default userCategoryRouter;