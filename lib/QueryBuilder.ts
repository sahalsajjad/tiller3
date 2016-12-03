export interface LookupStage {
    $lookup: {
        from: string,
        localField: string,
        foreignField: string,
        as: string
    }
}

export class QueryBuilder {
    static generateLookupStage(foreignCollection: string, localField: string, as: string): LookupStage {
        return {
            $lookup: {
                from: foreignCollection,
                localField: localField,
                foreignField: '_id',
                as: as
            }
        }
    }
}