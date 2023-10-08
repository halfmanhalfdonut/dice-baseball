import Persistence from '../services/Persistence/Persistence.js';
import { generateUUID } from '../services/Utils/Utils.js';

class WithUUID {
  constructor() {
    this._id = this._id ?? generateUUID();
  }

  async put() {
    try {
      await Persistence.db.put(this);
    } catch (err) {
      console.error(err);
    }
  }
}

export default WithUUID;
