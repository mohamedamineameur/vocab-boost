import { createCategory, getCategories, getCategoryById } from "../controllers/category.controller.ts";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";

const categoryRouter = Router();

categoryRouter.post("/", isAuthenticated('admin'), createCategory);
categoryRouter.get("/", isAuthenticated(), getCategories);
categoryRouter.get("/:id", isAuthenticated(), getCategoryById);

export default categoryRouter;