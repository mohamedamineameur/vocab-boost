import { Profile } from "../models/profile.model.ts";
import { Request, Response } from "express";
import { bodyValidator } from "../validations/bodyValidator.ts";
import { profileCreationSchema, updateProfileSchema } from "../validations/profile.schemas.ts";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, profileCreationSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }

    const { userId, local, theme } = req.body;

    // Check if profile already exists for the user
    const existingProfile = await Profile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ error: "Profile already exists for this user" });
    }

    const newProfile = await Profile.create({
      userId,
      local: local || 'en',
      theme: theme || 'light',
    });

    res.status(201).json({ message: "Profile created successfully", profileId: newProfile.id });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.findAll();
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const updateProfilePartialOrFull = async (req: Request, res: Response) => {
  try {
    const error = bodyValidator(req.body, updateProfileSchema);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const { id } = req.params;
    const { local, theme } = req.body;

    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (local !== undefined) profile.local = local;
    if (theme !== undefined) profile.theme = theme;

    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    await profile.destroy();
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}