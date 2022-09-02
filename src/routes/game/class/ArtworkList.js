import { Liked } from '../../../storage';
import { dlog } from '../helpers/DebugLog';

class ArtworkList {
  constructor() {
    this.heartArray = [];
    this.heartArrayLastValue = 0;
  }

  subscribeToLiked() {
    Liked.subscribe((value) => {
      this.alreadySubscribedToLiked = true;
      this.heartArray = value;
      if (this.heartArrayLastValue !== this.heartArray.length) {
        this.heartArrayLastValue = this.heartArray.length;
      }
    });
  }

  placeHeartButton(scene, x, y, keyImgUrl, mediaObject, artContainer) {
    // we get the mediaObject passed along:
    // collection: "drawing"
    // create_time: "2022-01-27T16:46:00Z"
    // key: "1643301959176_cyaanConejo"
    // permission_read: 2
    // permission_write: 1
    // update_time: "2022-02-Heart:14:07Z"
    // user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    // value:
    //      displayname: "cyaanConejo"
    //      json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //      previewUrl: "https://.."
    //      url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    // version: 0

    // keyImgUrl = mediaObject.value.url

    // place heartButton under the artwork, make them interactive
    const currentHeart = scene.add.image(
      x,
      y,
      'heart',
    )
      .setOrigin(0)
      .setScale(0.7)
      .setInteractive()
      .setData('toggle', true) // true, not liked state
      .on(
        'pointerup',
        () => {
          ArtworkList.heartButtonToggle(scene, mediaObject, currentHeart);
        },
      );

    artContainer.add(currentHeart);

    // subscribe once to the Liked store
    if (this.alreadySubscribedToLiked !== true) {
      this.subscribeToLiked();
    }

    // console.log("this.heartArray", this.heartArray)
    const exists = this.heartArray.some(
      (element) => element.value.url === keyImgUrl,
    );
    if (exists) {
      // changing to red, liked
      currentHeart.setTexture('heart');
      currentHeart.setData('toggle', false);
    } else {
      // changing to blank, not liked
      currentHeart.setTexture('heart_empty');
      currentHeart.setData('toggle', true);
    }
  }

  static async heartButtonToggle(scene, mediaObject, button) {
    // we get the mediaObject passed along:
    // collection: "drawing"
    // create_time: "2022-01-27T16:46:00Z"
    // key: "1643301959176_cyaanConejo"
    // permission_read: 2
    // permission_write: 1
    // update_time: "2022-02-Heart:14:07Z"
    // user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    // value:
    //      displayname: "cyaanConejo"
    //      json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //      previewUrl: "http://..."
    //      status: ""
    //      url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    // version: 0

    // button is the heart button
    const parsedMediaOject = {
      user_id: mediaObject.user_id,
      collection: mediaObject.collection,
      key: mediaObject.key,
      version: mediaObject.value.version,
      url: mediaObject.value.url,
      previewURl: mediaObject.value.previewURl,
    };
    const toggle = button.getData('toggle');

    if (toggle) {
      // changing to red, liked
      button.setTexture('heart');
      button.setData('toggle', false);

      // create server object
      // updates the object server side
      Liked.create(mediaObject.key, parsedMediaOject);
    } else {
      // changing to empty, not liked
      button.setTexture('heart_empty');
      button.setData('toggle', true);

      Liked.delete(mediaObject.key);
    }
  }

  placePlayPauseButton(scene, x, y, imageurl, gameObject, artContainer) {
    // place heartButton under the artwork, make them interactive
    const artFrame = scene.textures.get('artFrame_512');
    const marginY = 16;
    const playCircle = scene.add.circle(
      x - artFrame.height + marginY,
      y + (artFrame.height / 2) + marginY,

      30,
      0x000000,
    )
      .setOrigin(0)
    // const playPause = scene.add.image(
    //   x - artFrame.height + marginY,
    //   y + (artFrame.height / 2) + marginY,
    //   'play',
    // )
    //   .setOrigin(0)
    //   .setScale(1.2)
      .setInteractive()
      .setData('togglePlay', true) // true, not liked state
      .on(
        'pointerup',
        () => {
          ArtworkList.playPauseButtonToggle();
        },
      );

    artContainer.add(playCircle);
    // artContainer.add(playPause);




    // if (playing) {
    //   // changing to red, liked
    //   currentHeart.setTexture('play');
    //   currentHeart.setData('togglePlay', false);
    // } else {
    //   // changing to blank, not liked
    //   currentHeart.setTexture('pause');
    //   currentHeart.setData('togglePlay', true);
    // }
  }

  static async playPauseButtonToggle() {
    console.log('clicked play button');
  }
}

export default new ArtworkList();
