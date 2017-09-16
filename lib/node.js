const _ = require('lodash')
const Base = require('./base')

module.exports = class Node extends Base {
  constructor(props, identity) {
    super(props, identity)
    this.$labels = []
    let o = Object.getPrototypeOf.bind(Object)
    let proto
    // Neo4j supports multiple labels. Graphiti supports
    // this via inheritance chains. Here we walk the instance's
    // inheritance chain, starting with `this` to get all of
    // the parent classes until we reach Node itself (which
    // represents an unlabeled node). The first time, `proto`
    // is undefined so we get the prototype of `this` and
    // assign it to proto, then compare it to Node.prototype.
    // The next time around we'll get the prototype of _that_
    // prototype, it's parent class, and continue up the tree.
    while ((proto = o(proto || this)) !== Node.prototype) {
      let label = _.upperFirst(proto.constructor.name)
      this.$labels.push(label)
    }
  }

  /*
   * Generic hooks only applicable to nodes
   */

  // Before and after connecting this to another node via relationship
  $beforeConnect() {}
  $afterConnect() {}

  // Before and after removing a relationship from this node to another
  $beforeDisconnect() {}
  $afterDisconnect() {}
}
