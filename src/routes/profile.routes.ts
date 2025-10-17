import { Router } from "express";
import { createProfile, getProfileById, getProfiles, updateProfilePartialOrFull, deleteProfile, getMyProfile, updateMyProfile } from "../controllers/profile.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const profileRouter = Router();

profileRouter.post("/", isAuthenticated(), createProfile);
profileRouter.get("/", isAuthenticated(), getProfiles);
profileRouter.get("/me", isAuthenticated(), getMyProfile);
profileRouter.patch("/me", isAuthenticated(), updateMyProfile);
profileRouter.get("/:id", isAuthenticated(), getProfileById);
profileRouter.patch("/:id", isAuthenticated(), updateProfilePartialOrFull);
profileRouter.delete("/:id", isAuthenticated('admin'), deleteProfile);

export default profileRouter;