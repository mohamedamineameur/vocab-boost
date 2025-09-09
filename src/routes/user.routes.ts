import { Router } from "express";
import { createUser, getUserById, getUsers, updateUserPartialOrFull, deleteUser } from "../controllers/user.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const userRouter = Router();

userRouter.post("/", createUser);
userRouter.get("/", isAuthenticated('admin'), getUsers);
userRouter.get("/:id", isAuthenticated(), getUserById);
userRouter.patch("/:id", isAuthenticated(), updateUserPartialOrFull);
userRouter.delete("/:id", isAuthenticated('admin'), deleteUser);

export default userRouter;
