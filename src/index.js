
/**
 * Base model class to be extended that basically wraps around Knex. Holds helpful static methods.
 *
 * @class
 */
module.exports = class KnexClassModel {
  // constructor () {}

  static async beforeInsert (data) { return data }
  static async afterInsert (data) { return data }

  static async beforeUpdate (data) { return data }
  static async afterUpdate (data) { return data }

  static async beforeCreate (data) { return data }
  static async afterCreate (data) { return data }

  static async beforeDelete (data) { return data }
  static async afterDelete (data) { return data }

  static knex (value, force = false) {
    if (this.$knex && !force) {
      return
    }
    Object.defineProperty(this, '$knex', {
      enumerable: false,
      writable: true,
      configurable: false,
      value
    })
  }

  static get query () {
    return this.$knex(this.tableName)
  }

  static get tableName () {
    return ''
  }

  static get primaryKey () {
    return 'id'
  }

  static async findById (id) {
    // return this.$knex(this.tableName).where(this.primaryKey, id)
    return this.fetch({
      [`${this.primaryKey}`]: id
    })
  }

  /**
   * Selects the first record then returns an instantiation of the model.
   *
   * @param {Object} query The Query object.
   * @param {Object} opts Options.
   * @returns .
   */
  static async fetch (query = {}) {
    return this.query.first('*').where(query).then((res) => {
      return (typeof res === 'undefined') ? false : res
    })
  }

  /**
   * Inserts a new model into the database then returns an instantiation of the model.
   *
   * @param {Object} data The Model data.
   * @param {Object} opts Options.
   * @returns .
   */
  static async create (data, opts = {}) {
    data = await this.beforeCreate(data)
    const [id] = await this.query.insert(data)
    let savedObj = await this.findById(id)
    savedObj = await this.afterCreate(savedObj)
    return savedObj
  }

  /**
   * Saves the properties currently set on the model.
   *
   * @param {Object} properties The properties to update.
   * @param {Object} query Where clause for updating.
   * @param {Object} opts Options for saving.
   * @return {Array} A collection of the updated models.
   */
  static async update (data, where = {}) {
    data = await this.beforeUpdate(data)
    await this.query.update(data, 'id').where(where)
    let savedObj = await this.fetch(where)
    savedObj = await this.afterUpdate(savedObj)
    return savedObj
  }

  /**
   * Deletes models matching the given where clause.
   *
   * @param {Object} query Where clause for updating.
   * @return {Promise}.
   */
  static async delete (where = {}) {
    await this.beforeDelete()
    try {
      await this.query.del().where(where)
    } catch (err) {
      return Promise.resolve(false)
    }
    await this.afterDelete()
    return Promise.resolve(true)
  }
}
