import { expect } from 'chai'
import { includeHelper, db } from "./helper";
import { SpaceshipRepository } from "./lib/repositories/SpaceshipRepository";
import { ObjectID } from "mongodb";

describe('Repository', () => {
    includeHelper()

    let spaceships: SpaceshipRepository
    let spaceshipsV: SpaceshipRepository
    beforeEach(async() => {
        spaceships = new SpaceshipRepository(db, { versionDocuments: false })
        spaceshipsV = new SpaceshipRepository(db, { versionDocuments: true })
    })

    // Tests the behaviour of insertOne. See the tests of insertMany, which are
    // largely a copy
    describe('insertOne', () => {
        it('saves a document to the database', async() => {
            let r = await spaceships.insertOne({
                name: 'USS Enterprise'
            })

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r._id,
                name: 'USS Enterprise'
            }])
        })

        it('saves a document with existing _id to the database', async() => {
            let r = await spaceships.insertOne({
                _id: 123,
                name: 'USS Enterprise'
            })

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: 123,
                name: 'USS Enterprise'
            }])
        })

        it('saves a document to the database and sets _version', async() => {
            let r = await spaceshipsV.insertOne({
                name: 'USS Enterprise'
            })

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r._id,
                _version: 0,
                name: 'USS Enterprise'
            }])
        })

        // Setting the _version beforehand should be possible, for example
        // if a user wants to re-insert deleted documents
        it('saves a document with existing _version to the database', async() => {
            let r = await spaceshipsV.insertOne({
                _version: 10,
                name: 'USS Enterprise'
            })

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r._id,
                _version: 10,
                name: 'USS Enterprise'
            }])
        })

        it('saves a timestamped document to the database', async() => {
            // TODO
        })

        it('returns the saved document', async() => {
            let r = await spaceships.insertOne({
                name: 'USS Enterprise'
            })
            expect(await spaceships.collection.find({}).toArray()).to.eqls([r])
        })

        it('returns the saved versioned document', async() => {
            let r = await spaceshipsV.insertOne({
                name: 'USS Enterprise'
            })
            expect(await spaceshipsV.collection.find({}).toArray()).to.eqls([r])
        })
    })

    // Tests the behaviour of insertMany. See the tests of insertOne, which are
    // largely a copy
    describe('insertMany', () => {
        it('saves documents to the database', async() => {
            let r = await spaceships.insertMany([{
                name: 'USS Enterprise'
            }, {
                name: 'USS Voyager'
            }])

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r[0]._id,
                name: 'USS Enterprise'
            }, {
                _id: r[1]._id,
                name: 'USS Voyager'
            }])
        })

        it('saves documents with existing _id to the database', async() => {
            let r = await spaceships.insertMany([{
                _id: 1,
                name: 'USS Enterprise'
            }, {
                _id: 2,
                name: 'USS Voyager'
            }])

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: 1,
                name: 'USS Enterprise'
            }, {
                _id: 2,
                name: 'USS Voyager'
            }])
        })

        it('saves documents to the database and sets _version', async() => {
            let r = await spaceshipsV.insertMany([{
                _id: 1,
                name: 'USS Enterprise'
            }, {
                _id: 2,
                name: 'USS Voyager'
            }])

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r[0]._id,
                _version: 0,
                name: 'USS Enterprise'
            }, {
                _id: r[1]._id,
                _version: 0,
                name: 'USS Voyager'
            }])
        })

        // Setting the _version beforehand should be possible, for example
        // if a user wants to re-insert deleted documents
        it('saves a document with existing _version to the database', async() => {
            let r = await spaceshipsV.insertMany([{
                _id: 1,
                _version: 9,
                name: 'USS Enterprise'
            }, {
                _id: 2,
                _version: 10,
                name: 'USS Voyager'
            }])

            expect(await spaceships.collection.find({}).toArray()).to.eqls([{
                _id: r[0]._id,
                _version: 9,
                name: 'USS Enterprise'
            }, {
                _id: r[1]._id,
                _version: 10,
                name: 'USS Voyager'
            }])
        })

        it('saves timestamped documents to the database', async() => {
            // TODO
        })

        it('returns the saved documents', async() => {
            let r = await spaceships.insertMany([{
                name: 'USS Enterprise'
            }, {
                name: 'USS Voyager'
            }])

            expect(await spaceships.collection.find({}).toArray()).to.eqls(r)
        })

        it('returns the saved versioned document', async() => {
            let r = await spaceshipsV.insertMany([{
                name: 'USS Enterprise'
            }, {
                name: 'USS Voyager'
            }])

            expect(await spaceshipsV.collection.find({}).toArray()).to.eqls(r)
        })
    })
})