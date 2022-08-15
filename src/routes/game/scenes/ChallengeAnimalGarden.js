import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage, listAllObjects,
} from '../../../api';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import SceneSwitcher from '../class/SceneSwitcher';
import Move from '../class/Move';
import { playerPos } from '../playerState';


const { Phaser } = window;

export default class ChallengeAnimalGarden extends Phaser.Scene {
  constructor() {
    super('ChallengeAnimalGarden');

    this.worldSize = new Phaser.Math.Vector2(4000, 1200);

    this.debug = false;

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos
    this.onlinePlayers = [];

    this.newOnlinePlayers = [];

    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player;
    this.playerShadow;

    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    this.artDisplaySize = 64;
    this.artArray = [];

    // testing
    this.resolveLoadErrorCache = [];

    this.homes = [];
    this.homesRepreseneted = [];

    this.offlineOnlineUsers;

    this.location = 'ChallengeAnimalGarden';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data;
    // ....................... end REX UI ......

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.cursorKeyIsDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);

    // pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;
    this.distanceTolerance = 9;

    // shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

    this.currentZoom;

    // itemsbar

    // size for the artWorks
    this.artPreviewSize = 128;

    this.artUrl = [];
    this.userArtServerList = [];
    this.progress = [];
  }

  async preload() {
    Preloader.Loading(this); // .... PRELOADER VISUALISER
  }

  async create() {
    //!
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize;
    //!

    // collection: "home"
    // create_time: "2022-01-19T16:31:43Z"
    // key: "Amsterdam"
    // permission_read: 2
    // permission_write: 1
    // update_time: "2022-01-19T16:32:27Z"
    // user_id: "4c0003f0-3e3f-4b49-8aad-10db98f2d3dc"
    // value:
    // url: "home/4c0003f0-3e3f-4b49-8aad-10db98f2d3dc/3_current.png"
    // username: "user88"
    // version: "0579e989a16f3e228a10d49d13dc3da6"
    //!

    // the order of creation is the order of drawing: first = bottom ...............................

    // Background.repeatingDots({
    //     scene: this,
    //     gridOffset: 80,
    //     dotWidth: 2,
    //     dotColor: 0x7300ed,
    //     backgroundColor: 0xffffff,
    // })

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;
    // make a repeating set of rectangles around the artworld canvas
    const middleCoordinates = new Phaser.Math.Vector2(
      artworldToPhaser2DX(this.worldSize.x, 0),
      artworldToPhaser2DY(this.worldSize.y, 0),
    );
    this.borderRectArray = [];

    for (let i = 0; i < 3; i++) {
      this.borderRectArray[i] = this.add.rectangle(0, 0, this.worldSize.x + (80 * i), this.worldSize.y + (80 * i));
      this.borderRectArray[i].setStrokeStyle(4 + i, 0x7300ed);

      this.borderRectArray[i].x = middleCoordinates.x;
      this.borderRectArray[i].y = middleCoordinates.y;
    }

    // used for world bounds collision detection
    // this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);

    // create border rects
    // alpha set to 0, to hide them
    const borderBoxWidth = 40;
    // create
    // let tempRectForCollision = this.add.rectangle(0, 0, this.worldSize.x, borderBoxWidth, 0xff0000, 1)
    // let rt1 = this.add.renderTexture(0, 0, this.worldSize.x, borderBoxWidth)
    // rt1.draw(tempRectForCollision)
    // rt1.saveTexture("collisionWall")
    // rt1.destroy()
    // tempRectForCollision.destroy()

    // this.collisionBorders = this.physics.add.staticGroup()
    // this.collisionBorders.create(this.worldSize.x / 2, - (borderBoxWidth / 2), 'collisionWall')

    this.borderBoxNorth = this.add.rectangle(
      this.worldSize.x / 2,
      -(borderBoxWidth / 2),
      this.worldSize.x,
      borderBoxWidth,
      0xff00ff,
      0,
    );
    this.physics.add.existing(this.borderBoxNorth);
    this.borderBoxNorth.name = 'borderBoxNorth';

    this.borderBoxSouth = this.add.rectangle(
      this.worldSize.x / 2,
      (this.worldSize.y) + (borderBoxWidth / 2),
      this.worldSize.x,
      borderBoxWidth,
      0xff0000,
      0,
    );
    this.physics.add.existing(this.borderBoxSouth);
    this.borderBoxSouth.name = 'borderBoxSouth';

    this.borderBoxEast = this.add.rectangle(
      this.worldSize.x + (borderBoxWidth / 2),
      this.worldSize.y / 2,
      borderBoxWidth,
      this.worldSize.x,
      0xffff00,
      0,
    );
    this.physics.add.existing(this.borderBoxEast);
    this.borderBoxEast.name = 'borderBoxEast';

    this.borderBoxWest = this.add.rectangle(
      0 - (borderBoxWidth / 2),
      this.worldSize.y / 2,
      borderBoxWidth,
      this.worldSize.x,
      0xff00ff,
      0,
    );
    this.physics.add.existing(this.borderBoxWest);
    this.borderBoxWest.name = 'borderBoxWest';

    // this.collisionBorders = this.physics.add.staticGroup(this.physics.world, this.scene, [this.borderBoxNorth, this.borderBoxSouth, this.borderBoxWest, this.borderBoxEast])
    //!

    //!
    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() // { useHandCursor: true }
    // .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => {
        ManageSession.playerIsAllowedToMove = true;
      })
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false);

    // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
    this.touchBackgroundCheck.input.alwaysEnabled = true;
    //!
    // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
    // End Background .........................................................................................

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(
        this.worldSize.x,
        get(playerPos).x,
      ),
      artworldToPhaser2DY(
        this.worldSize.y,
        get(playerPos).y,
      ),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow(
      {
        scene: this,
        texture: ManageSession.playerAvatarPlaceholder,
      },
    ).setDepth(200);
    // for back button, has to be done after player is created for the history tracking!
    SceneSwitcher.pushLocation(this);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    this.gameCam.zoom = 1;
    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //! needed for handling object dragging
    this.input.on('dragstart', (pointer, gameObject) => {

    }, this);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // eslint-disable-next-line no-param-reassign
      gameObject.x = dragX;
      // eslint-disable-next-line no-param-reassign
      gameObject.y = dragY;

      if (gameObject.name === 'handle') {
        gameObject.data.get('vector').set(dragX, dragY); // get the vector data for curve handle objects
      }
    }, this);

    this.input.on('dragend', function (pointer, gameObject) {
      const worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x));
      const worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y));

      // store the original scale when selecting the gameObject for the first time
      if (ManageSession.selectedGameObject != gameObject) {
        ManageSession.selectedGameObject = gameObject;
        ManageSession.selectedGameObject_startScale = gameObject.scale;
        ManageSession.selectedGameObject_startPosition.x = gameObject.x;
        ManageSession.selectedGameObject_startPosition.y = gameObject.y;
        console.log('editMode info startScale:', ManageSession.selectedGameObject_startScale);
      }
      // ManageSession.selectedGameObject = gameObject

      console.log('editMode info posX posY: ', worldX, worldY, 'scale:', ManageSession.selectedGameObject.scale, 'width*scale:', Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale), 'height*scale:', Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale), 'name:', ManageSession.selectedGameObject.name);
    }, this);
    //!

    //!
    Player.loadPlayerAvatar(this);
    //!

    this.anims.create({
      key: 'moveAnim_Henk',
      frames: [
        { key: 'animation_png_animal_henk_00001' },
        { key: 'animation_png_animal_henk_00002' },
        { key: 'animation_png_animal_henk_00003' },
        { key: 'animation_png_animal_henk_00004' },
        { key: 'animation_png_animal_henk_00005' },
        { key: 'animation_png_animal_henk_00006' },
        { key: 'animation_png_animal_henk_00007' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'stopAnim_Henk',
      frames: [
        { key: 'animation_png_animal_henk_00001' },
      ],
      repeat: 0,
    });

    this.animalHenk = this.physics.add.sprite(1000, 1000, 'animal_henk')
      .play('moveAnim_Henk');
    this.animalHenk.setBodySize(500, 400);
    this.animalHenk.setData('moveAnim', 'moveAnim_Henk');
    this.animalHenk.setData('stopAnim', 'stopAnim_Henk');
    console.log('this.animalHenk', this.animalHenk);
    // this.animalHenk.body.setCircle(200, 300, 300) // gives problems with collision with walls!

    // download all dier from all users
    this.animalKeyArray = [];
    this.animalArray = [];
    this.getListOf('dier');

    // set a collider between the animal and the walls
    this.physics.add.overlap(this.animalHenk, this.borderBoxSouth, this.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxWest, this.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxEast, this.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxNorth, this.animalWallCollide, null, this);

    // set an overlap detection between the animal and the border of the canvas
    this.animalHenk.setVelocity(300, -300);
    this.animalHenk.setBounce(1).setInteractive().setDepth(200);
    this.animalHenk.name = 'dier';

    const tempDelay = Phaser.Math.Between(1000, 20000);
    this.time.addEvent({
      delay: tempDelay, callback: this.stopAnimalMovement, args: [this.animalHenk], callbackScope: this, loop: false,
    });

    // this.animalHenk.on('pointerup', (pointer, x, y, gameobject) => {
    //     console.log("pointer, x, y, gameobject", gameobject)
    //     if (gameobject[0].name == "dier") {
    //         const tempStopAnim = gameobject[0].getData("stopAnim")
    //         gameobject[0].play(tempStopAnim)
    //         gameobject[0].setVelocity(0, 0)
    //         const tempDelay = Phaser.Math.Between(1000, 20000)
    //         this.time.addEvent({ delay: tempDelay, callback: this.resumeAnimalMovement, args: [gameobject[0]], callbackScope: this, loop: false })
    //     }
    // })

    console.log('this.animalHenk.body.velocity ', this.animalHenk.body.velocity);
  } // end create

  makeNewAnimal() {
    console.log('this.animalKeyArray', this.animalKeyArray);

    // destroy and empty the this.animalArray
    this.animalArray.forEach((element) => element.destroy());
    this.animalArray.length = 0;

    this.animalKeyArray.forEach((element, index) => {
      // this.animalKeyArray
      // download animal from this.animalKeyArray

      // we load the onlineplayer avatar, make a key for it
      const avatarKey = element;

      console.log('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);

      if (this.textures.exists(avatarKey)) {
        // console.log("avatarKey", avatarKey)

        const avatar = this.textures.get(avatarKey);
        console.log('avatar', avatar);
        const avatarWidth = avatar.frames.__BASE.width;
        const avatarHeight = avatar.frames.__BASE.height;
        console.log('avatarWidth, avatarHeight', avatarWidth, avatarHeight);

        const avatarFrames = Math.round(avatarWidth / avatarHeight);
        console.log(avatarFrames);

        if (avatarFrames > 1) {
          // set names for the moving and stop animations

          // tempAnimal.setData("movingKey", "moving" + "_" + avatarKey)
          // tempAnimal.setData("stopKey", "stop" + "_" + avatarKey)
          // console.log("tempAnimal.getData('movingKey')", tempAnimal.getData("movingKey"))

          // create animation for moving
          // if (!this.anims.exists(tempAnimal.getData("movingKey"))) {
          // this.anims.create({
          //     key: "move",
          //     frames: this.anims.generateFrameNumbers("testdier", {
          //         start: 0,
          //         end: avatarFrames - 1,
          //     }),
          //     frameRate: (avatarFrames + 2) * 2,
          //     repeat: -1,
          //     yoyo: true,
          // })

          // //create animation for stop
          // this.anims.create({
          //     key: "stop",
          //     frames: this.anims.generateFrameNumbers("testdier", {
          //         start: 0,
          //         end: 0,
          //     }),
          // })

          this.anims.create({
            key: `moving_${avatarKey}`,
            frames: this.anims.generateFrameNumbers(avatarKey, { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1,
            yoyo: true,
          });

          this.anims.create({
            key: `stop_${avatarKey}`,
            frames: this.anims.generateFrameNumbers(avatarKey, { start: 0, end: 0 }),
            // frameRate: 8,
            // repeat: -1,
            // yoyo: true
          });
          const tempAnimal = this.physics.add.sprite(this.worldSize.x / 2 + Phaser.Math.Between(-100, 100), this.worldSize.y / 2 + Phaser.Math.Between(-100, 100), avatarKey)
            .setDepth(200);
          tempAnimal.name = avatarKey;

          tempAnimal.setData('moveAnim', 'moving' + `_${avatarKey}`);
          tempAnimal.setData('stopAnim', 'stop' + `_${avatarKey}`);

          tempAnimal.play(tempAnimal.getData('moveAnim'));
          tempAnimal.name = 'dier';

          // set a collider between the animal and the walls
          this.physics.add.overlap(tempAnimal, this.borderBoxSouth, this.animalWallCollide, null, this);
          this.physics.add.overlap(tempAnimal, this.borderBoxWest, this.animalWallCollide, null, this);
          this.physics.add.overlap(tempAnimal, this.borderBoxEast, this.animalWallCollide, null, this);
          this.physics.add.overlap(tempAnimal, this.borderBoxNorth, this.animalWallCollide, null, this);

          // set random velocity and position
          const randomVelocity = new Phaser.Math.Vector2(Phaser.Math.Between(500, (this.worldSize.x - 500)), Phaser.Math.Between(500, (this.worldSize.y - 500)));
          tempAnimal.setVelocity(Phaser.Math.Between(-300, -500), Phaser.Math.Between(300, 600));
          // tempAnimal.setVelocity(300, -300)
          tempAnimal.setBounce(1).setInteractive().setDepth(200);

          const tempDelay = Phaser.Math.Between(1000, 20000);
          this.time.addEvent({
            delay: tempDelay, callback: this.stopAnimalMovement, args: [tempAnimal], callbackScope: this, loop: false,
          });

          this.animalArray.push(tempAnimal);
          // }
        }// if (avatarFrames > 1) {

        // tempAnimal.setTexture(avatarKey)

        // //scale the player to 64px
        // const width = 64
        // tempAnimal.displayWidth = width
        // tempAnimal.scaleY = tempAnimal.scaleX

        // ...............................................................................................................................

        // create default animation for moving
      } else {

      }
    }); // end this.animalKeyArray.forEach
  } // end makeNewAnimal

  stopAnimalMovement(gameobject) {
    // console.log("gameobject", gameobject)
    if (typeof gameobject.body !== 'undefined') {
      const tempAnim = gameobject.getData('stopAnim');
      gameobject.setVelocity(0, 0);
      gameobject.play(tempAnim);
      const tempDelay = Phaser.Math.Between(1000, 5000);
      this.time.addEvent({
        delay: tempDelay, callback: this.resumeAnimalMovement, args: [gameobject], callbackScope: this, loop: false,
      });
    }
  }

  resumeAnimalMovement(gameobject) {
    // console.log("gameobject", gameobject)
    const tempAnim = gameobject.getData('moveAnim');
    gameobject.setVelocity(Phaser.Math.Between(30, 400), Phaser.Math.Between(-30, -300));
    gameobject.play(tempAnim);
    const tempDelay = Phaser.Math.Between(1000, 20000);
    this.time.addEvent({
      delay: tempDelay, callback: this.stopAnimalMovement, args: [gameobject], callbackScope: this, loop: false,
    });
  }

  async getListOf(displayName) {
    await listAllObjects('stopmotion', null).then((rec) => {
      // download all the drawings and then filter for "bloem"
      this.userArtServerList = rec.filter((obj) => obj.permission_read == 2);
      // console.log("this.userArtServerList", this.userArtServerList)
      this.userArtServerList = this.userArtServerList.filter((obj) => obj.value.displayname == displayName);
      console.log('this.userArtServerList', this.userArtServerList);
      if (this.userArtServerList.length > 0) {
        this.userArtServerList.forEach((element, index, array) => {
          this.getUrlKeys(element, index, array);
        });
      }
    });
  }

  async getUrlKeys(element, index, array) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    const totalArtWorks = array.length;
    const imageKeyUrl = element.value.url;
    console.log('element.value.displayname', element.value.displayname);
    console.log('imageKeyUrl', imageKeyUrl);
    const imgSize = '256'; // download as 512pixels
    const imageWidth = '10000';
    const fileFormat = 'png';

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds the image to the container if it is not yet in the list
      const exists = this.animalKeyArray.some((element) => element == imageKeyUrl);
      if (!exists) {
        this.animalKeyArray.push(imageKeyUrl);
      }
    } else { // otherwise download the image and add it
      this.convertedImage = await convertImage(imageKeyUrl, imgSize, imageWidth, fileFormat);

      // for tracking each file in progress
      // this.progress.push({ imageKeyUrl })
      // let convertedImage = this.convertedImage
      this.downloadSpriteSheet(imageKeyUrl, this.convertedImage, 256);
    }

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork
      // const currentImage = this.progress.find(element => element.imageKeyUrl == key)
      console.log('filecomplete, key', key);
      // we don't want to trigger any other load completions
      // if (currentImage) {

      // adds the image to the container if it is not yet in the list
      const exists = this.animalKeyArray.some((element) => element == imageKeyUrl);
      if (!exists) {
        const avatarKey = imageKeyUrl;
        console.log('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);
        const avatar = this.textures.get(avatarKey);
        console.log('avatar', avatar);
        const avatarWidth = avatar.frames.__BASE.width;
        const avatarHeight = avatar.frames.__BASE.height;
        console.log('avatarWidth, avatarHeight', avatarWidth, avatarHeight);

        if (avatarHeight != 256) {
          console.log('reloading the image', avatarHeight, this.convertedImage);
          this.textures.remove(imageKeyUrl);
          console.log('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);

          this.downloadSpriteSheet(imageKeyUrl, (this.convertedImage), avatarHeight);

          // this.load.spritesheet(imageKeyUrl, this.convertedImage, { frameWidth: avatarHeight, frameHeight: avatarHeight })
          // // this.progress.push({ imageKeyUrl })
          // this.load.start() // start the load queue to get the image in memory
        } else {
          console.log('avatarHeight should be 128', avatarHeight);
          this.animalKeyArray.push(imageKeyUrl);
        }
      } else {
        console.log('complete file already exists');
      }

      // }
    });

    this.load.on('complete', () => {
      // finished downloading
      // replace flowers in the field
      console.log('complete this.animalKeyArray', this.animalKeyArray);
      //
      this.makeNewAnimal();
    });
  }// end downloadArt

  downloadSpriteSheet(imageKeyUrl, convertedUrl, height) {
    console.log('convertedImage', convertedUrl);
    this.load.spritesheet(imageKeyUrl, convertedUrl, { frameWidth: height, frameHeight: height });

    this.load.start(); // start the load queue to get the image in memory
  }

  animalWallCollide(animal, wall) {
    // console.log("animal, wall", animal, wall)
    // console.log("animal.body.velocity angle", animal.body.velocity, Phaser.Math.RadToDeg(animal.body.angle))

    // left - right impact:
    if (wall.name == 'borderBoxWest' || wall.name == 'borderBoxEast') {
      animal.body.velocity.x = -Phaser.Math.Between(animal.body.velocity.x - 200, animal.body.velocity.x + 200);
      // animal.body.velocity.x = -animal.body.velocity.x
      if (animal.body.velocity.x > 700 || animal.body.velocity.x < -700) {
        animal.body.velocity.x = animal.body.velocity.x / 3;
      }

      if (animal.body.velocity.y < 170 && animal.body.velocity.y > -170) {
        animal.body.velocity.y = animal.body.velocity.y * 2;
      }
    }

    // up - down impact:
    if (wall.name == 'borderBoxNorth' || wall.name == 'borderBoxSouth') {
      animal.body.velocity.y = -Phaser.Math.Between(animal.body.velocity.y - 200, animal.body.velocity.y + 200);
      if (animal.body.velocity.y > 700 || animal.body.velocity.y < -700) {
        animal.body.velocity.y = animal.body.velocity.y / 3;
      }

      if (animal.body.velocity.x < 170 && animal.body.velocity.x > -170) {
        animal.body.velocity.x = animal.body.velocity.x * 2;
      }
      // animal.body.velocity.y = -animal.body.velocity.y
    }
    // console.log("animal.body.velocity angle", animal.body.velocity, Phaser.Math.RadToDeg(animal.body.angle))
    // console.log("Math.abs(animal.body.velocity.y) + Math.abs(animal.body.velocity.x)", Math.abs(animal.body.velocity.y) + Math.abs(animal.body.velocity.x))
    // animal.angle = Phaser.Math.RadToDeg(animal.body.angle) + 90
    if (animal.body.velocity.x > 0) {
      animal.flipX = false;
    } else {
      animal.flipX = true;
    }
  }

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(-1215, -589);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    //  if ( this.location1 != null ) this.location1.destroy()

    this.location1 = new GenerateLocation({
      scene: this,
      type: 'isoBox',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location1',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 1',
      referenceName: 'Location1',
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    });

    //* set the particle first on 0,0 so they are below the mario_star
    //* later move them relative to the mario_star
    const particles = this.add.particles('music_quarter_note').setDepth(139);

    const music_emitter = particles.createEmitter({
      x: 0,
      y: 0,
      lifespan: { min: 2000, max: 8000 },
      speed: { min: 80, max: 120 },
      angle: { min: 270, max: 360 },
      gravityY: -50,
      gravityX: 50,
      scale: { start: 1, end: 0 },
      quantity: 1,
      frequency: 1600,
    });

    locationVector = new Phaser.Math.Vector2(-792, -1138);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      internalUrl: 'mariosound',
      locationImage: 'mario_star',
      enterButtonImage: 'enter_button',
      locationText: 'Mario Sound',
      referenceName: 'MarioSound',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    music_emitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20);

    locationVector = new Phaser.Math.Vector2(-2125, 1017);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    // this.pencil = this.add.image(locationVector.x, locationVector.y, "pencil")
    // this.pencil.rotation = 0.12
    // this.pencil.setInteractive()
    // this.pencil.on('pointerup', () => CurrentApp.set("drawing"))

    this.pencil = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      appUrl: 'drawing',
      locationImage: 'pencil',
      enterButtonImage: 'enter_button',
      locationText: 'drawingApp',
      referenceName: 'drawingApp',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.pencil.rotation = 0.12;

    locationVector = new Phaser.Math.Vector2(-1555, 809);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.animalGardenChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'AnimalGardenChallenge',
      locationImage: 'dinoA',
      enterButtonImage: 'enter_button',
      locationText: 'animal Garden',
      referenceName: 'animalGardenChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update(time, delta) {
    // zoom in and out of game
    this.gameCam.zoom = ManageSession.currentZoom;

    // don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................

      // to detect if the player is clicking/tapping on one place or swiping
      if (this.input.activePointer.downX != this.input.activePointer.upX) {
        Move.moveBySwiping(this);
      } else {
        Move.moveByTapping(this);
      }
    } else {
      // when in edit mode
      // this.updateCurveGraphics()
    }
  } // update

  updateCurveGraphics() {
    this.curveGraphics.clear();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }
} // class
