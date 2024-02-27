import Base from './Base.js';

class Manager extends Base {
  generate(name, email, displayName) {
    this.name = name;
    this.email = email;
    this.displayName = displayName;

    this.put();

    return this;
  }
}

export default Manager;
