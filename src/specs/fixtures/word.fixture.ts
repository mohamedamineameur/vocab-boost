import { Word } from "../../models";
import { WordAttributes } from "../../models/word.model.ts";
import { createCategoryFixture } from "./category.fixture.ts";
import { faker } from "@faker-js/faker";
const wordFixture = async (overrides: Partial<WordAttributes> = {}): Promise<WordAttributes> => {
  return {
    categoryId: (await createCategoryFixture()).id,
    text: faker.word.sample(),
    meaning: faker.lorem.sentence(),
    example: "This is an example sentence using the sample word.",
    frTranslation: "Mot d'exemple",
    esTranslation: "Palabra de ejemplo",
    arTranslation: "كلمة عينة",
    synonyms: ["Example", "Sample"],
    antonyms: ["Counterexample"],
    lexicalField: ["Linguistics"],
    level: "beginnerLevelOne",
    pronunciation: "/ˈsæmpl/",
    ...overrides,
  };
};

export const createWordFixture = async (overrides: Partial<WordAttributes> = {}) => {
  const wordData = await wordFixture(overrides);
  const word = await Word.create(wordData);
  return word.toJSON();
};
