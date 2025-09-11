import app from './app.ts';
import env from './config/env.ts';
import { database, initModels } from './models/index.ts';
import { addCategories } from './seeds/categoriesAdding.ts';
import { addWords } from './seeds/wordsAdding.ts';

const PORT = env.PORT || 5010;

database.sync().then(async() => {
   initModels();
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Env mode: ${env.NODE_ENV}`);
  });
 await addCategories();
  await addWords();
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});
