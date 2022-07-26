## Dev log

July 25

_VRAGEN_

- Elke scene heeft een aantal variabelen die niet worden gebruikt, maar wel overal staan. Zoals 'this.currentOnlinePlayer', 'this.offlineOnlineUsers' Wat te doen hiermee?

- Kleuren die gezet zijn voor REX UI, kan weg?
- REX UI this.data -> conflict met Phaser?

- Kan playerContainer weg?

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
