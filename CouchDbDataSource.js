const PouchDB = require('pouchdb')
require('dotenv').config()
const DB_UN = process.env.DB_UN
const DB_PW = process.env.DB_PW

/**
 * DataSource using CouchDB
 */
module.exports = class CouchDbDataSource {
  /**
   * This is the only required method of a DataSource, all others are optional
   * but not implementing them will obviously limit its funtionality.
   *
   * Returns whether or not there is data for a given config. In the case of the
   * YamlDataSource this would be whether or not the configured file exists
   *
   * @param {object} config
   * @return {Promise<boolean>}
   */
  hasData (config = {}) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    let result = false
    if (db) result = true
    return result
  }

  /**
   * Returns all entries for a given config.
   *
   * @param {object} config
   * @return {Promise<any>}
   */
  async fetchAll (config = {}) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace || ''}${config.db}`)

    // if loading a file belonging to an area
    // (npcs, items, rooms, and quests)
    // RETURNS AN ARRAY
    if (config.area) {
      return await db.allDocs({
        include_docs: true,
        startkey: config.area,
        endkey: config.area
      })
        .then(data => {
          return data.rows.map(doc => doc.doc[config.db])[0]
        })
        .catch(er => { return er })

    // if loading a non-area file
    // (accounts, players, and help)
    // RETURNS AN OBJ
    } else {
      return db.allDocs({
        include_docs: true,
        startkey: config.area,
        endkey: config.area
      })
        .then(data => {
          const obj = {}
          data.rows.map(dat => {
            if (dat.doc.bundle === config.bundle) {
              obj[dat.id] = dat
            }
          })
          return obj
        })
        .catch(er => { return er })
    }
  }

  /**
   * Gets a specific record by id for a given config
   *
   * @param {Object} config
   * @param {string} id
   * @return {Promise<any>}
   */
  fetch (config = {}, id) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    return db
      .get(id)
      .then(data => { return data })
      .catch(er => { return er })
  }

  /**
   * Update specific record. Write version of `fetch`
   *
   * @param {Object} config
   * @param {string} id
   * @param {any} data
   * @return {Promise}
   */
  update (config = {}, id, payload) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    return this.fetch(config, id)
      .then(data => {
        return db.put({
          ...data,
          ...payload
        })
      })
      .catch(er => { return er })
  }
}
