const PouchDB = require('pouchdb')
require('dotenv').config()
const DB_UN = process.env.DB_UN
const DB_PW = process.env.DB_PW

/**
 * DataSource using CouchDB
 */
module.exports = class CouchDbDataSource {
  logError (config, message) {
    console.error(`[CouchDbDataSource][${config.namespace}][${config.db}] ERROR: `, message);
  }

  hasData (config = {}) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    let result = false
    if (db) result = true
    return result
  }

  fetchAll (config = {}) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)

    // if loading a document belonging to an area
    // (npcs, items, rooms, and quests)
    // RETURNS AN ARRAY
    if (config.area) {
      return db.allDocs({
        include_docs: true,
        startkey: config.area,
        endkey: config.area
      })
        .then(data => {
          return data.rows.map(doc => doc.doc[config.db])[0]
        })
        .catch(er => { 
          this.logError(config, er);
          return er 
        })

    // if loading a non-area document
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
        .catch(er => { 
          this.logError(config, er);
          return er 
        })
    }
  }

  fetch (config = {}, id) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    return db
      .get(id)
      .then(data => { return data })
      .catch(er => { 
        this.logError(config, er);
        return er 
      })
  }

  update (config = {}, id, payload) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    return this.fetch(config, id)
      .then(data => {
        if (data.status === 404) {
          console.warn(`[CouchDbDataSource][update][${id}] Not found.`);
          return db.put(payload)
        } else {
          for (const prop in payload) {
            if (payload[prop][0] === '__DELETED') {
              delete data[prop]
              delete payload[prop]
              console.warn(`[CouchDbDataSource][update][${id}]${prop} deleted.`);
            }
          }
          console.log(`[CouchDbDataSource][update][${id}] Updating...`)
          return db.put({
            ...data,
            ...payload
          })
        }
      })
      .catch(er => {
        this.logError(config, er);
        return er
      })
  }

  delete (config = {}, id) {
    const db = new PouchDB(`http://${DB_UN}:${DB_PW}@localhost:5984/${config.namespace}${config.db}`)
    return this.fetch(config, id)
      .then(data => {
        return db.remove(data)
      })
      .catch(er => {
        this.logError(config, er); 
        return er 
      })
  }
}
