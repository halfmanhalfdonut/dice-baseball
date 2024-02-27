import Persistence from '../services/Persistence/Persistence.js';
import { generateUUID } from '../services/Utils/Utils.js';

class Base {
  constructor() {
    this._id = this._id ?? generateUUID();
  }

  fromJson(klass, json) {
    let o = new klass();
    Object.keys[json].forEach(key => o[key] = json[key]);

    return o;
  }

  async put() {
    try {
      await Persistence.db.put(this);
    } catch (err) {
      console.error(err);
    }
  }
}

export default Base;
