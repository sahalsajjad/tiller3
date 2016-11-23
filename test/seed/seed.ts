import { connect } from "../helper";
import { Db, Collection } from "mongodb";
const rp = require('request-promise')

async function fetch(collection:Collection, url: string) {
    console.log(`Fetching ${url}`)
    let response = JSON.parse(await rp(url))
    let [r, next] = await Promise.all([
        collection.insertMany(response.results),
        response.next ? fetch(collection, response.next) : null
    ])
    return r.insertedCount + next
}

var db:Db;
(async function run() {
    db = await connect()
    await db.dropDatabase()

    await Promise.all([
        fetch(db.collection('planets'), 'http://swapi.co/api/planets/'),
        fetch(db.collection('people'), 'http://swapi.co/api/people/'),
        fetch(db.collection('films'), 'http://swapi.co/api/films/'),
        fetch(db.collection('starships'), 'http://swapi.co/api/starships/'),
        fetch(db.collection('vehicles'), 'http://swapi.co/api/vehicles/'),
        fetch(db.collection('species'), 'http://swapi.co/api/species/'),
    ])

    await db.close()

    console.log('Done')
})()
    .then(() => null)
    .catch(e => console.error(e.stack))