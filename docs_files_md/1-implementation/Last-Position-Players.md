Now the server remembers the last location and position of the player

This can be used to place players when onBoarding the Game.

The serverside LastPosition cannot be used for placing the player in the right position. It would then have to keep track the last positions of all visited locations.

We could use HistoryTracker to remember the last position per location for the player.  
But then for the onLinePlayers we would have to get their position without them moving first.

---

So now we implement position as follows:

1. we place player in fixed positions
2. we filter the placement based on known position and location
3. the last position is kept in HistoryTracker, when going back the player is also put in the last known position of that location
