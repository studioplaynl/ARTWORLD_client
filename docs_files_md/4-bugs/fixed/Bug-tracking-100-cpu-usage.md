---
title: 'Log: bug tracking 100% CPU usage'
date: '2022-12-22'
---

Solution: graphics shouldn't be bigger then 1024x1024. For a gradient background the solution is quite easy: make a 1024 square image and scale it up to the appropriate size.

For the dotted background: create a tilemap with the dot as a tile.

---

100% CPU, also on older branch from july 2022

---

disabling:

```
      fixedStep: true,
      fps: 60,
```

No change

---

Changing the world size to 1000x1000 from 6000x6000 dramatically reduces CPU usage

---

Investigate further: is it maybe the input feel within the big world. So make the world 6000x6000 again but disable input graphic

disable handlePlayerMovement() in artworld.js but keep it big: again 100% CPU

---

## Test where the limit of the world size is

2000 x 2000

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-16-58-44-1024x41.png)

---

3000 x 3000

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-00-17.png)

---

4000 x 4000

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-01-30.png)

---

5000 x 5000

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-02-56.png)

---

6000 x 6000

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-04-35.png)

---

So setting a max of 2000 x 2000 for the world (effectively reducing it with factor 3) will increase performance dramatically.

All assets have to be loaded 3x times smaller

And the x and y also needs to be divided by 3.

---

## Further investigation: disabling the big background and the input graphic

6000 x 6000

No background with dots, and no input graphic

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-29-38.png)

---

6000 x 6000

No background, with input graphic

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-17-31-52.png)

The input graphic seems ok, because it is not visible, so it is not rendered.

---

When I turn off the dots but keep the white background:

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-18-05-29.png)

With the dots the CPU is very high. I didn't expect that, as the dots are small images that are repeated many times

---

when the background is a big rectangle:

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-22-18-06-01.png)

---

Optimizing worlds and backgrounds: tilemaps

create tilemaps on the fly

[https://labs.phaser.io/edit.html?src=src\\tilemap\\put%20tiles.js](https://labs.phaser.io/edit.html?src=src\tilemap\put%20tiles.js)

```
// Creating a blank tilemap with the specified dimensions
map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 25, height: 20});
var tiles = map.addTilesetImage('tiles');

var layer = map.createBlankLayer('layer1', tiles);
layer.setScale(2);

// Add a simple scene with some random element
layer.fill(58, 0, 13, 25, 1); // Surface of the water
layer.fill(77, 0, 14, 25, 5); // Body of the water
layer.randomize(0, 0, 25, 13, [ 44, 45, 46, 47, 48 ]); // Wall above the water
```

```
 switch (objectToPlace) {
            case 'flower':
                // You can place an individal tile by index (or by passing in a Tile object)
                map.putTileAt(15, pointerTileX, pointerTileY);
                break;
            case 'platform':
                // You can place a row of tile indexes at a location
                map.putTilesAt([ 104, 105, 106, 107 ], pointerTileX, pointerTileY);
                break;
            case 'tiki':
                // You can also place a 2D array of tiles at a location
                map.putTilesAt([
                    [ 49, 50 ],
                    [ 51, 52 ]
                ], pointerTileX, pointerTileY);
                break;
            default:
                break;
        }
```

To make a background with this method, would be:

1. create an image you want to repeat

2. create an empty tilemap with the dimensions of the image

3. create a layer in the map

4. layer.fill to fill the map with images

---

tilemaps with arrays

[https://labs.phaser.io/edit.html?src=src\\tilemap\\create%20from%20array.js](https://labs.phaser.io/edit.html?src=src\tilemap\create%20from%20array.js)

---

All TileMap examples

[https://labs.phaser.io/index.html?dir=tilemap/&q=](https://labs.phaser.io/index.html?dir=tilemap/&q=)

---

All the graphic elements where also a big problem: all the Houses had hit targets, name plates etc with graphics. So I refactored them to use prerendered images:

To change to an image:

base size rect: 256pix

- enterArea (rectangle) - invisible

- debugRectXMargin (rect) - color1 0x7300ED

- debugRect(rect) - color2 - 0xE8E8E8

- namePlate (roundRect) - grey/beige 0xE8E8E8  
   .fillRoundedRect(  
   // 0 - (locationDescription.width + namePlateMargin) / 2,  
   // width / 2 - textPlateOffset,  
   // locationDescription.width + namePlateMargin, // text's width + 10 (to have space between border and text)  
   // namePlateMargin \* 2,  
   // 10,  
   // ).setDepth(31);

baseSize Circle: 64

- numberBubble (circle) - grey/beige 0xE8E8E8

- entershadow (circle) - purple 0x7300ED

greyCircle_64  
purpleCircle_64  
greySquare_264  
purpleSquare_264

---

On Android devices there is now still a crash: the big backgrounds still cause a problem. So try: make an 1024 x 1024 image and then scale that to the appropriate size. This works!

This is the best solution for gradient backGrounds

---
