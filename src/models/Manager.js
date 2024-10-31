import Base from './Base.js';

class Manager extends Base {
  constructor(name = '', email = '', displayName = '') {
    super();
    this.name = name;
    this.email = email;
    this.displayName = displayName;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setEmail(email) {
    this.email = email;
    return this;
  }

  setDisplayName(displayName) {
    this.displayName = displayName;
    return this;
  }
}

export default Manager;
