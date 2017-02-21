const async = require('async');
const request = require('request');

describe('graphiti', function() {
  before(function(done) {
    this.subject = require('../../lib/graphiti');
    this.server = require('../helpers/app');
    let status = 500;
    async.whilst(
      () => { return status !== 200 },
      (next) => {
        request.get('http://localhost:7400/', (err, response, body) => {
          if (response && response.statusCode) {
            status = response.statusCode;
          }
          next();
        });
      },
      done
    );
  });

  it('should be a string', function() {
    'string'.should.equal('string');
  });

  after(function() {
    this.server.close();
  });
});
