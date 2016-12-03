import { ObjectID } from "mongodb"

export interface Document {
    _id?: any
    _version?: number,
    _log?:{
        _version:number,
        $set: any
    }
}