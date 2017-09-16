const base = {
  Node: require('./node'),
  Relationshp: require('./relationship')
}

module.exports = class ClassWithDriver {
  /*
   * Creates a version of the Node class that includes
   * the passed in driver and config, but without polluting
   * the original class. This allows subclassing directly,
   * as well as through the class that instantiates ClassWithDriver
   */
  constructor(type, driver, config) {
    // Create an anonymous class
    let Clone = function() {}
    // Set its prototype to the prototype of Node or Relationshp
    // but add driver and config as non-enumerable, write-only fields
    Clone.prototype = Object.create(base[ type ].prototype, {
      driver: {
        writable: false,
        configurable: false,
        enumerable: false,
        value: driver
      },
      config: {
        writable: false,
        configurable: false,
        enumerable: false,
        value: config
      }
    })

    return Clone
  }
}

