/**
 * @file ArtworkOptions.js
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This file is used to place the heart button under the artwork in user home.
 *  The heart button is used to like the artwork.
 *  The other option is to place a play/ pause button under the stopmotion
 *
 *  The ServerCall class uses it when loading art in DefaultUserHome
 */

import { Liked } from '../../../storage';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';

class ArtworkOptions {
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
      .setScale(1)
      .setInteractive()
      .setData('toggle', true) // true, not liked state
      .on(
        'pointerup',
        () => {
          ArtworkOptions.heartButtonToggle(mediaObject, currentHeart);
        },
      );

    artContainer.add(currentHeart);

    // subscribe once to the Liked store
    if (this.alreadySubscribedToLiked !== true) {
      this.subscribeToLiked();
    }

    // dlog("this.heartArray", this.heartArray)
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

  // eslint-disable-next-line class-methods-use-this
  placePlayPauseButton(scene, x, y, imageurl, mediaObject, artContainer) {
    // scene, x, y, keyImgUrl, mediaObject, artContainer
    // place heartButton under the artwork, make them interactive
    // const artFrame = scene.textures.get('artFrame_512');
    const marginY = 16;

    const playButton = scene.add.image(
      x - (marginY * 6), // - artFrame.height
      y,
      'play',
    )
      .setOrigin(0)
      // const playPause = scene.add.image(
      //   x - artFrame.height + marginY,
      //   y + (artFrame.height / 2) + marginY,
      //   'play',
      // )
      .setScale(0.7)
      .setInteractive()
      .setData('togglePlay', true) // true, not liked state
      .on(
        'pointerup',
        () => {
          ArtworkOptions.playPauseButtonToggle(playButton);
        },
      );

    // const playButton = scene.add.circle(
    //   x - (marginY * 2), // - artFrame.height
    //   y + marginY,

    //   20,
    //   0x000000,
    // )
    //   .setOrigin(0)
    //   .setInteractive()
    //   .setData('togglePlay', true) // true, not liked state
    //   .on(
    //     'pointerup',
    //     () => {
    //       ArtworkList.playPauseButtonToggle(playButton);
    //     },
    //   );

    artContainer.add(playButton);
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

  static async heartButtonToggle(mediaObject, button) {
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
      // dlog('mediaObject.key, parsedMediaOject: ', mediaObject.key, parsedMediaOject);
      Liked.create(mediaObject.key, parsedMediaOject);
    } else {
      // changing to empty, not liked
      button.setTexture('heart_empty');
      button.setData('toggle', true);

      Liked.delete(mediaObject.key);
    }
  }

  static playPauseButtonToggle(button) {
    const container = button.parentContainer;
    const stopmotion = container.getByName('stopmotion');
    // dlog('clicked play button, container, button, stopmotion', container, button, stopmotion);

    const toggle = button.getData('togglePlay');

    if (toggle) {
      // changing to red, liked
      button.setAlpha(0.5);
      button.setData('togglePlay', false);
      stopmotion.play(stopmotion.getData('stopAnim'));
      // stopmotion.anims.msPerFrame = 400;
    } else {
      // changing to empty, not liked
      button.setAlpha(1);
      button.setData('togglePlay', true);
      stopmotion.play(stopmotion.getData('playAnim'));
      // stopmotion.anims.msPerFrame = 120;
    }
  }
}

export default new ArtworkOptions();
