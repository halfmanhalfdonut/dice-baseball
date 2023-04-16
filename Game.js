import * as customElements from './src/custom-elements/index.js';

const App = () => {
  Object.keys(customElements).forEach(name => {
    console.log(`initializing ${name} customElement`);
    customElements[name]();
  });

  document.dispatchEvent(new CustomEvent('game:loaded'));
};

document.addEventListener('DOMContentLoaded', App);