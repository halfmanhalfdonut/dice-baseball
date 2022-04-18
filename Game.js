import * as customElements from './src/custom-elements/index.js';

const App = async () => {
  Object.keys(customElements).forEach(name => {
    console.log(`initializing ${name} customElement`);
    customElements[name]();
  });
};

document.addEventListener('DOMContentLoaded', App);