Eg a list of images to show in the billBoards, eg a rotating selection of liked images of the player.

1. create an array of liked images in the array **scene.AbriImages**
2. A if the key doesn't exist: Download the image
2. B if the image can't be downloaded, skip the item, remove it from the array
3. create an array with the image keys and sizes