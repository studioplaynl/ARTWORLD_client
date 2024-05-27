avatars are being saved as 64x64 pixels and the url gets placed in users profile under avatar.
the json file still gets saved as 2048x2048, every extra frame adds 2048 pixels to the width of the image.

So for the future:

save avatars in a storage objects and when chosen, convert to correct size and save in avatar url on profile
storage object contains:

- frames
- png url
- json url
- version

convert image function, split x and y sizing for adaptive scaling
