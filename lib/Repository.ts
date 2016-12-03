import { Document } from "./Document"
import { AggregationCursor, Db, Collection, Cursor, InsertOneWriteOpResult } from "mongodb"
import * as _ from 'lodash'

export abstract class Repository<T extends Document> {
    protected options: Repository.Options

    constructor(protected db: Db, readonly collection: Collection, options?: Repository.Options) {
        this.options = _.assign({
            versionDocuments: false
        }, options)
    }

    /**
     * Passes aggregation stages to the mongoDB aggregation pipeline and returns a cursor
     *
     * @param {any[]} stages
     * @returns {AggregationCursor}
     */
    aggregate(stages: any[]): AggregationCursor {
        return this.collection.aggregate(stages)
    }

    // beforeUpdate, afterUpdate, beforeUpsert, beforeInsert
    // afterLoad, afterFind, afterAggregate
    public on(type: string, fn: (type: string, model: any) => Promise<void>) {
    }

    /**
     * Inserts a new document into the database and returns the new document.
     * If _id does not already exist, it will be created.
     * If document versioning is enabled and _version does not already exist the
     * document version is set to 0.
     *
     * @param document      The document to create
     * @returns             The created document
     */
    async insertOne(document: T): Promise<T> {
        if (this.options.versionDocuments) {
            document._version = document._version || 0
        }

        const r = await this.collection.insertOne(document)
        return r.ops[0]
    }

    /**
     * Inserts new documents into the database and returns the new documents.
     * See `insertOne` for the behaviour of `_id` and `_version` attributes.
     *
     * @param documents     The documents to create
     * @returns             The created documents
     *
     * @see insertOne
     */
    async insertMany(documents: T[]): Promise<T[]> {
        if (this.options.versionDocuments) {
            documents.forEach(d => d._version = d._version || 0)
        }

        const r = await this.collection.insertMany(documents)
        return r.ops
    }

    /**
     * Delta-updates a document in the database with a delta object
     *
     * TODO check what happens if _version/_id exists in update
     *
     * @param _id
     * @param _version
     * @param update
     */
    async update(_id: any, update: any, _version?: number): Promise<T> {
        let selector = {
            _id: _id
        }

        let dbUpdate = {
            $set: update
        }

        // Check that version exists, if versioning is enabled
        if (this.options.versionDocuments) {
            if (_version === null || _version === undefined) {
                throw new Error('_version is missing')
            }

            if ('_version' in dbUpdate.$set) {
                dbUpdate.$set = _.omit(dbUpdate.$set, '_version')
            }

            selector['_version'] = _version
            dbUpdate['$inc'] = { _version: 1 }
        }

        let r = await this.collection.findOneAndUpdate(selector, dbUpdate, { returnOriginal: false })
        if (!r.value || r.ok != 1) {
            throw new Error('Attempted to update a stale or deleted object')
        }

        return r.value
    }

    /**
     * Returns a MongoDB cursor for the given selector
     * @param {any} sel
     * @returns {Cursor}
     */
    cursor(sel: any): Cursor {
        return this.collection.find(sel)
    }

    /**
     * Executes given find selector
     * @param {any} sel
     * @returns {Promise<T[]>}
     */
    find(sel: any): Promise<T[]> {
        return this.cursor(sel).toArray()
    }

    findOne(sel: any): Promise<T> {
        return this.collection.findOne(sel)
    }
}

export namespace Repository {
    export interface Options {
        versionDocuments?: boolean
    }
}