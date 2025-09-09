import { Router } from "express";
import { createProfile, getProfileById, getProfiles, updateProfilePartialOrFull, deleteProfile } from "../controllers/profile.controller.ts";
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
const profileRouter = Router();

profileRouter.post("/", isAuthenticated(), createProfile);
profileRouter.get("/", isAuthenticated('admin'), getProfiles);
profileRouter.get("/:id", isAuthenticated(), getProfileById);
profileRouter.patch("/:id", isAuthenticated(), updateProfilePartialOrFull);
profileRouter.delete("/:id", isAuthenticated('admin'), deleteProfile);

export default profileRouter;