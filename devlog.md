## Dev log

okt 4 2023
Added animation to send button in sendTo to show user the last button.
Added greyscale to the first icon in sendTo when the pane is open (maybe not neccessary)

version of the app is generated on 'npm run dev' -> the version.js script makes a version_dev.js file with the date and time

okt 3 2023
to create the best looking, smallest png files with transparency, in a terminal, in the correct directory:
pngquant 64 --force --skip-if-larger *.png

June 9 2023
Code cleanup AVATAR_BASE_SIZE from constants.js

Clicking friend in itemsBar takes you inside the friends home in the correct position. Should we be taken next to the house though?

MailBox: ArtMail: clicking it, takes us to the home of the sender where the art is. 
(one problem: when the art work is hidden? => so should this be opening the artwork? 
TODO: opening the artwork of a artmail (the bug that happenend has to do with stopmotions are being opened as drawings)) 

MailBox: Liked Art: clicking the user that liked the artwork, takes player to that users home, clicking your own artwork does nothing...
TODO: implement previews of stopmototions

June 7 2023
Fixed the bug that kept the location of the last user logged in and passed it on to the next user

Fixed the bug that when a position is set on a player, that the history is not always replaced when needed

Fixed the bug that the moving animation was too long when moving by dragging and causing a late update of the players position in the url, history and on the network

June 6 2023
- In DebugFunctions made a function to print out all active scenes. To be able to see which scenes are running at a given moment (activate Edit Mode first with SHIFT-ALT-E-F)

trying to find the cause of the bug that the server location is not loaded

May 30 2023
- Switching a Player to a different Location (scene) and placing them in a position in that scene was giving a bug with going back in the DefaultUserHome. Seems to be solved by not setting a x, y on the player when creating it in DefaultUserHome, only after loading the avatar of the player, we do PlayerPos.set(x,y)
This is a patch solution, as it only works in the case of DefaultUserHome (because we can set the player in a fixed position there), but when we place a player ad hoc going to a new location the system fails:
    - Can we also place the player by giving a x, y when loading in the avatar with Player.loadPlayerAvatar(this, x, y);?
- The general way to place a player in a location is: 

    PlayerPos.set({
      x: 0,
      y: 0,
    });

    PlayerLocation.set({
      scene: DEFAULT_SCENE,
    });

    and then in the scene load the player with:

    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    * but when we do this and go back from the house, we are not put in the last position in the previous location, we are taken back to the pos of the home.
    Looking at the push history, we see that the x, y of the previous location is replaced with the x,y of the home
    It seems to happen because pos is set before location, then a replace is acted upon

    * if we do first PlayLocation.set and then PlayerPos.set, we are taken back to the first position in the location

    ** !! The solution maybe is to have a flag on setting the position (eg 'newLocation') so the system knows not the replace the pos on the current location, and setting it for the Location we a going to.

    ** !! also: solve the delay in the moving animation, after it the position of the player is stored (replaced), if a player moves into an other location, the previous location is not stored correctly... 


July 25

_VRAGEN_

- Elke scene heeft een aantal variabelen die niet worden gebruikt, maar wel overal staan. Zoals 'this.currentOnlinePlayer', 'this.offlineOnlineUsers' Wat te doen hiermee?

- Kleuren die gezet zijn voor REX UI, kan weg?
- REX UI this.data -> conflict met Phaser?

- Jsdoc doorvoeren?


### game/class

- ArtworkList.js --> Kan niet vinden waar getImages wordt aangeroepen, maar er zit wel veel in. Idem voor andere functies. Wordt dit niet (meer) gebruikt?

- Achievements.js is leeg. 

- CurveWithHandles.js, Background.js zijn herhalingen van andere code. Why?

- HistoryTracker onDestroy en get from svelte.. Should go?

- ServerCall.js --> Wordt dit wel gebruikt? Aantal functies omgezet naar static maar worden nergens uberhaupt aangeroepen



July 26

### Player & DefaultPlayer classes

- De classes verwijzen naar scene.player ipv naar zichzelf (this)
- Overal setters & getters gebruiken is netter (in elk geval Player & DefaultPlayer) 
- Revisit logica hier, misschien samenvoegen? (@maarten @eelke)



- HistoryTracker onder de loep nemen (@maarten)
- ServerCall functies los exporteren? (@eelke)
- ServerCall resolveLoadError naar UIScene (aangezien deze scene permanent is)




July 27

### Svelte time!

- Upload.svelte --> Er wordt alleen op extensie gecontroleerd, niet op MIME-type, content etc. ONVEILIG? ZIe https://stackoverflow.com/questions/18299806/how-to-check-file-mime-type-with-javascript-before-upload



### CSS 
- Global styles voor hr bijvoorbeeld, staan in kleine componenten. Global.css is er ook, maar staat daar niet in.

- QR COde moet GEEN username/password combo bevatten, onveilig

- QR Code redirect moet niet op window.location.host checken, want werkt niet lokaal. 

- TODO @eelke Update formulier validation (reactive) dynamische css styles toevoegen

- parser.parse error? Wat, hoe, waar?



July 29


- Logging (dlog) stack trace @eelke ✔️



August 19

@Maarten dragging in DefaultHome gaat niet lekker.




Aug 29
- Probably we need to group all objects in a single frame group (currentObject into a group)
So we can delete a group as a whole when removing a frame. 