import { expect } from 'chai'
import { includeHelper, db } from "./helper"
import { Spaceship } from './lib/models/Spaceship'
import { SpaceshipRepository } from "./lib/repositories/SpaceshipRepository"
import { Document } from "../lib/Document";
const mongodb = require('mongodb')

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

    for(let operation of ['update', 'upsert']) {
        describe(operation, () => {

            // Prepare a non-versioned and versioned spaceship
            let spaceship: Spaceship
            let spaceshipV: Spaceship

            // Get hold of the update or upsert operation, non-versioned and versioned
            let fn:(update:Document) => Promise<Spaceship> = null
            let fnV:(update:Document) => Promise<Spaceship> = null

            beforeEach(async() => {
                spaceship = await spaceships.insertOne({
                    name: 'USS Enterprise'
                })
                spaceshipV = await spaceshipsV.insertOne({
                    name: 'USS Enterprise'
                })
                fn = spaceships[operation].bind(spaceships)
                fnV = spaceshipsV[operation].bind(spaceshipsV)
            })

            it('updates properties, leaving the others untouched', async() => {
                await fn({
                    _id: spaceship._id,
                    speed: 10000
                })

                expect(await spaceships.collection.find({ _id: spaceship._id }).toArray()).to.eqls([{
                    _id: spaceship._id,
                    name: 'USS Enterprise',
                    speed: 10000
                }])
            })

            it('returns the updated document', async() => {
                let r = await fn({
                    _id: spaceship._id,
                    speed: 10000
                })

                expect(await spaceships.collection.find({ _id: spaceship._id }).toArray()).to.eqls([r])
            })

            it('updates and increments _version', async() => {
                let r = await fnV({
                    _id: spaceshipV._id,
                    _version: spaceshipV._version,
                    speed: 10000
                })

                expect(r._version).to.eqls(spaceshipV._version + 1)
            })


            it('does not update if _version is old', async() => {
                // First update should work
                let r = await fnV({
                    _id: spaceshipV._id,
                    speed: 10000,
                    _version: spaceshipV._version
                })

                // Second update should throw an error, because the object is old
                try {
                    await fnV({
                        _id: spaceshipV._id,
                        speed: 10001,
                        _version: spaceshipV._version
                    })
                    expect.fail()
                } catch (e) {
                    expect(e.message).to.match(/stale/)
                }

                // Check that now update was performed
                expect(await spaceships.collection.find({ _id: spaceshipV._id }).toArray()).to.eqls([r])
            })

            if(operation == 'upsert') {
                it('inserts a new document', async () => {
                    let r = await fn({
                        _id: 1,
                        speed: 10000
                    })

                    expect(await spaceships.count({_id: 1})).to.eq(1)
                })
            }
        })
    }

    describe('read operations', () => {
        let ships: Spaceship[]
        beforeEach(async() => {
            ships = await spaceships.insertMany([{ name: 'USS Enterprise' }, { name: 'USS Voyager' }])
        })

        describe('cursor', () => {
            it('returns an instance of a cursor', async() => {
                let r = spaceships.cursor({})
                expect(r).to.be.instanceof(mongodb.Cursor)
            })

            it('returns cursor of all objects with empty selector', async() => {
                let r = spaceships.cursor({})
                expect(await r.count(false)).to.eq(2)
            })

            it('returns cursor ofsome objects with specific selector', async() => {
                let r = spaceships.cursor({ name: 'USS Voyager' })
                expect(await r.count(false)).to.eq(1)
            })
        })

        describe('find', () => {
            it('returns instance of a promise', () => {
                let r = spaceships.find({})
                expect(r).to.be.instanceof(Promise)
            })

            it('returns all objects with empty selector', async() => {
                let r = await spaceships.find({})
                expect(r).to.have.length(2)
                expect(r.map((ship) => ship.name)).to.eqls(['USS Enterprise', 'USS Voyager'])
            })

            it('returns some objects with specific selector', async() => {
                let r = await spaceships.find({ name: 'USS Voyager' })
                expect(r).to.have.length(1)
                expect(r[0].name).to.eq('USS Voyager')
            })
        })

        describe('findOne', () => {
            it('returns instance of a promise', () => {
                let r = spaceships.findOne({})
                expect(r).to.be.instanceof(Promise)
            })

            it('returns one with specific name', async() => {
                let r = await spaceships.findOne({ name: 'USS Voyager' })
                expect(r).to.exist
                expect(r.name).to.eq('USS Voyager')
            })

            it('returns one with specific name', async() => {
                let r = await spaceships.findOne({ _id: ships[1]._id })
                expect(r).to.exist
                expect(r.name).to.eq('USS Voyager')
            })
        })
    })
})