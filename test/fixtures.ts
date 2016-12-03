import { Spaceship } from "./lib/models/Spaceship";
import { Db } from "mongodb";
import { SpaceshipRepository } from "./lib/repositories/SpaceshipRepository";

export async function createSpaceship(db: Db, name?: string): Promise<Spaceship> {
    let spaceships = new SpaceshipRepository(db)

    return await spaceships.insertOne({
        name: name || 'USS Enterprise'
    })
}