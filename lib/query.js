let _ = require('lodash')

module.exports = class Query {
  constructor(query, params) {
    this.text = query
    this.params = params
  }

  static create(...nodes) {
    let params = {}
    let ret = []
    let text = nodes.map(node => {
      let serialization = node.$serialize(true)
      params = _.assign(params, serialization.params)
      ret.push(serialization.identifier)
      return serialization.text
    }).join(',')
    return new Query(`CREATE ${text} RETURN ${ret.join(',')}`, params)
  }
}
