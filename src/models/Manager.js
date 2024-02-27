import Base from './Base.js';

class Manager extends Base {
  constructor(name, email, displayName) {
    super();

    this.name = name;
    this.email = email;
    this.displayName = displayName;
  }
}

export default Manager;
