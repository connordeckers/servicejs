import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const src = path.normalize(process.cwd() + '/package.json');

if (!fs.existsSync(src)) {
  console.error(chalk.red('package.json not found.'));
  process.exit(0);
}

const packageEnv = require(src);

if (packageEnv.name.startsWith('@') && packageEnv.name.includes('/')) {
  let [scope, name] = packageEnv.name.split('/');
  packageEnv.scope = scope;
  packageEnv.name = name;
} else {
  packageEnv.scope = '';
}

export default packageEnv;