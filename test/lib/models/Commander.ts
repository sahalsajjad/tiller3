import { Document } from "../../../lib/Document"
import { ObjectID } from "mongodb";

export type CommanderId = ObjectID

export interface Commander extends Document {
    name: string
}