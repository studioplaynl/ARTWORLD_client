Locations is being stored as an object in the database, with a collection name(the group where all these specific items get stored in), a key( to specify specifically that object) and the user Id. All 3 are mandatory to create, delete and find locations.

That means you can have multiple locations, within the same collection and with the same key, but from a different user.
This for instance makes it possible to search for all "userhouses" in "locationA".


## list Locations

`listObjects(type, userID, limit)`

response example:

    [
     {
      "collection": "home",
      "key": "test",
     "permission_read": 2,
     "permission_write": 1,
     "value": {
       "posX": 12345,
       "posY": 12345
       },
      "version": "e9a4463161b584c4f8ff1ab98d3b5932",
      "user_id": "4bd9378d-8b5b-4ea3-b683-6c3324792afe",
      "create_time": "2021-12-09T11:06:16Z",
      "update_time": "2021-12-09T11:32:30Z"
     }
    ]

## create/update locations
if you are admin(this gives you the possibility to create locations for other users):

`updateObjectAdmin(id, type, name, value, pub)`

if not admin:

`updateObject(type, name, value, pub)`

## delete object
if admin:

`deleteObjectAdmin(id, type, name);`

if not admin:

`deleteObject(type, name)`
