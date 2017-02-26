const async = require('async');
const request = require('request');
const cp = require('child_process');

describe('graphiti', function() {
  before(function(done) {
    this.subject = require('../../lib/graphiti');
    cp.spawn('ineo', ['start', '7400'], { stdio: 'inherit' }).on('close', () => done() );
  });

  it('should be a string', function() {
    'string'.should.equal('string');
  });

  after(function(done) {
    cp.spawn('ineo', ['stop', '7400'], { stdio: 'inherit' }).on('close', () => done() );
  });
});
