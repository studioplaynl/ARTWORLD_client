import { push } from 'svelte-spa-router';
import SceneSwitcher from './SceneSwitcher';
import { dlog } from '../helpers/DebugLog';
import ManageSession from '../ManageSession';

const { Phaser } = window;

export default class GenerateLocation extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene, config.x, config.y);

    // this.scene = scene
    this.scene = config.scene;
    this.x = config.x;
    this.y = config.y;
    this.locationImage = config.locationImage;
    this.enterButtonImage = config.enterButtonImage;
    this.locationText = config.locationText;
    this.fontColor = config.fontColor;
    this.locationDestination = config.locationDestination;

    this.enterButton = {};

    this.showing = false;

    this.type = config.type;
    this.color1 = config.color1;
    this.color2 = config.color2;
    this.color3 = config.color3;
    this.draggable = config.draggable;
    this.userHome = config.userHome;

    this.location = {};

    this.internalUrl = config.internalUrl;
    this.externalUrl = config.externalUrl;
    this.appUrl = config.appUrl;

    this.enterButtonTween = {};
    this.enterShadowTween = {};
    this.size = config.size;
    const { referenceName } = config;
    this.debugRect = {};
    this.debugRect_y = 0;
    this.debugRect_height = 0;
    this.debugRectXMargin = 0;
    this.numberOfArtworks = config.numberOfArtworks;

    let width;
    let namePlateExtraOffset = 0;

    // setting 'enteringPossible' to true, this can be changed from outside with .setData
    this.setData('enteringPossible', 'true');

    // disable entering when the location is draggable
    // if (this.draggable) this.setData('enteringPossible', 'false');


    this.postFxPlugin = this.scene.plugins.get('rexOutlinePipeline');

    // default size, if no size is specified
    if (typeof this.size === 'undefined') {
      width = 200;
    } else {
      width = this.size;
    }

    // if the location is not userHome we set the userHome to locationDestination,
    // because that is used for SceneSwitcher
    if (typeof this.userHome === 'undefined') {
      this.userHome = this.locationDestination;
    }

    // display width of the location image/ triangle/ isoBox

    // the content of the container is created at 0,0
    // then the container is set at a position

    // image for the location, physical body for collision with the player
    // setOrigin(0.5) in the middle
    if (this.type === 'image') {
      // this.scene.textures.exists(this.locationImage);
      this.location = this.scene.physics.add.image(0, 0, this.locationImage).setOrigin(0.5, 0.5).setDepth(30);

      const cropWidth = this.location.width;
      const cropHeight = this.location.height;

      // debug rectangle to see to total space needed for the placement of a house when in dragging mode
      this.debugRect_y = -(width / 2);
      this.debugRect_height = width;

      // set the location to a fixed size, also scales the physics body
      this.location.displayWidth = width;
      this.location.scaleY = this.location.scaleX;
      this.location.body.setSize(this.location.width, this.location.height);
      const cropMargin = 1; // sometimes there is a little border visible on a drawn image
      this.location.setCrop(cropMargin, cropMargin, cropWidth - cropMargin, cropHeight - cropMargin);
    }

    if (this.type === 'isoTriangle') {
      // dlog("isoTriangle!")
      // this.location = this.scene.add.isotriangle(0, width / 4, width, width, false, 0x8dcb0e, 0x3f8403, 0x63a505)
      this.location = this.scene.add.isotriangle(
        0,
        width / 4,
        width,
        width,
        false,
        this.color1,
        this.color2,
        this.color3,
      );

      // debug rectangle to see to total space needed for the placement of a house
      this.debugRect_y = -(width / 2);
      this.debugRect_height = width;

      this.scene.physics.add.existing(this.location);
      this.location.body.setSize(this.location.width, this.location.height);
      this.location.body.setOffset(0, -(this.location.height / 4));
    }

    if (this.type === 'isoBox') {
      // dlog("isoBox!")
      // this.location = this.scene.add.isobox(0, 0, width, width / 1.4, 0xffe31f, 0xf2a022, 0xf8d80b)
      this.location = this.scene.add.isobox(
        0,
        0,
        width,
        width / 1.4,
        this.color1,
        this.color2,
        this.color3,
      );

      // debug rectangle to see to total space needed for the placement of a house
      this.debugRect_y = -(width * 0.98);
      this.debugRect_height = width * 1.25;

      this.scene.physics.add.existing(this.location);
      this.location.body.setSize(this.location.width, this.location.height * 1.6);
      this.location.body.setOffset(0, -(this.location.height / 1.4));
      namePlateExtraOffset = 50;
    }

    // can't drag the location if there is another function for pointerdown
    // we set the location either clickable or dragable (because dragging is a edit function)
    if (!this.draggable) {
      this.setLocationAsInteractive();
    }

    // place thethis.userHome description under the location image
    const namePlateMargin = 20;
    const textOffset = -20 + namePlateExtraOffset;
    const textPlateOffset = textOffset + namePlateMargin;
    const locationDescription = this.scene.add.text(
      0,
      width / 2 - textOffset,
      this.locationText,
      {
        fill: this.fontColor,
      },
    )
      .setOrigin(0.5, 0.5)
      .setDepth(32);

    // location plate name
    const namePlate = this.scene.add.graphics()
      .fillStyle(0xE8E8E8, 1)
      .fillRoundedRect(
        0 - (locationDescription.width + namePlateMargin) / 2,
        width / 2 - textPlateOffset,
        locationDescription.width + namePlateMargin, // text's width + 10 (to have space between border and text)
        namePlateMargin * 2,
        10,
      ).setDepth(31);

    // if there is a number of artWorks passed on as argument, display the number besides the namePlate
    if (typeof this.numberOfArtworks !== 'undefined') {
      // if (this.numberOfArtworks !== -1) {
      // dlog('this.numberOfArtworks', this.numberOfArtworks);
      this.numberBubble = this.scene.add.circle(
        namePlate.x + locationDescription.width + (namePlateMargin * 0.5),
        -width / 2 + (textOffset * 0.5),
        namePlateMargin,
        0xE8E8E8,
      )
        .setOrigin(0.5, 0.5)
        .setDepth(498)
        .setName([this.numberBubble]);

      this.numberArt = this.scene.add.text(
        namePlate.x + locationDescription.width + (namePlateMargin * 0.5),
        -width / 2 + (textOffset * 0.5),
        this.numberOfArtworks,
        {
          fontFamily: 'Courier',
          fontSize: '22px',
          fontStyle: 'bold',
          backgroundColor: null,
          color: '#ff0000',
        },
      )
        .setOrigin(0.5, 0.5)
        .setDepth(499);
    }

    // back button that appears
    const enterButtonYOffset = -30;
    const enterButtonYTweenOffset = 15;
    const enterButtonY = this.y - (width / 2) - enterButtonYOffset;
    const enterButtonTweenY = enterButtonY + enterButtonYTweenOffset;

    // this.enterButtonHitArea = this.scene.add.image(this.x, enterButtonY, 'enterButtonHitArea').setDepth(201)
    // this.enterButtonHitArea.alpha = 0 // make the hitArea invisible

    // this.enterButtonHitArea.displayWidth = width / 1.05
    this.enterArea = this.scene.add.rectangle(
      this.x,
      this.y,
      width,
      width,
      0x7300ED,
      0,
    )
      .setVisible(false)
      .setInteractive() // { useHandCursor: true }
      .setName('enterArea')
      .setDepth(501);

    this.enterShadow = this.scene.add.circle(
      this.x,
      enterButtonY + 5,
      30,
      0x7300ED,
    )
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setDepth(500);
    // .setStrokeStyle(2, 0x000000)

    this.enterButton = this.scene.add.image(
      this.x,
      enterButtonY,
      this.enterButtonImage,
    )
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setScale(0.6)
      .setDepth(500);

    this.enterButtonTween = this.scene.tweens.add({
      targets: this.enterButton,
      y: enterButtonTweenY,
      // alpha: 0.5,
      duration: 500,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });

    // set a square margin around the location so that the spacing of them next to each other feels less crammed
    this.debugRectXMargin = this.scene.add.graphics()
      .fillStyle(0xff0000, 0.4)
      .fillRoundedRect(
        0 - (this.debugRect_height / 2),
        this.debugRect_y,
        this.debugRect_height,
        this.debugRect_height,
        10,
      )
      .setDepth(30)
      .setVisible(false);

    this.debugRect = this.scene.add.graphics()
      .fillStyle(0xffff00, 0.6)
      .fillRoundedRect(
        0 - (width / 2),
        this.debugRect_y,
        width,
        this.debugRect_height,
        10,
      )
      .setDepth(30)
      .setVisible(false);

    // the container is created at the this.x and this.y
    // this.setSize(width, width)
    // this.scene[referenceName] = this.add(this.location)
    this.name = referenceName;
    this.add(this.debugRect); // add to the container
    this.add(this.debugRectXMargin); // add to the container
    this.add(this.location); // add to the container
    this.add(namePlate); // add to the container
    this.add(locationDescription); // add to the container
    if (typeof this.numberOfArtworks !== 'undefined') {
      this.add(this.numberBubble); // add to the container
      this.add(this.numberArt);
    }

    this.setSize(width, width, false);

    this.enterArea.on('pointerdown', () => {
      // check when entering the location if it is an URL or scene
      ManageSession.playerIsAllowedToMove = false;
      if (typeof this.internalUrl !== 'undefined') {
        dlog('internal url 1');
        this.scene.scene.pause();
        const baseUrl = window.location.href.split('?')[0];
        const url = `${baseUrl}#/${this.internalUrl}`;
        dlog('baseUrl, url', baseUrl, url);

        const s = window.open(url, '_parent');

        if (s && s.focus) {
          dlog('internal url 2');
          s.focus();
          // window.location.reload()
        } else if (!s) {
          dlog('internal url 3');
          window.location.href = url;
          // window.location.reload()
        }
      }

      if (typeof this.externalUrl !== 'undefined') {
        this.scene.scene.pause();

        const url = this.externalUrl;
        const s = window.open(url, '_parent');

        if (s && s.focus) {
          s.focus();
        } else if (!s) {
          window.location.href = url;
        }
      }

      if (typeof this.appUrl !== 'undefined') {
        // Add a leading slash as apps should reflect URLs
        if (this.appUrl.split('')[0] !== '/') this.appUrl = `/${this.appUrl}`;
        dlog('push(this.appUrl)', this.appUrl);
        if (this.appUrl === '/mariosound') {
          setTimeout(() => { window.location.reload(); }, 500);
          push(this.appUrl);
        } else {
          push(this.appUrl);
        }
      }

      if (typeof this.locationDestination !== 'undefined') {
        SceneSwitcher.switchScene(this.locationDestination, this.userHome);
      }
    });

    this.scene.physics.add.overlap(this.scene.player, this.location, this.confirmEnterLocation, null, this);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // TODO draggable should be event based driven so it can be set reactive
    // with this.getData('draggable') values can be changed from outside
    // and with functions/ data events there can be reactions
    if (this.draggable) {
      this.makeDraggable(enterButtonY, enterButtonTweenY);
    }

    // data change example
    this.on('changedata-enteringPossible', (GameObject, arg) => {
      // dlog('datachanged, GameObject, arg', GameObject, arg);
      // dlog('datachanged, arg ', arg);

      // when this.draggable this.location does not exist
      // check if this.location is not null
      const locationExists = (typeof this.location !== 'undefined');

      switch (arg) {
        case 'true':
          if (locationExists) { this.location.setInteractive({ useHandCursor: true }); }

          break;

        case 'false':
          if (locationExists) { this.location.disableInteractive(); }
          break;

        default:
          dlog('changedata-enteringPossible NEEDS ARGUMENTS', GameObject, arg);
          break;
      }
    });
  }

  setLocationAsInteractive() {
    this.location.setInteractive({ useHandCursor: true });
    this.location.setName('location');
    // dlog("this.location.width, this.location.height", this.location.width, this.location.height)

    // the width and height are not the same for isobox,
    // we make the hitarea for
    const hitAreaWidth = this.location.width;
    const hitAreaheight = this.location.height;
    if (hitAreaWidth !== hitAreaheight) {
      //  Coordinates are relative from the top-left, so we want out hit area to be
      //  an extra 60 pixels around the texture, so -30 from the x/y and + 60 to the texture width and height

      // extend the isobox hitarea
      this.location.input.hitArea.setTo(
        -hitAreaWidth / 3,
        -hitAreaWidth / 1.3,
        hitAreaWidth * 1.4,
        hitAreaWidth * 1.5,
      );
    }

    // on home click, we let the player to see the entrance arrow above the home
    this.location.on('pointerdown', () => {
      if (!this.showing && this.getData('enteringPossible') === 'true') {
        this.initConfirm();
        this.enterButton.setVisible(this.showing);
        this.enterShadow.setVisible(this.showing);
        this.enterArea.setVisible(this.showing);
        ManageSession.playerIsAllowedToMove = false;
      }
    });
  }

  makeDraggable() {
    const { width } = this;
    // this.location.disableInteractive();
    this.setInteractive(); // the whole container is draggable
    this.debugRect.setVisible(true);
    this.debugRectXMargin.setVisible(true)
      .on('drag', (p) => {
        this.setX(p.worldX);
        this.setY(p.worldY);
        // The enterButton is outside the container, so that it can appear above the player
        // when dragging the container we have to move the enterButton aswell
        this.enterButton.x = this.x;
        const enterButtonY = this.y - (width / 2) - 60;
        const enterButtonTweenY = enterButtonY + 90;
        this.enterButton.y = enterButtonY;
        // this.enterButtonTween.restart()
        this.enterButtonTween.stop();
        this.enterButtonTween.remove();
        this.enterButtonTween = this.scene.tweens.add({
          targets: this.enterButton,
          y: enterButtonTweenY,
          alpha: 0.0,
          duration: 1000,
          ease: 'Sine.easeInOut',
          repeat: -1,
          yoyo: true,
        });
      });

    this.scene.input.setDraggable(this, true);
  }

  confirmEnterLocation() {
    if (this.getData('enteringPossible') === 'true') {
      this.initConfirm();
      this.enterButton.setVisible(true);
      this.enterShadow.setVisible(true);
      this.enterArea.setVisible(true);

    // needed for an image or sprite to be interactive when alpha = 0
    // this.enterButtonHitArea.input.alwaysEnabled = true
    }
  }

  hideEnterButton() {
    this.showing = false;
    this.enterButton.setVisible(this.showing);
    this.enterShadow.setVisible(this.showing);
    this.enterArea.setVisible(this.showing);
    // this.enterButtonHitArea.disableInteractive() //turn off interactive off hitArea when it is not used
    this.postFxPlugin.remove(this);
  }

  initConfirm() {
    if (!this.showing) {
      this.showing = true;
      this.scene.time.addEvent({
        delay: 4000, callback: this.hideEnterButton, callbackScope: this, loop: false,
      });
      this.postFxPlugin.add(this, {
        thickness: 5,
        outlineColor: 0xff8a50,
      });
    }
  }
}
