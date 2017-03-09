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
     * @param {{}[]} stages
     * @returns {AggregationCursor}
     */
    aggregate(stages: {}[]): AggregationCursor<any> {
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
     * @param update            The delta update document
     * @returns {Promise<T>}    The updated document
     */
    async update(update: Document, options?: { upsert?: boolean }): Promise<T> {
        let selector = {
            _id: update._id
        }

        let dbUpdate = {
            $set: _.omit(update, ['_version', '_id'])
        }

        // Check that version exists, if versioning is enabled
        if (this.options.versionDocuments) {
            if (update._version === null || update._version === undefined) {
                throw new Error('_version is missing')
            }

            selector['_version'] = update._version
            dbUpdate['$inc'] = { _version: 1 }
        }

        try {
            var r = await this.collection.findOneAndUpdate(selector, dbUpdate, _.assign({ returnOriginal: false }, options))
        } catch (e) {
            if (options.upsert && e.code == 11000 && e.name == 'MongoError' && e.message.match(/_id_ dup key/)) {
                // In this case the user performed an upsert operation and a "E11000 duplicate key error"
                // was thrown, e.g. "E11000 duplicate key error collection: tiller3_test.spaceShips index: _id_ dup key: { : ObjectId('585916fc316d3352848b83fb') }"
                // This is caused by a stale object update (`update._version` being old) and thus an insert would take place.
                // As an object with the same `_id` already exists (basically a newer version) an insert was attempted with
                // the same _id and consequently failed.
                throw new Error('Attempted to update a stale or deleted object')
            } else {
                throw e
            }
        }
        if (!r.value || r.ok != 1) {
            throw new Error('Attempted to update a stale or deleted object')
        }

        return r.value
    }

    /**
     * Delta-upserts a document in the database. Check out the `update` method for details
     *
     * @param update            The delta update document
     * @returns {Promise<T>}    The updated document
     */
    async upsert(update: Document): Promise<T> {
        return this.update(update, { upsert: true })
    }

    /**
     * @see Collection.count
     */
    async count(sel: Document): Promise<number> {
        return this.collection.count(sel)
    }

    /**
     * Returns a MongoDB cursor for the given selector
     * @param {{}} sel
     * @returns {Cursor}
     */
    cursor(sel: {}): Cursor<T> {
        return this.collection.find(sel)
    }

    /**
     * Executes given find selector
     * @param {{}} sel
     * @returns {Promise<T[]>}
     */
    find(sel: {}): Promise<T[]> {
        return this.cursor(sel).toArray()
    }

    findOne(sel: {}): Promise<T> {
        return this.collection.findOne(sel)
    }
}

export namespace Repository {
    export interface Options {
        versionDocuments?: boolean
    }
}