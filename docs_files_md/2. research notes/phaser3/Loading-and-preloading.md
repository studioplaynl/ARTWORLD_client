Create a preloading scene, show percentage loaded:

https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/?a=13

dealing cards example
https://blog.ourcade.co/posts/2020/phaser3-load-images-dynamically/

phaser loader events
https://newdocs.phaser.io/docs/3.55.2/events

FILE_KEY_COMPLETE event
https://newdocs.phaser.io/docs/3.55.2/Phaser.Loader.Events.FILE_KEY_COMPLETE

FILE_PROGRESS event
https://newdocs.phaser.io/docs/3.55.2/Phaser.Loader.Events.FILE_PROGRESS

---

## Loading User Avatar - during runtime

his.load.image( this.playerAvatarName, manageSession.playerObjectSelf.url ); }

this.load.once(Phaser.Loader.Events.COMPLETE, () => { // texture loaded so use instead of the placeholder this.player.setTexture(this.playerAvatarKey) console.log(“player avatar has loaded “) }) }

this.load.start(); // load the image in memory

The event to load a image or sprite works.

I need to see if my method is save enough; I set a flag when the player is created (this.createdPlayer = true)

Maybe it is saver to first create a general player, and then when the avatar is loaded, replace the image or sprite with this.player.setTexture(key, frame)

heart1.setTexture(key [, frame]) 

https://www.html5gamedevs.com/topic/41170-how-can-i-change-the-image-of-a-sprite-during-update-function/

img.setTexture(key, frame)

https://phaser.discourse.group/t/how-to-switch-sprites-of-a-game-object/297/3

See also phaser API:

https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Image.html

https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Sprite.html
