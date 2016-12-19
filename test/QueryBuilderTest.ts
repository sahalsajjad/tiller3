import { expect } from 'chai'
import { QueryBuilder } from '../lib/QueryBuilder'
import * as _ from 'lodash'

describe('QueryBuilder', () => {
    describe('generateLookupMany', () => {
        let r: any[]
        beforeEach(() => {
            r = QueryBuilder.generateLookupMany('spaceships', 'spaceships_id')
            expect(r).to.have.length(1)
        })

        it('contains stage with key $lookup', () => {
            const stages = _.flatten(r.map((r) => Object.keys(r)))
            expect(stages).to.eqls(['$lookup'])
        })

        it('sets $lookup stage correctly', () => {
            expect(r[0].$lookup).to.eqls({
                from: 'spaceships',
                localField: 'spaceships_id',
                foreignField: '_id',
                as: 'spaceships'
            })
        })

        it('throws if localField doesnt add _id', () => {
            try {
                QueryBuilder.generateLookupMany('spaceships', 'spaceshipsId')
                expect.fail()
            } catch (e) {
                expect(e.message).to.match(/end in _id/g)
            }
        })
    })

    describe('generateLookupOne', () => {
        let r: any[]
        beforeEach(() => {
            r = QueryBuilder.generateLookupOne('spaceships', 'spaceship_id')
            expect(r).to.have.length(2)
        })

        it('contains stage with key $lookup and $unwind', () => {
            const stages = _.flatten(r.map((r) => Object.keys(r)))
            expect(stages).to.eqls(['$lookup', '$unwind'])
        })

        it('sets $lookup stage correctly', () => {
            expect(r[0].$lookup).to.eqls({
                from: 'spaceships',
                localField: 'spaceship_id',
                foreignField: '_id',
                as: 'spaceship'
            })
        })

        it('sets $unwind stage correctly', () => {
            expect(r[1].$unwind).to.eq('$spaceship')
        })

        it('throws if localField doesnt add _id', () => {
            try {
                QueryBuilder.generateLookupOne('spaceships', 'spaceshipId')
                expect.fail()
            } catch (e) {
                expect(e.message).to.match(/end in _id/g)
            }
        })
    })
})