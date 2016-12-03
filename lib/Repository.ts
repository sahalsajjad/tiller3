import { Document } from "./Document"
import { Db, Collection, Cursor } from "mongodb"

export abstract class Repository<T extends Document> {

    constructor(protected db: Db, protected collection: Collection) {

    }

    async aggregate() {

    }

    // beforeUpdate, afterUpdate, beforeUpsert, beforeInsert
    // afterLoad, afterFind, afterAggregate
    public on(type: string, fn: (type: string, model: any) => Promise<void>) {

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