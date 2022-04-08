const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
  // Configure Angular `environment.ts` file path
  const targetPath = '../../src/environments/environment.prod.json';

  // `environment.ts` file structure
  const envConfigFile = process.env.FIREBASE;

  console.log('The file `environment.prod.json` will be written with the following content: \n');
  writeFile(targetPath, envConfigFile, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(`Angular environment.prod.json file generated correctly at ${targetPath} \n`);
    }
  });
};

setEnv();

