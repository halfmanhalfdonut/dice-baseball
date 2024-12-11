import { generateUUID } from '../services/Utils/Utils.js';

class Base {
  constructor() {
    this._id = this._id ?? generateUUID();
  }
}

export default Base;
