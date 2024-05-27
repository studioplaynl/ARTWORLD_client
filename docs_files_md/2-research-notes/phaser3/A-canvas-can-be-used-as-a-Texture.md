https://photonstorm.github.io/phaser3-docs/Phaser.Textures.TextureManager.html

**addCanvas(key, source [, skipCache])**

Creates a new Canvas Texture object from an existing Canvas element and adds it to this Texture Manager, unless skipCache is true.

**Parameters:**

Name Type Argument Default Description
key string The unique string-based key of the Texture.
source HTMLCanvasElement The Canvas element to form the base of the new Texture.
skipCache boolean <optional> false Skip adding this Texture into the Cache?
Example: https://phaser.io/examples/v3/view/textures/create-canvas

---

**addGLTexture(key, glTexture [, width] [, height])**

Takes a WebGL Texture and creates a Phaser Texture from it, which is added to the Texture Manager using the given key.

This allows you to then use the Texture as a normal texture for texture based Game Objects like Sprites.

If the width and height arguments are omitted, but the WebGL Texture was created by Phaser’s WebGL Renderer and has glTexture.width and glTexture.height properties, these values will be used instead.

This is a WebGL only feature.

---

**addImage(key, source [, dataSource])**

Adds a new Texture to the Texture Manager created from the given Image element.

dataSource HTMLImageElement | HTMLCanvasElement

---

**addRenderTexture(key, renderTexture)**

Adds a Render Texture to the Texture Manager using the given key. This allows you to then use the Render Texture as a normal texture for texture based Game Objects like Sprites.

renderTexture Phaser.GameObjects.RenderTexture
