import { expect } from 'chai'
import { Spaceship } from "./lib/models/Spaceship"
import { Spaceships } from "./lib/repositories/Spaceships"
import { includeHelper, db } from "./helper";
import { createSpaceship } from "./fixtures";

describe('Repository', () => {
    includeHelper()

    let spaceships: Spaceships;
    beforeEach(async() => {
        spaceships = new Spaceships(db)
    })



    /*describe('save', () => {
        it('saves ', async() => {
            let spaceship: Spaceship = {
                name: 'USS Enterprise'
            }

            await spaceships.save(spaceship)
        })
    })*/

    /*describe('updateAndFind', () => {
        it('updates an object', async() => {
            let s = await createSpaceship(db)
            let r = await spaceships.updateAndFind(s._id, s._version, { speed: 1 })
            expect(r._version).to.eq(s._version + 1)
        })

        it('updates an object, ignoring _version in the update parameter', async() => {
            let s = await createSpaceship(db)
            let r = await spaceships.updateAndFind(s._id, s._version, { _version: 100, speed: 1 })
            expect(r._version).to.eq(s._version + 1)
        })
    })*/
})