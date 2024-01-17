https://newdocs.phaser.io/docs/3.55.2/Phaser.Textures.TextureManager

The problem with loading players avatars was that they are stored in cache after load. So we have to check whether the image is already in cache.

We have to find a way to check the cache

Images are stored in the TextureManager

The list of all loaded assets in the TextureManager can be get with:

this.textures.list

This returns an object, will all the kays

We can check against existing loaded images with:

```
this.textures.exists(keyName))
```

You can get the raw image data like this:

```
var tex = this.textures.get('key');

tex.getSourceImage();
```

You can pass getSourceImage a frame key, should the texture span multiple image files (like in a multi-texture set-up)

---

If you’ve assigned an image asset to a game object, you can find it in **object.texture.source[0].image**

---

Assign a new image to an existing GameObject with:

```
GameObject.setTexture(KeyName)

```

https://blog.ourcade.co/posts/2020/phaser3-load-images-dynamically/

