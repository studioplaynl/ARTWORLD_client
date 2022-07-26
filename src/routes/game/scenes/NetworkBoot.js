import ManageSession from '../ManageSession';
import { CurrentApp } from '../../../session';
import { Addressbook, Liked } from '../../../storage';
import { dlog } from '../helpers/DebugLog';

const { Phaser } = window;

export default class NetworkBoot extends Phaser.Scene {
  constructor() {
    super('NetworkBoot');
  }

  async preload() {
    // setLoader(true)
    this.scene.launch('UIScene');
    ManageSession.createPlayer = true;

    // we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(async () => {
        // get server object so that the data is Initialized
        Liked.get();
        Addressbook.get();

        dlog('ManageSession.locationID', ManageSession.locationID);
        this.scene.launch(ManageSession.location, { user_id: ManageSession.locationID });

        CurrentApp.update(() => 'game');
      });
  }
}
