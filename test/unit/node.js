const Node = require('../../lib/node')

describe('Node', () => {
  class User extends Node {
    constructor(props) {
      super(props)
      this.$identifier = 'user'
    }
  }

  class Admin extends User {
    constructor(props) {
      super(props)
      this.$identifier = 'admin'
    }
  }

  describe('constructor', () => {
    let node
    let user
    let admin
    beforeEach(() => {
      node = new Node({ foo: 'bar' })
      user = new User({ name: 'Bob' })
      admin = new Admin({ name: 'Tony' })
    })

    it('should have the correct labels', () => {
      node.$labels.should.eql([])
      user.$labels.should.eql(['User'])
      admin.$labels.should.eql(['Admin', 'User'])
    })
  })

  describe('#$serialize', () => {
    let user
    let admin
    beforeEach(() => {
      user = new User({ name: 'Bob' })
      admin = new Admin({
        name: 'Tony',
        age: 42,
        contact: {
          phone: '555-555-5555',
          email: 'tony@email.com'
        }
      })
    })
    
    context('with parameterize: true', () => {
      it('should return parameters', () => {
        user.$serialize(true).should.eql({
          text: '(user:User $propsuser)',
          params: {
            propsuser: {
              name: 'Bob'
            }
          },
          identifier: 'user'
        })
      })
    })

    context('without parameterize', () => {
      context('with a single property', () => {
        it('should return no parameters', () => {
          user.$serialize().should.eql({
            text: "(user:User { name: 'Bob' })",
            identifier: 'user'
          })
        })
      })

      context('with multiple properties', () => {
        it('should correctly serialize the properties', () => {
          admin.$serialize().should.eql({
            text: "(admin:Admin:User { name: 'Tony', age: 42, contact: '{\"phone\":\"555-555-5555\",\"email\":\"tony@email.com\"}' })",
            identifier: 'admin'
          })
        })
      })
    })
  })
})
