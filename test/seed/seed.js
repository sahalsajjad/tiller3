"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const helper_1 = require("../helper");
const rp = require('request-promise');
function fetch(collection, url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching ${url}`);
        let response = JSON.parse(yield rp(url));
        let [r, next] = yield Promise.all([
            collection.insertMany(response.results),
            response.next ? fetch(collection, response.next) : null
        ]);
        return r.insertedCount + next;
    });
}
var db;
(function run() {
    return __awaiter(this, void 0, void 0, function* () {
        db = yield helper_1.connect();
        yield db.dropDatabase();
        yield Promise.all([
            fetch(db.collection('planets'), 'http://swapi.co/api/planets/'),
            fetch(db.collection('people'), 'http://swapi.co/api/people/'),
            fetch(db.collection('films'), 'http://swapi.co/api/films/'),
            fetch(db.collection('starships'), 'http://swapi.co/api/starships/'),
            fetch(db.collection('vehicles'), 'http://swapi.co/api/vehicles/'),
            fetch(db.collection('species'), 'http://swapi.co/api/species/'),
        ]);
        yield db.close();
        console.log('Done');
    });
})()
    .then(() => null)
    .catch(e => console.error(e.stack));
//# sourceMappingURL=seed.js.map