# Tiller 3 Design - Repository Pattern ftw 
## Design Goals
1. Easy to implement, understand and maintain
- [Avoid](http://martinfowler.com/bliki/OrmHate.html) [leaky](https://techblog.bozho.net/orm-haters-dont-get-it/) and [complex](http://wozniak.ca/what-orms-have-taught-me-just-learn-sql) [ORM abstractions](https://www.quora.com/Are-ORMs-inefficient)
- Build for performance

I believe it is impossible to write a good ORM for MongoDB that fulfills the listed goals. Rather than abstracting away
the details of how a database works (what ORMs try to and what is incredibly hard) we should see Tiller as helper library that
makes working with MongoDB really easy and fun! We have to remember: MongoDB is much closer to JS than we often think ...  

## Proposed Solution: Repository Pattern   
### Example

```js
/**
 * The base interface from which all model interfaces inherit 
 */
interface Document {
    _id?: any
    _createdAt?: Date
    _modifiedAt?: Date
    _version?: number
}

// --- Models --- 

interface Commander {
    name: string,
}

interface Spaceship extends Document {
    name: string,
    speed: number,
    commander_id: ObjectId
}

// --- Repositories ---

abstract class Repository<T extends Document> {

    /**
     * Fetches model documents from the database
     */
    async find(sel: {}):Promise<T[]> { ... }
    
    /**
     * Inserts a new model into the database and returns it
     * Would automatically set _createdAt
     */
    async insert(obj: any):Promise<T> { ... }
    
    /**
     * Delta-updates an existing model.
     * Would automatically set _updatedAt
     */
    async update(_id, update: any):Promise<T> { ... }
}

class CommanderRepository extends Repository<Commander> {

}
 
class SpaceshipRepository extends Repository<Spaceship> {
    
}

// --- Use Case: Creating models --- 

let commanders = new CommanderRepository()
let spaceships = new SpaceshipRepository()

let spock = async commanders.insert({
    name: 'Commander Spock'
})

let enterprise = async spaceships.insert({
    name: 'USS Enterprise',
    speed: 10000,
    commander_id: spock._id
})

// --- Use Case: Updating models through an API ---

router.put(async (req) => {
    // Validate and authorize
    if(!validSpaceshipUpdate(req.body)) throw new Error()
    if(!authorizeSpaceshipUpdate(req)) throw new Error()
    
    // Delta-update and return the whole thing ... 
    return spaceships.update(req._id, update) 
})

// --- Use Case: How references could work ---

interface WithCommander {
    commander: Commander
}

interface SpaceshipWithCommander extends Spaceship, WithCommander {

}
 
class SpaceshipRepository extends Repository<Spaceship> {
    
    /**
     * Overrides the standard find to eagerly load
     * commanders.
     * Note the return type!
     */
    async find(_id):Promise<SpaceshipWithCommander> {
        return this.aggregate([{
            $lookup: {
                localField: 'commander_id',
                foreignField: '_id',
                from: 'commanders',
                as: 'commander'
            }
        }, {
            $unwind: '$commander'
        }])
    }
}


```

### Pros and Cons
Pros
- Near native Performance, because no conversion of objects coming from and to DB needed 
- Easy to implement, not too much code is needed. Probably a few files are sufficient for the core functionality.
- Tailored `find`'s, good for performance (lookups) and amount of data (projections)
- The general complexity of the system __decreases__, because there is no magic under the hood

Cons
- Even most simple business or serialization logic cannot be stored in the DB any more
- Probably a bit more code to write (lookups), but helpers can make this little effort. However, code will be fast!

## Features
### Prevent concurrent stale or overwriting updates 
If two users, user 1 and user 2, view the same object in a web frontend, they might easily overwrite each others changes
  without even noticing. The problem arises if user 1 loads the object, then user 2 loads the object. If then user 1 saves
  and user 2 saves afterwards, the changes from user 1 will be gone if there are no delta updates or there are, but they
  worked on the same property.
  
The solution will be to add a `_version` property to every document, which is a number that increments on every update. Every 
update operation then has to check whether the document is still at the `_version` at which it was loaded, otherwise the operation 
must be aborted.  
This algorithm is part of the _optimistic concurrency control_ class.

Open Questions:  
- How would that affect our code? Would we have to implement retries everywhere? In workers, web UI's?
- What happens if you have to save first a commander and then a spaceship update? Rollback? Does that every happen?
- Could we implement optimistic concurrency control on the property level?
  
### References
Any kind of framework-provided magic reference logic does not exist any more.
Model interfaces (see example of `SpaceshipWithCommander` above) help to differentiate whether a reference object/array 
has should be present or not. 
Helper methods could exist to make creating aggregation stages (usually `$lookup`, potentially followed by `$unwind` possible):

```JS
class SpaceshipRepository extends Repository<Spaceship> {
    
    async find(_id):Promise<SpaceshipWithCommander> {
        return this.aggregate([
            QueryBuilder.generateLookupStage('commanders', 'commander_id'),
        ])
    }
}
```

### Provide typed, simple helpers around standard MongoDB features: aggregation, bulk write, validation
Relatively self-explanatory. Having a type-safe easy way to generate aggregation stages (see example above),
 or a simple interface for creating bulk ops could be a benefit for writing and reading code.

### Audit Logs
Storing a history of changes (a log) to an object is a frequent requirement for apps. Tiller 
could automatically support this by pushing an update operation to a `_log` property, so objects
could look like this:
```Typescript
// A document from the spaceships collection
{
    _id: ObjectId(...),
    _createdAt: ...,
    _version: 2,
    _log: [{
        date: ...,
        ctx: ..., // reserved for a user or a system, who did the change?
        update: {
            $set: {
            }
        }
    }]
    name: 'USS Enterprise',
    speed: 1000,
    commander_id: 'be45f345',
    
}
```

Open questions:
- What happens if a user manually edits an object? Does he have to edit the `_log`? Otherwise it would diverge the 
log and the current model, because it can suddenly not be rebuild any more from the `_log`, which is generally a good
property of a log.
- How should the `_log` elements look like? Should we store the full update operation (`$set` etc.) or will it be too hard too read?
Which other format would be flexible and appropriate?

- Support storing audit logs (change logs)
- Hooks: `beforeSave`, `afterSave`, `beforeUpdate`, `afterUpdate`
### Timestamps: help setting `modifiedAt` and `createdAt`
Which time to use?

- Use [Facebook DataLoader](https://github.com/facebook/dataloader) for coercing multiple requests into one
- Make GraphQL integration easy
- Nicely integrate with a validation API/framework, which still has be found

- _Query Builder?_
- _Aggregation Helpers?_
- _Cursor API?_
- _Provide guidance where and how to create indexes?_

## Implementation

## Open Questions
Static vs. instance methods?

## FAQ
### Where to add business logic?
Formerly, our rich models would have contained ... 
 Now the good thing is we never have to think about it any more.
 Question: Where to put it? 
 * Namespace
 
 If you still want to do it, e.g. for the User, you could still return a rich model fro the repository

### How to support subclasses/subinterfaces 

### How to represent lazy references

### How to represent eager references

