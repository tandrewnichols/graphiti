const sinon = require('sinon')
const neo4j = {
  v1: {
    auth: {
      basic: sinon.stub()
    },
    driver: sinon.stub()
  }
}
const globby = sinon.stub()
const cleanup = sinon.stub()
class Foo {}
class Bar {}
const Graph = require('proxyquire').noCallThru()('../../lib/graph', {
  'neo4j-driver': neo4j,
  'node-cleanup': cleanup,
  globby: globby,
  foo: Foo,
  bar: Bar
})

describe('Graph', () => {
  let graph
  let driver = {
    onCompleted: sinon.stub(),
    onError: sinon.stub(),
    close: sinon.stub()
  }

  afterEach(() => {
    driver.onCompleted.reset()
    driver.onError.reset()
  })

  describe('constructor', () => {
    context('using default connection params', () => {
      beforeEach(() => {
        neo4j.v1.auth.basic.withArgs('neo4j', 'neo4j').returns('auth')
        neo4j.v1.driver.withArgs('http://localhost:7474', 'auth').returns(driver)
        graph = new Graph()
        sinon.stub(Graph.prototype, 'close')
        sinon.stub(Graph.prototype, 'emit')
      })

      afterEach(() => {
        Graph.prototype.close.restore()
        Graph.prototype.emit.restore()
      })

      it('should setup the driver', () => {
        graph.driver.should.eql(driver)
        new graph.Node().driver.should.eql(driver)
        new graph.Relationship().driver.should.eql(driver)
        driver.onCompleted.should.have.been.calledWith(sinon.match.func)
        driver.onError.should.have.been.calledWith(sinon.match.func)

        driver.onCompleted.getCall(0).args[0]()
        graph.ready.should.be.true()
        graph.emit.should.have.been.calledWith('ready')

        driver.onError.getCall(0).args[0]()
        graph.error.should.be.true()
        graph.emit.should.have.been.calledWith('error')
      })

      it('should cleanup after itself', () => {
        cleanup.should.have.been.calledWith(sinon.match.func)
        cleanup.getCall(0).args[0]()
        graph.close.should.have.been.called()
      })
    })

    context('using default passed in params', () => {
      let graph
      beforeEach(() => {
        neo4j.v1.auth.basic.withArgs('foo', 'bar').returns('auth')
        neo4j.v1.driver.withArgs('http://baz.quux.com:8080', 'auth').returns(driver)
        graph = new Graph({
          username: 'foo',
          password: 'bar',
          uri: 'http://baz.quux.com:8080'
        })
        sinon.stub(Graph.prototype, 'emit')
      })

      afterEach(() => {
        Graph.prototype.emit.restore()
      })

      it('should setup the driver', () => {
        global.graphThing = graph
        graph.driver.should.eql(driver)
        new graph.Node().driver.should.eql(driver)
        new graph.Relationship().driver.should.eql(driver)
        driver.onCompleted.should.have.been.calledWith(sinon.match.func)
        driver.onError.should.have.been.calledWith(sinon.match.func)

        driver.onCompleted.getCall(0).args[0]()
        graph.ready.should.be.true()
        graph.emit.should.have.been.calledWith('ready')

        driver.onError.getCall(0).args[0]()
        graph.error.should.be.true()
        graph.emit.should.have.been.calledWith('error')
      })
    })
  })

  describe('#onComplete', () => {
    beforeEach(() => {
      graph = new Graph()
      graph.onComplete('fn')
    })

    it('should call driver.onCompleted', () => {
      graph.driver.onCompleted.should.have.been.calledWith('fn')
    })
  })

  describe('#onError', () => {
    beforeEach(() => {
      graph = new Graph()
      graph.onError('fn')
    })

    it('should call driver.onError', () => {
      graph.driver.onError.should.have.been.calledWith('fn')
    })
  })

  describe('#register', () => {
    let cb = sinon.stub()
    beforeEach(() => {
      sinon.stub(Graph.prototype, 'registerNodeModels')
      sinon.stub(Graph.prototype, 'registerRelationshipTypes')
      Graph.prototype.registerNodeModels.withArgs('nodes').resolves('foo')
      Graph.prototype.registerRelationshipTypes.withArgs('relationships').resolves('bar')
      graph = new Graph()
      return graph.register({ nodes: 'nodes', relationships: 'relationships' }).then(cb)
    })

    afterEach(() => {
      Graph.prototype.registerNodeModels.restore()
      Graph.prototype.registerRelationshipTypes.restore()
    })

    it('should register node models and then relationship types', () => {
      cb.should.have.been.calledWith({
        nodeModels: 'foo',
        relationshipTypes: 'bar'
      })
    })
  })

  describe('#registerNodeModels', () => {
    let cb = sinon.stub()

    beforeEach(() => {
      sinon.stub(Graph.prototype, '_register')
      Graph.prototype._register.withArgs('patterns').resolves([Foo, Bar])
      graph = new Graph()
      return graph.registerNodeModels('patterns').then(cb)
    })

    afterEach(() => {
      Graph.prototype._register.restore()
    })

    it('should assign the models to the graph instance', () => {
      graph.nodeModels.should.eql([Foo, Bar])
      graph.Foo.should.eql(Foo)
      graph.Bar.should.eql(Bar)
      cb.should.have.been.calledWith([Foo, Bar])
    })
  })

  describe('#registerRelationshipTypes', () => {
    let cb = sinon.stub()

    beforeEach(() => {
      sinon.stub(Graph.prototype, '_register')
      Graph.prototype._register.withArgs('patterns').resolves([Foo, Bar])
      graph = new Graph()
      return graph.registerRelationshipTypes('patterns').then(cb)
    })

    afterEach(() => {
      Graph.prototype._register.restore()
    })

    it('should assign the types to the graph instance', () => {
      graph.relationshipTypes.should.eql([Foo, Bar])
      graph.Foo.should.eql(Foo)
      graph.Bar.should.eql(Bar)
      cb.should.have.been.calledWith([Foo, Bar])
    })
  })

  describe('#_register', () => {
    let cb = sinon.stub()

    beforeEach(() => {
      globby.withArgs('patterns').resolves(['foo', 'bar'])
      return graph._register('patterns').then(cb)
    })

    it('should require all models', () => {
      cb.should.have.been.calledWith([Foo, Bar])
    })
  })

  describe('#close', () => {
    beforeEach(() => {
      graph = new Graph()
      graph.close()
    })

    it('should call driver.close', () => {
      driver.close.should.have.been.called
    })
  })
})
