import { WordAttributes, Word } from "../models/word.model";
import words from './household.json' with { type: "json" };
import { Category } from "../models/category.model.ts";
import food1 from './food1.json' with { type: "json" };
import food2 from './food2.json' with { type: "json" };
import food3 from './food3.json' with { type: "json" };
import food4 from './food4.json' with { type: "json" };
import food5 from './food5.json' with { type: "json" };
import clothing from './clothing1.json' with { type: "json" };
import clothing2 from './clothing2.json' with { type: "json" };
import clothing3 from './clothing3.json' with { type: "json" };
import clothing4 from './clothing4.json' with { type: "json" };
import family1 from './family1.json' with { type: "json" };
import family2 from './family2.json' with { type: "json" };
import family3 from './family3.json' with { type: "json" };
import family4 from './family4.json' with { type: "json" };
import pepoel1 from './people1.json' with { type: "json" };
import pepoel2 from './people2.json' with { type: "json" };
import pepoel3 from './people3.json' with { type: "json" };
import pepoel4 from './people4.json' with { type: "json" };
import animals1 from './animals1.json' with { type: "json" };
import animals2 from './animals2.json' with { type: "json" };
import animals3 from './animals3.json' with { type: "json" };
import plants1 from './plants_nature_pack_1.json' with { type: "json" };
import plants2 from './plants_nature_pack_2.json' with { type: "json" };
import plants3 from './plants_nature_pack_3.json' with { type: "json" };
import body1 from './body_parts_pack_1.json' with { type: "json" };
import body2 from './body_parts_pack_2.json' with { type: "json" };
import body3 from './body_parts_pack_3.json' with { type: "json" };
import body4 from './body_parts_pack_4.json' with { type: "json" };
import health1 from './health_illness_pack_1.json' with { type: "json" };
import health2 from './health_illness_pack_2.json' with { type: "json" };
import health3 from './health_illness_pack_3.json' with { type: "json" };
import emotions1 from './emotions_pack_1.json' with { type: "json" };
import emotions2 from './emotions_pack_2.json' with { type: "json" };
import emotions3 from './emotions_pack_3.json' with { type: "json" };
import weather1 from './weather_climate_pack_1.json' with { type: "json" };
import weather2 from './weather_climate_pack_2.json' with { type: "json" };
import geography1 from './geography_environment_pack_1.json' with { type: "json" };
import geography2 from './geography_environment_pack_2.json' with { type: "json" };
import place1 from './places_in_town_pack_1.json' with { type: "json" };
import place2 from './places_in_town_pack_2.json' with { type: "json" };
import transortation1 from './transportation_pack_1.json' with { type: "json" };    
import transortation2 from './transportation_pack_2.json' with { type: "json" };
import schcool1 from './school_learning_pack_1.json' with { type: "json" };
import schcool2 from './school_learning_pack_2.json' with { type: "json" };
import work1 from './work_business_pack_1.json' with { type: "json" };
import work2 from './work_business_pack_2.json' with { type: "json" };
import work3 from './work_business_pack_3.json' with { type: "json" };
import art1 from './arts_entertainment_pack_1.json' with { type: "json" };
import art2 from './arts_entertainment_pack_2.json' with { type: "json" };
import media1 from './media_technology_pack_1.json' with { type: "json" };
import media2 from './media_technology_pack_2.json' with { type: "json" };
import politic1 from './politics_law_pack_1.json' with { type: "json" };
import politic2 from './politics_law_pack_2.json' with { type: "json" };
import religion1 from './religion_beliefs_pack_1.json' with { type: "json" };
import timesAndDates1 from './time_dates_pack_1.json' with { type: "json" };
import timesAndDates2 from './time_dates_pack_2.json' with { type: "json" };
import numbers1 from './numbers_measurements_pack_1.json' with { type: "json" };
import numbers2 from './numbers_measurements_pack_2.json' with { type: "json" };
import colors1 from './colors_shapes_pack_1.json' with { type: "json" };
import colors2 from './colors_shapes_pack_2.json' with { type: "json" };
import daily1 from './daily_actions_verbs_pack_1.json' with { type: "json" };
import daily2 from './daily_actions_verbs_pack_2.json' with { type: "json" };
import daily3 from './daily_actions_verbs_pack_3.json' with { type: "json" };
import abstract1 from './abstract_concepts_pack_1.json' with { type: "json" };
import abstract2 from './abstract_concepts_pack_2.json' with { type: "json" };
import abstract3 from './abstract_concepts_pack_3.json' with { type: "json" };






words.push(...food1);
words.push(...food2);
words.push(...food3);
words.push(...food4);
words.push(...food5);
words.push(...clothing);
words.push(...clothing2);
words.push(...clothing3);
words.push(...clothing4);
words.push(...family1);
words.push(...family2);
words.push(...family3);
words.push(...family4);
words.push(...pepoel1);
words.push(...pepoel2);
words.push(...pepoel3);
words.push(...pepoel4);
words.push(...animals1);
words.push(...animals2);
words.push(...animals3);
words.push(...plants1);
words.push(...plants2);
words.push(...plants3);
words.push(...body1);
words.push(...body2);
words.push(...body3);
words.push(...body4);
words.push(...health1);
words.push(...health2);
words.push(...health3);
words.push(...emotions1);
words.push(...emotions2);
words.push(...emotions3);
words.push(...weather1);
words.push(...weather2);
words.push(...geography1);
words.push(...geography2);
words.push(...place1);
words.push(...place2);
words.push(...transortation1);
words.push(...transortation2);
words.push(...schcool1);
words.push(...schcool2);
words.push(...work1);
words.push(...work2);
words.push(...work3);
words.push(...art1);
words.push(...art2);
words.push(...media1);
words.push(...media2);
words.push(...politic1);
words.push(...politic2);
words.push(...religion1);
words.push(...timesAndDates1);
words.push(...timesAndDates2);
words.push(...numbers1);
words.push(...numbers2);
words.push(...colors1);
words.push(...colors2);
words.push(...daily1);
words.push(...daily2);
words.push(...daily3);
words.push(...abstract1);
words.push(...abstract2);
words.push(...abstract3);









export async function addWords() {
  for (const wordData of words) {
    const wordExists = await Word.findOne({ where: { text: wordData.text } });
    if (wordExists) {
      continue; 
    }

    // Check if category exists
    let categoryId = null;
    if (wordData.categoryId) {
      const category = await Category.findOne({ where: { name: wordData.categoryId } });
      if (category) {
        categoryId = category.id;
      }
    }
    const word: WordAttributes = {
      text: wordData.text,
      meaning: wordData.meaning,
      example: wordData.example || "",
      categoryId: categoryId,
      frTranslation: wordData.frTranslation || "",
      esTranslation: wordData.esTranslation || "",
      arTranslation: wordData.arTranslation || "",
      level: wordData.level as WordAttributes["level"],
      synonyms: wordData.synonyms || [],
      antonyms: wordData.antonyms || [],
      lexicalField: wordData.lexicalField || [],
      pronunciation: wordData.pronunciation || "",
    };
    await Word.create(word);
  }
  console.log("Words added successfully.");
}