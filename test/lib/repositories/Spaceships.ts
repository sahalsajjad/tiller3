import { Spaceship } from "../models/Spaceship"
import { Repository } from "../../../lib/Repository";
import { Db } from "mongodb";

export class Spaceships extends Repository<Spaceship> {

    constructor(db: Db) {
        super(db, db.collection('spaceShips'));
    }
}