const Query = require('../../lib/query')
const Node = require('../../lib/node')
const sinon = require('sinon')

describe('Query', function() {
  var subject = proxyquire('../../lib/query')

  describe('.create', () => {
    let query
    beforeEach(() => {
      let a = new Node({ foo: 'bar' })
      let b = new Node({ baz: 'quux' })
      sinon.stub(a, '$serialize')
      sinon.stub(b, '$serialize')
      a.$serialize.returns({
        text: '(apple)',
        params: {
          propsa: {
            foo: 'bar'
          }
        },
        identifier: 'a'
      })
      b.$serialize.returns({
        text: '(banana)',
        params: {
          propsb: {
            baz: 'quux'
          }
        },
        identifier: 'b'
      })

      query = Query.create(a, b)
    })

    it('should have the correct text', () => {
      query.text.should.eql('CREATE (apple),(banana) RETURN a,b')
    })

    it('should have the correct params', () => {
      query.params.should.eql({
        propsa: {
          foo: 'bar'
        },
        propsb: {
          baz: 'quux'
        }
      })
    })
  })
});
