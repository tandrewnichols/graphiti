const Base = require('../../lib/base')
const sinon = require('sinon')

describe('Base', () => {
  class TestBase extends Base {
    static get schema() {
      return 'schema'
    }
  }

  describe('constructor', () => {
    beforeEach(() => {
      sinon.stub(TestBase.prototype, '$assign')
    })

    afterEach(() => {
      TestBase.prototype.$assign.restore()
    })

    it('should not be instantiable', () => {
      (() => new Base()).should.throw('Cannot instantiate the Base class directly')
    })

    it('should do setup', () => {
      let test = new TestBase('props', 'id')
      test.$id.should.eql('id')
      test._back.should.eql('props')
      test.$assign.should.have.been.calledWith('props')
      test.$schema.should.eql('schema')
    })
  })

  describe('$assign', () => {
    let test
    beforeEach(() => {
      test = new TestBase({ foo: 'bar' })
    })

    context('initial props', () => {
      it('should set the props object', () => {
        test.props.should.eql({ foo: 'bar' })
      })

      it('should create getters and setters', () => {
        test.foo.should.eql('bar')
        test.foo = 'banana'
        test.props.foo.should.eql('banana')
      })

      it('should back up the fields', () => {
        test._back.should.eql({ foo: 'bar' })
      })
    })

    context('adding to existing props', () => {
      beforeEach(() => {
        test.$assign({ baz: 'quux' })
      })

      it('should add new props to props', () => {
        test.props.should.eql({ foo: 'bar', baz: 'quux' })
      })

      it('should create getters and setters', () => {
        test.baz.should.equal('quux')
        test.baz = 'banana'
        test.props.baz.should.eql('banana')
      })
    })

    context('overwriting existing props', () => {
      beforeEach(() => {
        test.$assign({ foo: 'banana' })
      })

      it('should update the props in props', () => {
        test.props.should.eql({ foo: 'banana' })
      })

      it('should recreate getters and settings', () => {
        test.foo.should.eql('banana')
        test.foo = 'apple'
        test.props.foo.should.eql('apple')
      })
    })

    context('adding a single key/value pair', () => {
      beforeEach(() => {
        test.$assign('baz', 'quux')
      })

      it('should add new props to props', () => {
        test.props.should.eql({ foo: 'bar', baz: 'quux' })
      })

      it('should create getters and setters', () => {
        test.baz.should.equal('quux')
        test.baz = 'banana'
        test.props.baz.should.eql('banana')
      })
    })
  })

  describe('$reset', () => {
    let test
    beforeEach(() => {
      test = new TestBase({ foo: 'bar' })
      test.foo = 'banana'
      test.$assign({ baz: 'quux' })
      sinon.stub(test, '$assign')
      test.$reset()
    })

    afterEach(() => {
      test.$assign.restore()
    })

    it('should reset props', () => {
      (test.props === undefined).should.be.true()
    })

    it('should reset getters/setters', () => {
      (test.baz === undefined).should.be.true()
    })

    it('should call $assign with the back up', () => {
      test.$assign.should.have.been.calledWith({ foo: 'bar' })
    })
  })
})
