const ClassWithDriver = require('../../lib/class-with-driver')

describe('ClassWithDriver', () => {
  describe('constructor', () => {
    it('creates an instance of the base node type with a driver property', () => {
      let Node = new ClassWithDriver('Node', 'driver', 'config')
      let instance = new Node({})
      let keys = Object.keys(instance)
      instance.driver.should.eql('driver')
      instance.config.should.eql('config')
      keys.indexOf('driver').should.eql(-1)
      keys.indexOf('config').should.eql(-1)
      instance.constructor.name.should.eql('Node')
    });
  });
});
