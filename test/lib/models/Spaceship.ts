import { Document } from "../../../lib/Document"
import { CommanderId } from "./Commander"

export type SpaceshipId = number

export interface Spaceship extends Document {
    _id?: SpaceshipId
    name: string
    speed?: number
    commander_id?: CommanderId
}

