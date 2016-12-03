import { Spaceships } from "./lib/repositories/Spaceships"
import { db } from "./helper";
import { Spaceship } from "./lib/models/Spaceship";
import { Db } from "mongodb";

export async function createSpaceship(db: Db, name?: string): Promise<Spaceship> {
    let spaceships = new Spaceships(db)

    return {
        name: name || 'USS Enterprise'
    }
}