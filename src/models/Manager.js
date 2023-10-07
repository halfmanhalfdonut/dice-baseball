import WithUUID from './WithUUID.js';

class Manager extends WithUUID {
  constructor(name, email, displayName) {
    super();

    this.name = name;
    this.email = email;
    this.displayName = displayName;
  }
}

export default Manager;
