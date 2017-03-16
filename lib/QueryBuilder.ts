const generateLookupStage = (foreignCollection: string, localField: string, asField: string) => {
    return {
        $lookup: {
            from: foreignCollection,
            localField: localField,
            foreignField: '_id',
            as: asField
        }
    }
}

const localFieldToAs = (localField: string) => {
    if (!localField.match(/_id$/)) {
        throw new Error('localField is required to end in _id as per MongoDB standards')
    }

    return localField.replace('_id', '')
}

export class QueryBuilder {
    static generateLookupMany(foreignCollection: string, localField: string): any[] {
        const asField = localFieldToAs(localField)
        return [generateLookupStage(foreignCollection, localField, asField)]
    }

    static generateLookupOne(foreignCollection: string, localField: string, keepEmpty?: boolean): any[] {
        const asField = localFieldToAs(localField)
        return [
            generateLookupStage(foreignCollection, localField, asField),
            {
                $unwind: {
                    path: `$${asField}`,
                    preserveNullAndEmptyArrays: keepEmpty,
                }
            }
        ]
    }
}