import { expect } from 'chai'
import { includeHelper, db } from "./helper";
import { SpaceshipRepository } from "./lib/repositories/SpaceshipRepository";

describe('Repository', () => {
    includeHelper()

    let spaceships: SpaceshipRepository
    let spaceshipsV: SpaceshipRepository
    beforeEach(async() => {
        spaceships = new SpaceshipRepository(db, { versionDocuments: false })
        spaceshipsV = new SpaceshipRepository(db, { versionDocuments: true })
    })

    describe('insertOne', () => {
        it('saves a document to the database', async() => {
            let r = await spaceships.insertOne({
                name: 'USS Enterprise'
            })

            expect(await db.collection('spaceships').find({})).to.eq([{
                _id: r._id,
                name: 'USS Enterprise'
            }])
        })

        it('saves a versioned document to the database', async() => {
            let r = await spaceshipsV.insertOne({
                name: 'USS Enterprise'
            })

            expect(await db.collection('spaceships').find({})).to.eq([{
                _id: r._id,
                name: 'USS Enterprise'
            }])
        })

        it('returns the saved document', async() => {
            let r = await spaceships.insertOne({
                name: 'USS Enterprise'
            })

            expect(await db.collection('spaceships').find({})).to.eq([{
                _id: r._id,
                name: 'USS Enterprise'
            }])
        })
    })
})