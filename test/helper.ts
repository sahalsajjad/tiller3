import { Db, MongoClient } from "mongodb";

export let db:Db = null
export function includeHelper() {
    before(async () => {
        db = await connect()
    })

    beforeEach(async () => {
        for(let collection of await db.collections()) {
            db.dropCollection(collection.collectionName)
        }
    })

    after(async () => {
        if(db) {
            await db.close()
        }
    })
}

export function connect() {
    return MongoClient.connect('mongodb://localhost/tiller3_test')
}