let headTag;

const random = max => ~~(Math.random() * max); // ~~ effectively does the same as Math.floor but more efficiently

const addStyles = (styles, from) => {
  const element = document.createElement('style');
  element.setAttribute('data-from', `from-${from}`);
  element.textContent = styles;

  if (!headTag) {
    console.log('Setting head tag');
    headTag = document.getElementsByTagName('head')[0];
  }

  headTag.appendChild(element);
}

const numberToOrdinal = n => {
  let ordinal = String(n);
  let suffixes = [, 'st', 'nd', 'rd' ];

  return ordinal + (suffixes[ordinal.match('1?.$')] || 'th');
}

export { addStyles, numberToOrdinal, random };
