const packageEnv = Object.entries(process.env).filter(([key]) => key.startsWith('npm_package')).reduce((o: any, c) => { o[c[0].replace('npm_package_', '')] = c[1]; return o; }, {});
if (packageEnv.name.startsWith('@') && packageEnv.name.includes('/')) {
  let [scope, name] = packageEnv.name.split('/');
  packageEnv.scope = scope;
  packageEnv.name = name;
} else {
  packageEnv.scope = '';
}

export default packageEnv;