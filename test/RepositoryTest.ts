import { expect } from 'chai'
import { Spaceship } from "./lib/models/Spaceship"
import { Spaceships } from "./lib/repositories/Spaceships"
import { includeHelper, db } from "./helper";
import { createSpaceship } from "./fixtures";

describe('Repository', () => {
    includeHelper()

    let spaceships: Spaceships;
    beforeEach(async () => {
        spaceships = new Spaceships(db)
    })
})