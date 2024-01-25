Making a new world:

1. CHECK THAT nakama.js is SET TO ARTWORLD SERVER!! on the register page it is visible on which server you are
1.  making a new scene file
1. change the names inside the scene file
1. adding the scene to the constans.js file
1. make assets smaller (compress)
   a. jpeg for the background: 5000x5000pix, jpeg quality 60%, aim is 1.3Mb file size max.
   b. run the png [script for pngs](1-implementation/PNG-Compression-percentages/)
1. make assets folder (world_xxx) in public>assets and place assets in folder
1. put assets in world
1. correct the keys for the assets in the scene file
1. correct portal to artworld with gameEdit mode
1. correct position of portal in artworld with gameEdit mode
1. a. adding the scene to the gameconfig.js file
   b. make QR codes with the right nakama server
   c. paste users in google sheet
   d. save QR images
   e. load QR sheets with 24 images
1. place all houses in world with gameEdit mode, save with U key (nakama.js must be set to ARTWORLD otherwise the data is not saved in the right database!)
1. push new code to github
1. deploy new code to server