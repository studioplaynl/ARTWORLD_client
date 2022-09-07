/* eslint-disable no-underscore-dangle */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import {
  convertImage, listAllObjects,
} from '../../../api';

import Background from '../class/Background';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import SceneSwitcher from '../class/SceneSwitcher';
import { dlog } from '../helpers/DebugLog';
import { playerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';


const { Phaser } = window;

export default class ChallengeAnimalGarden extends Phaser.Scene {
  constructor() {
    super('ChallengeAnimalGarden');

    this.worldSize = new Phaser.Math.Vector2(4000, 1200);
    this.location = 'ChallengeAnimalGarden';
    this.debug = false;

    this.phaser = this;
    // this.playerPos

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    this.artDisplaySize = 64;
    this.artArray = [];

    // testing
    this.resolveLoadErrorCache = [];

    // shadow
    this.playerShadowOffset = -8;

    // this.currentZoom = 1;

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
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    const borderBoxWidth = 40;

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

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

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
    this.animalHenk.setDepth(20);
    // dlog('this.animalHenk', this.animalHenk);
    // this.animalHenk.body.setCircle(200, 300, 300) // gives problems with collision with walls!

    // download all dier from all users
    this.animalKeyArray = [];
    this.animalArray = [];
    this.getListOf('dier');

    // set a collider between the animal and the walls
    this.physics.add.overlap(this.animalHenk, this.borderBoxSouth, ChallengeAnimalGarden.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxWest, ChallengeAnimalGarden.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxEast, ChallengeAnimalGarden.animalWallCollide, null, this);
    this.physics.add.overlap(this.animalHenk, this.borderBoxNorth, ChallengeAnimalGarden.animalWallCollide, null, this);

    // set an overlap detection between the animal and the border of the canvas
    this.animalHenk.setVelocity(300, -300);
    this.animalHenk.setBounce(1).setInteractive().setDepth(200);
    this.animalHenk.name = 'dier';

    const tempDelay = Phaser.Math.Between(1000, 20000);
    this.time.addEvent({
      delay: tempDelay, callback: this.stopAnimalMovement, args: [this.animalHenk], callbackScope: this, loop: false,
    });

    // this.animalHenk.on('pointerup', (pointer, x, y, gameobject) => {
    //     dlog("pointer, x, y, gameobject", gameobject)
    //     if (gameobject[0].name == "dier") {
    //         const tempStopAnim = gameobject[0].getData("stopAnim")
    //         gameobject[0].play(tempStopAnim)
    //         gameobject[0].setVelocity(0, 0)
    //         const tempDelay = Phaser.Math.Between(1000, 20000)
    // this.time.addEvent({
    //   delay: tempDelay,
    //   callback: this.resumeAnimalMovement,
    //   args: [gameobject[0]],
    //   callbackScope: this,
    //   loop: false,
    // });
    //     }
    // })

    dlog('this.animalHenk.body.velocity ', this.animalHenk.body.velocity);
  } // end create

  makeNewAnimal() {
    dlog('this.animalKeyArray', this.animalKeyArray);

    // destroy and empty the this.animalArray
    this.animalArray.forEach((element) => element.destroy());
    this.animalArray.length = 0;

    this.animalKeyArray.forEach((element) => {
      // this.animalKeyArray
      // download animal from this.animalKeyArray

      // we load the onlineplayer avatar, make a key for it
      const avatarKey = element;

      // dlog('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);

      if (this.textures.exists(avatarKey)) {
        // dlog("avatarKey", avatarKey)

        const avatar = this.textures.get(avatarKey);
        dlog('avatar', avatar);
        const avatarWidth = avatar.frames.__BASE.width;
        const avatarHeight = avatar.frames.__BASE.height;
        dlog('avatarWidth, avatarHeight', avatarWidth, avatarHeight);

        const avatarFrames = Math.round(avatarWidth / avatarHeight);
        dlog(avatarFrames);

        if (avatarFrames > 1) {
          // set names for the moving and stop animations
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
          const tempAnimal = this.physics.add.sprite(
            this.worldSize.x / 2 + Phaser.Math.Between(-100, 100),
            this.worldSize.y / 2 + Phaser.Math.Between(-100, 100),
            avatarKey,
          )
            .setDepth(20);
          tempAnimal.name = avatarKey;

          tempAnimal.setData('moveAnim', `moving_${avatarKey}`);
          tempAnimal.setData('stopAnim', `stop_${avatarKey}`);

          tempAnimal.play(tempAnimal.getData('moveAnim'));
          tempAnimal.name = 'dier';

          // set a collider between the animal and the walls
          this.physics.add.overlap(
            tempAnimal,
            this.borderBoxSouth,
            ChallengeAnimalGarden.animalWallCollide,
            null,
            this,
          );
          this.physics.add.overlap(
            tempAnimal,
            this.borderBoxWest,
            ChallengeAnimalGarden.animalWallCollide,
            null,
            this,
          );
          this.physics.add.overlap(
            tempAnimal,
            this.borderBoxEast,
            ChallengeAnimalGarden.animalWallCollide,
            null,
            this,
          );
          this.physics.add.overlap(
            tempAnimal,
            this.borderBoxNorth,
            ChallengeAnimalGarden.animalWallCollide,
            null,
            this,
          );

          // set random velocity and position
          // const randomVelocity = new Phaser.Math.Vector2(
          //   Phaser.Math.Between(500, (this.worldSize.x - 500)),
          //   Phaser.Math.Between(500, (this.worldSize.y - 500)),
          // );
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

        // ...........................................................................................................
        // create default animation for moving
      }
    }); // end this.animalKeyArray.forEach
  } // end makeNewAnimal

  stopAnimalMovement(gameobject) {
    // dlog("gameobject", gameobject)
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
    // dlog("gameobject", gameobject)
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
      this.userArtServerList = rec.filter((obj) => obj.permission_read === 2);
      // dlog("this.userArtServerList", this.userArtServerList)
      this.userArtServerList = this.userArtServerList.filter((obj) => obj.value.displayname === displayName);
      dlog('this.userArtServerList', this.userArtServerList);
      if (this.userArtServerList.length > 0) {
        this.userArtServerList.forEach((element, index, array) => {
          this.getUrlKeys(element, index, array);
        });
      }
    });
  }

  async getUrlKeys(element) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    // const totalArtWorks = array.length;
    const imageKeyUrl = element.value.url;
    dlog('element.value.displayname', element.value.displayname);
    dlog('imageKeyUrl', imageKeyUrl);
    const imgSize = '256'; // download as 512pixels
    const imageWidth = '10000';
    const fileFormat = 'png';

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key
      // adds the image to the container if it is not yet in the list
      const exists = this.animalKeyArray.some((elementCheck) => elementCheck === imageKeyUrl);
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
      dlog('filecomplete, key', key);
      // we don't want to trigger any other load completions
      // if (currentImage) {

      // adds the image to the container if it is not yet in the list
      const exists = this.animalKeyArray.some((elementCheck) => elementCheck === imageKeyUrl);
      if (!exists) {
        const avatarKey = imageKeyUrl;
        dlog('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);
        const avatar = this.textures.get(avatarKey);
        dlog('avatar', avatar);
        const avatarWidth = avatar.frames.__BASE.width;
        const avatarHeight = avatar.frames.__BASE.height;
        dlog('avatarWidth, avatarHeight', avatarWidth, avatarHeight);

        if (avatarHeight !== 256) {
          dlog('reloading the image', avatarHeight, this.convertedImage);
          this.textures.remove(imageKeyUrl);
          dlog('this.textures.exists(avatarKey)', this.textures.exists(avatarKey), avatarKey);

          this.downloadSpriteSheet(imageKeyUrl, (this.convertedImage), avatarHeight);

          // this.load.start() // start the load queue to get the image in memory
        } else {
          dlog('avatarHeight should be 128', avatarHeight);
          this.animalKeyArray.push(imageKeyUrl);
        }
      } else {
        dlog('complete file already exists');
      }

      // }
    });

    this.load.on('complete', () => {
      // finished downloading
      // replace flowers in the field
      dlog('complete this.animalKeyArray', this.animalKeyArray);
      //
      this.makeNewAnimal();
    });
  }// end downloadArt

  downloadSpriteSheet(imageKeyUrl, convertedUrl, height) {
    dlog('convertedImage', convertedUrl);
    this.load.spritesheet(imageKeyUrl, convertedUrl, { frameWidth: height, frameHeight: height });

    this.load.start(); // start the load queue to get the image in memory
  }

  static animalWallCollide(animal, wall) {
    // dlog("animal, wall", animal, wall)
    // dlog("animal.body.velocity angle", animal.body.velocity, Phaser.Math.RadToDeg(animal.body.angle))

    // left - right impact:
    if (wall.name === 'borderBoxWest' || wall.name === 'borderBoxEast') {
      animal.body.setVelocity(-Phaser.Math.Between(animal.body.velocity.x - 200, animal.body.velocity.x + 200));
      // animal.body.velocity.x = -Phaser.Math.Between(animal.body.velocity.x - 200, animal.body.velocity.x + 200);
      if (animal.body.velocity.x > 700 || animal.body.velocity.x < -700) {
        animal.body.setVelocity(animal.body.velocity.x / 3);
        //  animal.body.velocity.x /= 3;
      }

      if (animal.body.velocity.y < 170 && animal.body.velocity.y > -170) {
        animal.body.setVelocity(animal.body.velocity.x * 2);
        // animal.body.velocity.y *= 2;
      }
    }

    // up - down impact:
    if (wall.name === 'borderBoxNorth' || wall.name === 'borderBoxSouth') {
      animal.body.setVelocity(-Phaser.Math.Between(animal.body.velocity.x - 200, animal.body.velocity.x + 200));
      // animal.body.velocity.y = -Phaser.Math.Between(animal.body.velocity.y - 200, animal.body.velocity.y + 200);
      if (animal.body.velocity.y > 700 || animal.body.velocity.y < -700) {
        animal.body.setVelocity(animal.body.velocity.x / 3);
        // animal.body.velocity.y /= 3;
      }

      if (animal.body.velocity.x < 170 && animal.body.velocity.x > -170) {
        animal.body.setVelocity(animal.body.velocity.x * 2);
        // animal.body.velocity.x *= 2;
      }
    }
    // dlog("animal.body.velocity angle", animal.body.velocity, Phaser.Math.RadToDeg(animal.body.angle))
    if (animal.body.velocity.x > 0) {
      animal.setFlipX(false);
      // animal.flipX = false;
    } else {
      animal.setFlipX(true);
      // animal.flipX = true;
    }
  }

  update() {
    // don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    }
  } // update
} // class
