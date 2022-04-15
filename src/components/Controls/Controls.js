class Controls extends HTMLElement {
  constructor() {
    super();
  }

  handleRoll = () => {
    // nothing yet
  }

  connectedCallback() {
    const button = document.createElement('button');
    button.setAttribute('class', 'pitch');
    button.innerText = 'Pitch';
    button.onclick = this.handleRoll;
    
    this.appendChild(button);
  }
}

export const controls = () => customElements.define('db-controls', Controls);
