const execSync = require('child_process').execSync;
const mssg = 'BUILD - ' + process.argv[2];
execSync('npm run build-only && git add dist -f && git commit -m "Adding dist" &&  git subtree push --prefix dist origin gh-pages');