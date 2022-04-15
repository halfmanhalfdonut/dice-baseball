import * as webComponents from './src/components/index.js';

const App = async () => {
  Object.keys(webComponents).forEach(name => {
    console.log(`initializing ${name} component`);
    webComponents[name]();
  });
};

document.addEventListener('DOMContentLoaded', App);