import { create as ocreate, insert as oinsert, remove as oremove, search as osearch } from '@orama/orama';
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server';
import path from 'node:path';
import fs from 'node:fs';
import { schemas } from './schemas';

/**
 * SearchCtrl wraps one Orama full-text index per schema and persists them to the search/ folder.
 */
export default class SearchCtrl {
  constructor() {
    /** Orama database instance per schema key. */
    this.instances = {};
    /** Folder where index snapshots are stored. */
    this.dataPath = path.resolve('search') + path.sep;
    /** Index schemas. */
    this.schemas = schemas;
  }

  /**
   * Restores a persisted index from disk.
   * @param {string} file Snapshot file path.
   * @returns {Promise<Object|false>} The restored database, or false when missing or unreadable.
   */
  async restore(file) {
    try {
      return await restoreFromFile('binary', file);
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Persists the indexes for the given keys to disk.
   * @param {Array<string>} keys Schema keys (default: all).
   */
  save(keys = Object.keys(this.schemas)) {
    return Promise.all(keys.map((k) => persistToFile(this.instances[k], 'binary', `${this.dataPath}${k}.msp`)));
  }

  /**
   * Restores or creates every index and persists them.
   */
  async start() {
    if (!fs.existsSync(this.dataPath)) fs.mkdirSync(this.dataPath, { recursive: true });
    const keys = Object.keys(this.schemas);
    await Promise.all(keys.map(async (k) => {
      this.instances[k] = (await this.restore(`${this.dataPath}${k}.msp`)) || (await ocreate({ schema: this.schemas[k] }));
    }));
    await this.save(keys);
    console.log('=> Search controller started');
  }

  /**
   * Inserts a document into an index.
   * @param {string} key Schema key.
   * @param {Object} value Document to insert.
   */
  async insert(key, value) {
    return oinsert(this.instances[key], value);
  }

  /**
   * Removes a document from an index. Missing documents are ignored.
   * @param {string} key Schema key.
   * @param {string} id Document id.
   */
  async remove(key, id) {
    try {
      await oremove(this.instances[key], id);
    }
    catch (e) {
      // Document not indexed: nothing to remove
    }
  }

  /**
   * Full-text search on an index.
   * @param {string} key Schema key.
   * @param {Object} query Search parameters (term, properties, ...).
   */
  async search(key, query = {}) {
    return osearch(this.instances[key], {
      ...query,
      term: query.term || '',
      properties: query.properties || '*',
    });
  }
}
