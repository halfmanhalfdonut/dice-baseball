let headTag; // cache the head tag element for later appends

const random = max => ~~(Math.random() * max); // ~~ effectively does the same as Math.floor but more efficiently

const addStyles = (styles, from) => {
  const element = document.createElement('style');
  element.setAttribute('data-from', from);
  element.textContent = styles;

  if (!headTag) {
    headTag = document.getElementsByTagName('head')[0];
  }

  headTag.appendChild(element);
};

const idOptions = 'abcdef0123456789'.split('');
const generateUUID = () => {
  if (self.crypto?.randomUUID) {
    return self.crypto.randomUUID();
  } else {
    let pseudoId = '';
    for (let i = 0; i < 36; i++) {
      pseudoId += idOptions[~~(Math.random() * idOptions.length)];
    }

    return pseudoId;
  }
};

export { addStyles, generateUUID, random };
