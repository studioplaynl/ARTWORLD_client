## Dev log

###2023-10-04 

- Added animation to send button in sendTo to show user the last button.
- Added greyscale to the first icon in sendTo when the pane is open (maybe not neccessary)

- version of the app is generated on 'npm run dev' -> the version.js script makes a version_dev.js file with the date and time

###okt 3 2023
to create the best looking, smallest png files with transparency, in a terminal, in the correct directory:
pngquant 64 --force --skip-if-larger *.png

###Okt 2 2023
- refactored downloadDrawingDefaultUserHome in serverCall with resolveLoadError name (type)
- made flow for Liked


Todo before LIVE
- fix bug with moderator seeing artworks
- add avatar and house to apps with a nice view
- add music apps to 
---------------------------------------------------------------------------------------------------
bug restoring from trash: work is shown as visible but is not set to visible

store.updateState(row, OBJECT_STATE_REGULAR);

    updateState: (row, state) => {
      const {
        collection, key, value, user_id,
      } = row;

      // Update on server
      value.status = state;
      const pub = false;
      updateObject(collection, key, value, pub, user_id);

      // Update store
      store.update((artworks) => {
        const artworksToUpdate = artworks;
        const artworkIndex = artworks.findIndex((i) => i.key === key);
        if (artworkIndex) {
          artworksToUpdate[artworkIndex].value.status = state;
        }
        return [...artworksToUpdate];
      });
    },
    
updateState is restoreFromTrash and  const pub = should be true

Fixed.


For now: visibilityToggle.svelte is used for inGame toggling, 
TODO: CHECK workings of adminpage!

---------------------------------------------------------------------------------------------------
 Feature: direct participation in Challenge => a plus button
 
 - added a plus button for ChallengeAnimal and ChallengeFlower
 - added a reload button for both scenes
---------------------------------------------------------------------------------------------------
Feature: reload button in animal and flower garden.
Wanted to do reload 'better' but restarting the scene does what it needs to do.

The flow of downloading the assets and later manage them needs to be improved

---------------------------------------------------------------------------------------------------
- Added Avatar and House selector in the AppsGroup

- fixed the icons size
---------------------------------------------------------------------------------------------------
Deployed Develop To BetaWorld to do testing with the form and slow laptops, iPads
---------------------------------------------------------------------------------------------------
drawing does not update in house, it does show in drawing app
downloadDrawingDefaultUserHome

we look at if the key already exists, which it does because there is no more versioning!

Option 1: turn versioning back on in name only
advantage: the key gets updated everywhere and redownloaded
older drawings are openened and saved correcty

Option 2: turn on versioning completely

disadvantage: more storage

Option 3: Redownload always in HOUSE
disadvantage: download usage, old drawings are not fixed

Option 4: add update_time to image key in Phaser, so it is new when it is updated

Option 5: Loading as before but when it already exists check update_time

--
Try Option 1

#####Apploader.svelte 

    if (andClose) {
            if (currentFile.loaded) {
              const tempValue = {
                displayname: displayName,
                url: currentFile.awsUrl,
                version: '0',
              };
              const userID = currentFile.user_id;

#####ServerCall.js

    collection: "stopmotion"
    downloaded: true
    key: "2023-03-01T21_14_35_PaarsOcelot"
    permission_read: 2
    read: 2
    update_time: "2023-03-01T22:15:55.578131+01:00"
    user_id: "e9e54b8b-ff65-45b3-9ccd-56473812b9b3"
    username: "user576"
    value: 
      displayname: "PaarsOcelot"
      url: "stopmotion/e9e54b8b-ff65-45b3-9ccd-56473812b9b3/0_2023-03-01T21_14_35_PaarsOcelot.png"
      version: 0

The preview (convertImage) does not get updated in time. The only fix is to save a new verion. Other option is to not use convertImage and store some smaller versions on AWS S3
---
Try Option 4

Changed downloadDrawingDefaultUserHome, stopmotion 

    downloadArtwork function
    createDrawingContainer function
    imageKeyUrl = element.update_time + element.key;

---

stopmotions are loading right, and there is a fix for the likes (load the likes with the old name which is the url
test if it also loads updates art in HOUSE

It doesn't update the drawing in house!

    awsUrl: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1649534848571_paarsBull-kikker.png"
    displayName: "paarsBullkikker"
    frames: 1
    key: "1649534848571_paarsBull-kikker"
    loaded: true

    new: false
    status: 2
    type: "drawing"
    url: "https://artworld01.s3.eu-central-1.amazonaws.com/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1649534848571_paarsBull-kikker.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20230928%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20230928T150453Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=d4ded1f5364a71fbd5afdeab5e164045772c18b056a53a9822773554db497cf1"
    userId: "5264dc23-a339-40db-bb84-e0849ded4e68"


new drawing, updated twice

    awsUrl: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_2023-09-28T15_05_47_GrijsMus.png"
    displayName: "GrijsMus"
    frames: 1
    key: "2023-09-28T15_05_47_GrijsMus"
    loaded: true
    new: false
    status: 2
    type: "drawing"
    url: "https://artworld01.s3.eu-central-1.amazonaws.com/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_2023-09-28T15_05_47_GrijsMus.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20230928%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20230928T150844Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=03c5948d323e1f468fbe4b40cb85974dca8f049504e0c8c618757de56099d70d"
    userId: "5264dc23-a339-40db-bb84-e0849ded4e68"

downloadArtwork 

    imageKey, element.update_time:  2023-09-28T17:13:55.238271+02:002023-09-28T15_05_47_GrijsMus 2023-09-28T17:13:55.238271+02:00
updates to

    downloadArtwork imageKey, element.update_time:  2023-09-28T17:21:05.381767+02:002023-09-28T15_05_47_GrijsMus 2023-09-28T17:21:05.381767+02:00
but I don't get the latest image

Ah I get it: getting the raw data gives the latest, but with convertImage we get an old one
I am not getting the old one with convertImage, but the new one does not get loaded!

convertImage does not seem to be updating always to the latest version
here is a setting: https://repost.aws/questions/QUvFRJMgIvQqCi7fN-q5ubww/are-resized-images-served-with-cloudfront-and-resized-with-lambda-edge-cached

Getting the image as is is the latest version, but also 10x download size.

what is this: https://github.com/sagidM/s3-resizer ?

----
convertImage is not fast enough with updating

Easier solution: Always save small version on aws, that we get directly.
So original is 2048x2048 -> 512x512 150x150 50x50 versions? See what the difference in size and quality is.
Something that automatically runs pngquant on the small versions would be great!

---------------------------------------------------------------------------------------------------
- have put more test in form and run tests again
---------------------------------------------------------------------------------------------------
updateObjectAdmin does not update visibility
Also in NakamaHelpers.updateObject there is a check for admin or moderator, making it impossible for an admin or moderator to use the non admin function
####DOTO: FOLLOW UP on state of visibility and admin/ moderator
---------------------------------------------------------------------------------------------------
- Added LikedBalloon to every scene
- Place user in a house when click on likeBalloonArtwork

 ---------------------------------------------------------------------------------------------------
#TODO CENTRALISE SOME COMMONLY USED FUNCTIONS
 ---------------------------------------------------------------------------------------------------
##Bringing a player next to other players home:
    // get user account
    const friendAccount = await getAccount(row.user.id);
    // in the friendAccount.meta:
    // metadata.Azc
    const friendHomeLocation = friendAccount.metadata.Azc;
    // get home object of friend to get pos of that home
    const friendHome = await getObject('home', friendHomeLocation, row.user.id);

    PlayerLocation.set({
      scene: friendHomeLocation,
    });

    // check if there is posX and posY from the home object
    if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
      // place user next to nameplate of home
      const playerPosX = friendHome.value.posX - 80;
      const playerPosY = friendHome.value.posY - 100;

      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: playerPosX,
        y: playerPosY,
      });
    } else {
      // if there was no posX and y from home object
      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: -80,
        y: -100,
      });
    }
---------------------------------------------------------------------------------------------------
##make animations from spritesheets
    // dlog('STOPMOTION element, index, artSize, artMargin', element, index, artSize, artMargin);
    const avatar = scene.textures.get(imageKeyUrl);
    // eslint-disable-next-line no-underscore-dangle
    const avatarWidth = avatar.frames.__BASE.width;
    // dlog('stopmotion width: ', avatarWidth);

    // eslint-disable-next-line no-underscore-dangle
    const avatarHeight = avatar.frames.__BASE.height;
    // dlog(`stopmotion Height: ${avatarHeight}`);

    const avatarFrames = Math.round(avatarWidth / avatarHeight);
    let setFrameRate = 0;
    if (avatarFrames > 1) { setFrameRate = (avatarFrames); } else {
      setFrameRate = 0;
    }
    // dlog(`stopmotion Frames: ${avatarFrames}`);

    // animation for the stopmotion .........................
    scene.anims.create({
      key: `moving_${imageKeyUrl}`,
      frames: scene.anims.generateFrameNumbers(imageKeyUrl, {
        start: 0,
        end: avatarFrames - 1,
      }),
      frameRate: setFrameRate,
      repeat: -1,
      yoyo: false,
    });

    scene.anims.create({
      key: `stop_${imageKeyUrl}`,
      frames: scene.anims.generateFrameNumbers(imageKeyUrl, {
        start: 0,
        end: 0,
      }),
    });
    
    completedImage.setData('playAnim', `moving_${imageKeyUrl}`);
    completedImage.setData('stopAnim', `stop_${imageKeyUrl}`);
    if (avatarFrames > 1) {
      completedImage.play(`moving_${imageKeyUrl}`);
    }
 ---------------------------------------------------------------------------------------------------
 
###June 9 2023
Code cleanup AVATAR_BASE_SIZE from constants.js

Clicking friend in itemsBar takes you inside the friends home in the correct position. Should we be taken next to the house though?

MailBox: ArtMail: clicking it, takes us to the home of the sender where the art is. 
(one problem: when the art work is hidden? => so should this be opening the artwork? 
TODO: opening the artwork of a artmail (the bug that happenend has to do with stopmotions are being opened as drawings)) 

MailBox: Liked Art: clicking the user that liked the artwork, takes player to that users home, clicking your own artwork does nothing...
TODO: implement previews of stopmototions

###June 7 2023
Fixed the bug that kept the location of the last user logged in and passed it on to the next user

Fixed the bug that when a position is set on a player, that the history is not always replaced when needed

Fixed the bug that the moving animation was too long when moving by dragging and causing a late update of the players position in the url, history and on the network

###June 6 2023
- In DebugFunctions made a function to print out all active scenes. To be able to see which scenes are running at a given moment (activate Edit Mode first with SHIFT-ALT-E-F)

trying to find the cause of the bug that the server location is not loaded

###May 30 2023
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


###July 25 2022

_VRAGEN_

- Elke scene heeft een aantal variabelen die niet worden gebruikt, maar wel overal staan. Zoals 'this.currentOnlinePlayer', 'this.offlineOnlineUsers' Wat te doen hiermee?

- Kleuren die gezet zijn voor REX UI, kan weg?
- REX UI this.data -> conflict met Phaser?

- Jsdoc doorvoeren?


#### game/class

- ArtworkList.js --> Kan niet vinden waar getImages wordt aangeroepen, maar er zit wel veel in. Idem voor andere functies. Wordt dit niet (meer) gebruikt?

- Achievements.js is leeg. 

- CurveWithHandles.js, Background.js zijn herhalingen van andere code. Why?

- HistoryTracker onDestroy en get from svelte.. Should go?

- ServerCall.js --> Wordt dit wel gebruikt? Aantal functies omgezet naar static maar worden nergens uberhaupt aangeroepen



###July 26 2022

#### Player & DefaultPlayer classes

- De classes verwijzen naar scene.player ipv naar zichzelf (this)
- Overal setters & getters gebruiken is netter (in elk geval Player & DefaultPlayer) 
- Revisit logica hier, misschien samenvoegen? (@maarten @eelke)



- HistoryTracker onder de loep nemen (@maarten)
- ServerCall functies los exporteren? (@eelke)
- ServerCall resolveLoadError naar UIScene (aangezien deze scene permanent is)




###July 27 2022

#### Svelte time!

- Upload.svelte --> Er wordt alleen op extensie gecontroleerd, niet op MIME-type, content etc. ONVEILIG? ZIe https://stackoverflow.com/questions/18299806/how-to-check-file-mime-type-with-javascript-before-upload



### CSS 
- Global styles voor hr bijvoorbeeld, staan in kleine componenten. Global.css is er ook, maar staat daar niet in.

- QR COde moet GEEN username/password combo bevatten, onveilig

- QR Code redirect moet niet op window.location.host checken, want werkt niet lokaal. 

- TODO @eelke Update formulier validation (reactive) dynamische css styles toevoegen

- parser.parse error? Wat, hoe, waar?



###July 29 2022


- Logging (dlog) stack trace @eelke ✔️



###August 19 2022

@Maarten dragging in DefaultHome gaat niet lekker.




###Aug 29 2022
- Probably we need to group all objects in a single frame group (currentObject into a group)
So we can delete a group as a whole when removing a frame. 