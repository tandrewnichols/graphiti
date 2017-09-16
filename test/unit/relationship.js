const Relationship = require('../../lib/relationship')

describe('Relationship', () => {
  class Likes extends Relationship {
    constructor(props) {
      super(props)
      this.$identifier = 'likes'
    }
  }

  let relationship
  let likes
  beforeEach(() => {
    relationship = new Relationship({ foo: 'bar' })
    likes = new Likes({ created: 'now' })
  })

  describe('constructor', () => {
    it('should have the correct type', () => {
      relationship.$labels.should.eql([])
      likes.$labels.should.eql(['LIKES'])
    })
  })

  describe('#$serialize', () => {
    context('with parameterize: true', () => {
      it('should return parameters', () => {
        likes.$serialize(true).should.eql({
          text: '(likes:LIKES $propslikes)',
          params: {
            propslikes: {
              created: 'now'
            }
          },
          identifier: 'likes'
        })
      })
    })

    context('without parameterize', () => {
      context('with a single property', () => {
        it('should return no parameters', () => {
          likes.$serialize().should.eql({
            text: "(likes:LIKES { created: 'now' })",
            identifier: 'likes'
          })
        })
      })

      context('with multiple properties', () => {
        beforeEach(() => {
          likes.$assign({ count: 12, details: { hello: 'world' } })
        })

        it('should correctly serialize the properties', () => {
          likes.$serialize().should.eql({
            text: "(likes:LIKES { created: 'now', count: 12, details: '{\"hello\":\"world\"}' })",
            identifier: 'likes'
          })
        })
      })
    })
  })
})
