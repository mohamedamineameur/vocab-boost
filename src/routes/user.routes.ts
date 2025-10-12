import { Router } from "express";
import { createUser, getUserById, getUsers, updateUserPartialOrFull, deleteUser, updateProfile, updatePassword, verifyEmail, resendVerificationEmail, requestPasswordReset, resetPassword } from "../controllers/user.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const userRouter = Router();

userRouter.post("/", createUser);
userRouter.post("/verify/:userId/:verificationToken", verifyEmail);
userRouter.post("/resend-verification", resendVerificationEmail);
userRouter.post("/forgot-password", requestPasswordReset);
userRouter.post("/reset-password/:userId/:resetToken", resetPassword);
userRouter.get("/", isAuthenticated('admin'), getUsers);
userRouter.get("/:id", isAuthenticated(), getUserById);
userRouter.patch("/:id", isAuthenticated(), updateUserPartialOrFull);
userRouter.delete("/:id", isAuthenticated('admin'), deleteUser);

// Routes pour les paramètres utilisateur
userRouter.patch("/profile", isAuthenticated(), updateProfile);
userRouter.patch("/password", isAuthenticated(), updatePassword);

export default userRouter;
