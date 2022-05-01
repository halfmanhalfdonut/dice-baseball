const average = [ // 8 on-base options
  {
    description: 'Home Run',
    bases: 4,
    outs: 0,
    hits: 1
  },
  {
    description: 'Double',
    bases: 2,
    outs: 0,
    hits: 1
  },
  {
    description: 'Fly Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Walk',
    bases: 1,
    outs: 0,
    hits: 0
  },
  {
    description: 'Pop Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Single',
    bases: 1,
    outs: 0,
    hits: 1
  },
  {
    description: 'Double Play',
    bases: 0,
    outs: 2,
    hits: 0
  },
  {
    description: 'Ground Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Strike Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Single',
    bases: 1,
    outs: 0,
    hits: 1
  },
  {
    description: 'Strike Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Pop Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Triple',
    bases: 3,
    outs: 0,
    hits: 1
  },
  {
    description: 'Ground Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Fly Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Line Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Pop Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Strike Out',
    bases: 0,
    outs: 1,
    hits: 0
  },
  {
    description: 'Single',
    bases: 1,
    outs: 0,
    hits: 1
  },
  {
    description: 'Sacrifice Fly',
    bases: 1,
    outs: 1,
    hits: 0
  },
  {
    description: 'Home Run',
    bases: 4,
    outs: 0,
    hits: 1
  },
];

const homer = [ ...average ]; // 9 on-base options
homer[19] = Object.assign({}, average[0]); // replace sac fly with home run
homer[12] = Object.assign({}, average[5]); // replace triple with single

const slugger = [ ...average ]; // 10 on-base options
slugger[3] = Object.assign({}, average[5]); // replace walk with single
slugger[8] = Object.assign({}, average[1]); // replace strike out with double
slugger[11] = Object.assign({}, average[1]); // replace pop out with double

const weak = [ ...average ]; // 7 on-base options
weak[0] = Object.assign({}, average[5]); // replace home run with single
weak[1] = Object.assign({}, average[8]); // replace double with strike out
weak[12] = Object.assign({}, average[5]); // replace triple with single
weak[20] = Object.assign({}, average[5]); // replace home run with single

const blind = [ ...average ]; // 6 on-base options
blind[0] = Object.assign({}, average[8]); // replace home run with strike out
blind[1] = Object.assign({}, average[8]); // replace double with strike out
blind[12] = Object.assign({}, average[5]); // replace triple with single
blind[20] = Object.assign({}, average[5]); // replace home run with single

const diceCharacters = [ '', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅' ];

export { average, homer, slugger, weak, blind, diceCharacters };
