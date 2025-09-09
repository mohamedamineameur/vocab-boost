import { Profile } from "../../models/profile.model.ts";
import { createUserFixture } from "./user.fixture.ts";
import { ProfileAttributes } from "../../models/profile.model.ts";


export const createProfileFixture = async (overrides: Partial<ProfileAttributes> = {}) => {
    const user = await createUserFixture();
    const profileData = {
        userId: user.id,
        local: overrides.local ?? "en" as "en" | "fr" | "es" | "ar",
        theme: overrides.theme ?? "light",
        ...overrides,
    };
    return Profile.create(profileData);
};
