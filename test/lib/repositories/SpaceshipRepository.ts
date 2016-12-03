import { Spaceship } from "../models/Spaceship"
import { Repository } from "../../../lib/Repository"
import { Db } from "mongodb"

export class SpaceshipRepository extends Repository<Spaceship> {

    constructor(db: Db, options?: Repository.Options) {
        super(db, db.collection('spaceShips'), options);
    }
}