const Query = require('./query')

module.exports = class Session {
  constructor(driver) {
    this.driver = driver
    this.session = this.driver.session()
    this.queries = []
  }

  _ensureQuery(query, params) {
    if (typeof query === 'string') {
      query = new Query(query, params)
    }

    return query
  }

  query(query, params) {
    query = this._ensureQuery(query, params)
    this.queries.push(query)
    return this
  }

  run(query, params) {
    query = this._ensureQuery(query, params)
    return this.session.run(query.query, query.params)
  }

  execute() {
    return Promise.all(
      this.queries.map(query => this.run(query))
    )
  }
}
