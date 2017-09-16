const sinon = require('sinon')
const neo4j = {
  v1: {
    auth: {
      basic: sinon.stub()
    },
    driver: sinon.stub()
  }
}
const cleanup = sinon.stub()
const Graph = require('proxyquire').noCallThru()('../../lib/graph', {
  'neo4j-driver': neo4j,
  'node-cleanup': cleanup
})

describe('Graph', () => {
  let graph
  let driver = {
    onCompleted: sinon.stub(),
    onError: sinon.stub()
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
})
