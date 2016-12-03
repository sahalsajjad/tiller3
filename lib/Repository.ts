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

    // TODO Make sure _version and _id are not in update or make sure it still works if its set to bad values ...
    async update(_id, _version: number, update: any): Promise<void> {
        let r = await this.collection.updateOne({
            _id: _id,
            _version: _version
        }, {
                $set: update,
                $inc: { _version: 1 },
                $push: {
                    _log: update
                }
            })

        if (r.modifiedCount != 1) {
            throw new Error('Attempted to update a stale or deleted object')
        }
    }

    find(sel): Promise<T[]> {
        return this.collection.find(sel).toArray()
    }

    cursor(sel): Cursor {
        return this.collection.find(sel)
    }
}

export namespace Repository {
    export interface Options {
        versionDocuments?: boolean
    }
}