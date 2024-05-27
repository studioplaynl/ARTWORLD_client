Drawing with rope:
https://phaser.io/examples/v3/view/game-objects/rope/draw-rope-gradient

Draw on live texture:
https://phaser.io/examples/v3/view/game-objects/render-texture/draw-on-texture

erase part of texture:
https://phaser.io/examples/v3/view/game-objects/render-texture/erase-part-of-render-texture

Draw with sprites:
https://phaser.io/examples/v3/view/input/pointer/draw-sprites

color picker:

https://phaser.io/examples/v3/view/game-objects/shapes/iso-draw

Draw with interpolation:

https://phaser.io/examples/v3/view/game-objects/render-texture/paint-interpolated

##Draw (with mouse or shapes) in a RenderTexture

A Render Texture is a special texture that allows any number of Game Objects to be drawn to it. You can take many complex objects and draw them all to this one texture, which can they be used as the texture for other Game Object’s. It’s a way to generate dynamic textures at run-time that are WebGL friendly and don’t invoke expensive GPU uploads.

Note that under WebGL a FrameBuffer, which is what the Render Texture uses internally, cannot be anti-aliased. This means that when drawing objects such as Shapes to a Render Texture they will appear to be drawn with no aliasing, however this is a technical limitation of WebGL. To get around it, create your shape as a texture in an art package, then draw that to the Render Texture.

https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.RenderTexture.htmlhttps://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.RenderTexture.html

Example:
https://phaser.io/examples/v3/view/game-objects/render-texture/shape-to-render-texture#

Draw on live texture:
https://phaser.io/examples/v3/view/game-objects/render-texture/draw-on-texture
