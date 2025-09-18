import { Router } from "express";
import { createUserWord, getUserWords, getUserWordById } from "../controllers/user-word.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const userWordRouter = Router();

userWordRouter.post("/:userId/:wordId", isAuthenticated(), createUserWord);
userWordRouter.get("/", isAuthenticated(), getUserWords);
userWordRouter.get("/:id", isAuthenticated(), getUserWordById);

export default userWordRouter;