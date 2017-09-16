const Base = require('./base')

module.exports = class Relationship extends Base {
  constructor(props, identity) {
    super(props, identity)
    if (this.constructor.name !== 'Relationship') {
      this.$labels = [this.constructor.name.toUpperCase()]
    } else {
      this.$labels = []
    }
  }
}
