In ManageSession we get onlinePlayer movement via the socket, with:

```
this.socket.onstreamdata = (streamdata) => {
      let data = JSON.parse(streamdata.data)
```

The data we get is:

```{
location: "ArtworldAmsterdam",
posX: 50,
posY: 50,
user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
}
```