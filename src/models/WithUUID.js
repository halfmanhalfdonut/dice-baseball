import { generateUUID } from '../services/Utils/Utils.js';

class WithUUID {
  constructor() {
    this.id = generateUUID();
  }
}

export default WithUUID;
