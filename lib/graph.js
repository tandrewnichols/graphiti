const neo4j = require('neo4j-driver').v1
const cleanup = require('node-cleanup')
const globby = require('globby')
const EventEmitter = require('events')

const ClassWithDriver = require('./class-with-driver')
let defaults = {
  username: 'neo4j',
  password: 'neo4j',
  uri: 'http://localhost:7474'
}

module.exports = class Graph extends EventEmitter {
  constructor(config = defaults) {
    super()
    // Create the driver with the authentication passed in
    let auth = neo4j.auth.basic(config.username, config.password)
    let driver = this.driver = neo4j.driver(config.uri, auth)

    // Clone the Node and Relationship classes to create classes that
    // have the driver and config properties
    this.Node = new ClassWithDriver('Node', driver, config)
    this.Relationship = new ClassWithDriver('Relationshp', driver, config)

    // Indicate when the driver connected successfully
    driver.onCompleted(() => {
      this.ready = true
      this.emit('ready')
    })

    // And when it errored
    driver.onError(err => {
      this.error = true
      this.emit('error')
    })

    // Make sure to close the driver if node exits unexpectedly
    cleanup(() => this.close())
  }

  // Expose onComplete for user action
  onComplete(fn) {
    return this.driver.onCompleted(fn)
  }

  // Expose onError for user action
  onError(fn) {
    return this.driver.onError(fn)
  }

  /*
   * register
   * 
   * Auto registration for nodes and relationships
   * 
   * @param {Object} patterns
   * @param {(string|string[])} patterns.nodes - One or more globstar
   *    patterns indicating where on the file system to find nodes
   * @param {(string|string[])} patterns.relationships - One or more globstar
   *    patterns indicating where on the file system to find relationships
   *    
   * @returns {Object} { nodeModels, relationTypes }
   *    
   */
  register({ nodes, relationships }) {
    // Register nodes and then relationships
    return this.registerNodeModels(nodes)
      .then(nodeModels => {
        return this.registerRelationshipTypes(relationships).then(relationshipTypes => {
          return { nodeModels, relationshipTypes };
        })
      })
  }

  /*
   * registerModesl
   * 
   * Auto-node registration. 
   * 
   * @param {(string|string[])} patterns - One or more globstar patterns
   *  indicating where on the file system to find nodes
   *  
   */
  registerNodeModels(patterns) {
    // Lookup the modesl
    return this._register(patterns).then(nodeModels => {
      // Expose them on the graph instance under "nodes"
      this.nodeModels = nodeModels

      // But also expose each node separately on the graph instance
      // so you can do things like `new graph.User`
      nodeModels.forEach(model => this[ model.name ] = model)
      return nodeModels
    })
  }

  /*
   * registerRelationshipTypes
   * 
   * Auto-relationship registration. 
   * 
   * @param {(string|string[])} patterns - One or more globstar patterns
   *  indicating where on the file system to find relationships
   *  
   */
  registerRelationshipTypes(patterns) {
    // Lookup the relationships
    return this._register(patterns).then(rels => {
      // Expose them on the graph instance under "relationships"
      this.relationshipTypes = rels

      // But also expose each relationship separately on the graph instance
      // so you can do things like `new graph.Created`
      rels.forEach(rel => this[ rel.name ] = rel)
      return rels
    })
  }

  // Read in all nodes or relationships based on one or more globs passed in
  _register(patterns) {
    // Expand the globs
    return globby(patterns).then(paths => {
      // and for each path, require the file there
      return paths.map(path => require(path))
    })
  }

  close() {
    this.driver.close()
  }
}
