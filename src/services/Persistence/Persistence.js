import '../PouchDB/PouchDB.js';

const Persistence = {
  db: new PouchDB('db'),
};

export default Persistence;
