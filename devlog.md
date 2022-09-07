## Dev log

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
