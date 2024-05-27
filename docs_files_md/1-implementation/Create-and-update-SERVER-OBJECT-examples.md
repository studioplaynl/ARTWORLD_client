To retreive objects (eg addressbook) from the server, works like this:

    listObjects("addressbook", ManageSession.userProfile.id, 10)

We get back an array of max 10 (in this case) objects that have "addressbook" as collection value. For example:

```
0:
  0: {collection: 'addressbook', key: 'address_f42eb28f-9f4d-476c-9788-2240bac4cf48', permission_read: 2, permission_write: 1, value: {…}, …}
  1: {collection: 'addressbook', key: 'addressbook_5264dc23-a339-40db-bb84-e0849ded4e68', permi...
```

We have an array with an array of objects (because in this case we have multiple addressbooks, most of the time we have only one). Even if there is only one object coming back it will be in the form of:  
`   [0][0]   `  
The first array is standard, the second array is the array of objects we are looking for.

Inside the array we can query the values of the object with dot notation. In the case of retreiving the value:  
`   [0][1].value   `

The object ( on the [0][0] level) looks in detail like:

```
{
collection: "addressbook",
create_time: "2021-12-23T13:20:46Z",
key: "address_f42eb28f-9f4d-476c-9788-2240bac4cf48",
permission_read: 2,
permission_write: 1,
update_time: "2021-12-23T16:09:10Z",
user_id: "f42eb28f-9f4d-476c-9788-2240bac4cf48",
value: {user_id: "5264dc23-a339-40db-bb84-e0849ded4e68", user_name: "user11"},
version: "99914b932bd37a50b983c5e7c90ae93b"
}
```

Examples

[Locations OBJECT](https://github.com/studioplaynl/ARTWORLD_client/wiki/Locations-OBJECT)

[Heart / Like button Object](https://github.com/studioplaynl/ARTWORLD_client/wiki/Like%28Heart%29-Button-and-OBJECT/)
