import { getWordById, createWord, getWords } from "../controllers/word.controller";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const wordRouter = Router();

wordRouter.post("/", isAuthenticated('admin'), createWord);
wordRouter.get("/", isAuthenticated(), getWords);
wordRouter.get("/:id", isAuthenticated(), getWordById);

export default wordRouter;