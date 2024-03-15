/**
 * Script to read package.json, filter out of un-needed elements and save in the dist folder
 */
const fs = require('node:fs/promises');
const path = require('node:path');

const filePath = path.join(__dirname, '..', 'package.json');
const destinationPath = path.join(__dirname, '..', 'dist', 'package.json');

(async () => {
  console.group('Copying package.json');
  try {
    console.log('Source', filePath);
    console.log('Destination', filePath);

    const data = await fs.readFile(filePath);
    const package = JSON.parse(data.toString());
    console.log(`The package.json for module ${package.name} was loaded`);
    console.log('Cleaning');
    // delete un-needed elements
    delete package.devDependencies;
    delete package.scripts;
    delete package.dependencies['@repo/utils'];

    // saving
    console.log('Saving');
    await fs.writeFile(destinationPath, JSON.stringify(package), 'utf-8');
    console.log('Success');
  } catch (error) {
    console.error(error);
  }
  console.groupEnd('Copying package.json');
})();
