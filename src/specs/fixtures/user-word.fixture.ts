import { UserWord } from "../../models/user-word.model";
import { createUserFixture } from "./user.fixture";
import { createWordFixture } from "./word.fixture";

export const createUserWordFixture = async (overrides: Partial<{userId: string; wordId: string; isLearned: boolean;}> = {}) => {
  const user = overrides.userId ? { id: overrides.userId } : await createUserFixture();
  const word = overrides.wordId ? { id: overrides.wordId } : await createWordFixture();

  if (!user.id || !word.id) {
    throw new Error("user.id and word.id must be defined");
  }

  const userWordData = {
    userId: user.id as string,
    wordId: word.id as string,
    isLearned: overrides.isLearned ?? false,
  };

  const userWord = await UserWord.create(userWordData);
  return userWord.toJSON();
}

