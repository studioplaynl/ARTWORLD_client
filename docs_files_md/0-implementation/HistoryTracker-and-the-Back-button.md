![history logic](https://docs.google.com/drawings/d/e/2PACX-1vSp94FnzJr56g2QdXuA6BkYXqjLL9HUUw3u64vsTYvJHTeQ7DJivHPp0D6ZqZ5WNcG-fvqMrkAKNjgc/pub?w=1440&h=1080)

## Locations and Homes
There are two types of scenes that players can enter: locations and homes. In cases when it is a location, _this.location_ contains the scene name, while for a home, it contains the home's unique ID.

## History Tracker
The class of History Tracker has two methods: _locationPush_ and _homePush_.
As the names suggest, when a player enters a location, a value of that location is pushed to the array of _ManageSession.locationHistory_, and when one gets into a home, an object with two properties is pushed to the same array: 
    
    { locationName: "DefaultUserHome", homeID: scene.location }

Both methods have a condition, they should not be matching the value of the previous scene. Otherwise, a player gets into an infinite loop when using the back button.

## Back button
On clicking of the back button, the last element of the array of _ManageSession.locationHistory_ is taken in order to leave the current scene and stop the current scene:

    let currentLocationKey = ManageSession.locationHistory.pop()
    ...
    ManageSession.socket.rpc("leave", currentLocationKey)
    ...
    this.scene.stop(currentLocationKey)

But before leaving the scene, we check whether the scene is a location or a house:

    if (currentLocationKey.locationName && currentLocationKey.homeID) {
      currentLocationKey = currentLocationKey.locationName
    }

if it is a house, then we reassign the value of the currentLocationKey.

And for entering the previous scene, we take the last element of the array of _ManageSession.locationHistory_ and join it:

    let previousLocation = ManageSession.locationHistory[ManageSession.locationHistory.length - 1]
    ...
    ManageSession.getStreamUsers("join", previousLocation)

We also check whether the previous scene is a location or a house:

    let homeID = null
    if (previousLocation.locationName && previousLocation.homeID) {
      homeID = previousLocation.homeID
      previousLocation = previousLocation.locationName
    }

For starting the previous scene, we provide two arguments, and the second argument is ignored when the scene is a location, not a home.

    this.scene.start(previousLocation, { user_id: homeID }) 




     





