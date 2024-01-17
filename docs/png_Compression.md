to create the best looking, smallest png files with transparency:

1-step
1. pngquant:
pngquant 64 --force  --skip-if-larger  *.png

Total reduction: 70.67%


2-step [No difference to 1-step, but documented...]
1. pngcrush

pngcrush is a PNG (Portable Network Graphics) file optimizer. It reduces the file size of the image by passing it through various compression methods and filters.

Debian/Ubuntu users can run the following command for installation.

sudo apt get install pngcrush
Users of other Linux distributions can install it using their standard installation commands followed by pngcrush.

After the installation is done, we can reduce the size of PNG file by running:

pngcrush -brute <INPUT_FILE> <OUTPUT_FILE>
Reduce Image Size Pngcrush
Reducing PNG file size
The '-brute' option takes the file through 114 filter/compression methods. The extended process consumes few seconds. Instead of applying the brute force approach, users can select filters, levels and strategies for optimization.

The types of filters and other properties can be learnt through the manual pages - man pngcrush.

-d [output dir]

Average reduction in size: 18%

2. After that reduce color with pngquant:
pngquant 64 --force  --skip-if-larger  *.png

Average reduction in size: 68.25%

Total reduction: 70.67%


