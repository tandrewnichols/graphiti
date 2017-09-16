const _ = require('lodash')
const Joi = require('joi')
const Session = require('./session')
const Query = require('./query')
const rs = require('randomstring')
const IDENTIFIER_LENGTH = 6

module.exports = class Base {
  constructor(props, identity) {
    if (new.target === Base) {
      throw new TypeError('Cannot instantiate the Base class directly')
    }
    this.$id = identity
    this.$identifier = rs.generate(IDENTIFIER_LENGTH)
    this._back = _.clone(props)
    this.$assign(props)
    this.$schema = this.constructor.schema
  }

  /*
   * $assign
   * 
   * Add new props to the existing properties
   * 
   */
  $assign(props, val) {
    // Allow assigning single key/val as non-object
    if (arguments.length > 1) {
      props = { [props]: val }
    }

    // Make sure this.props is an object
    this.props = this.props || {}

    // Add the new props to that
    _.extend(this.props, props)

    // For each property
    _.each(props, (val, key) => {
      // Don't redefine the getter/setter if the field
      // is already present. The logic is the same so
      // we don't need to update it.
      if (!this[key]) {
        // Create a getter/setter pair on `this`. Why?
        // Because it feels a lot cleaner to say
        // user.firstname instead of user.props.firstname.
        // But it's important to also keep `this.props` around
        // so it's easy to know what part of the object to
        // serialize for the graph later, and the setter is
        // a good way of keeping `this.key` and `this.props.key`
        // in sync.
        Object.defineProperty(this, key, {
          enumerable: true,
          configurable: true,
          get: () => this.props[key],
          set: (val) => {
            this.props[key] = val
            return this
          }
        })
      }
    })
  }

  /*
   * $reset
   * 
   * Undo any unsaved changes to this object
   * 
   */
  $reset() {
    // Delete individual properties on this
    for (let k in this.props) {
      delete this[k]
    }
    // And delete this.props
    delete this.props
    // Then restore this.props from this._back
    this.$assign(_.clone(this._back))
  }

  $create(props) {
    if (props) {
      this.$assign(props)
    }

    return Promise.resolve(this.$beforeCreate()).then(() => {
      let session = new Session(this.driver)
      let query = Query.create(this).return(this)
    })
  }

  $update(props) {
    if (props) {
      this.$assign(props)
    }

  }

  $save(props) {
    return Promise.resolve(this.$beforeUpdate()).then(() => {
      // If this node or relationship has an id, it already
      // exists, so update it. Otherwise, create it.
      let method = this.$id ? '$update' : '$create'
      return this[ method ](props).then(() => this.$afterUpdate())
    })
  }

  $serialize(parameterize) {
    let labels = this.$labels.length ? `:${this.$labels.join(':')}` : ''
    let id = this.$identifier
    let text = `(${id}${labels}`
    if (parameterize) {
      return {
        text: `${text} $props${id})`,
        params: {
          [`props${id}`]: this.props,
        },
        identifier: id
      }
    } else {
      let props = Object.keys(this.props).reduce((memo, key, index, list) => {
        let comma = index ? ', ' : ''
        memo = `${memo}${comma}${key}: `
        if (typeof this.props[key] === 'object') {
          memo = `${memo}'${JSON.stringify(this.props[key])}'`
        } else if (typeof this.props[key] === 'number') {
          memo = `${memo}${this.props[key]}`
        } else {
          memo = `${memo}'${this.props[key]}'`
        }
        if (index === list.length - 1) {
          memo += ' }'
        }
        return memo
      }, '{ ')
      return {
        text: `${text} ${props})`,
        identifier: id
      }
    }
  }

  /*
   * Generic hooks defined here as stubs
   */

  // Before and after node or relationship creation.
  $beforeCreate() {}
  $aftercreate() {}

  // Before and after node or relationship update
  $beforeUpdate() {}
  $afterUpdate() {}

  // Before and after node or relationship create and update
  $beforeSave() {}
  $afterSave() {}

  // Before and after node or relationship delete
  $beforeDelete() {}
  $afterDelete() {}

  // Before and after node or relationship read
  $beforeRead() {}
  $afterRead() {}

  static get schema() {
    return Joi.any()
  }
}
