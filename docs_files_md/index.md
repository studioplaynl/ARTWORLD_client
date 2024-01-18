# Using MkDocs for ARTWORLD documentation

## Why MkDocs?

Advantages:

- Auto generation of navigation based on folder structure.
- Easy theming
- use of markdown and yml


Small gotchas:

- there is a docs_files_md folder that has the 'raw' md files and folders
- the 'docs' folder is generated bij de 'mkdocs build' command
- so editing takes place in VSCODE and not directly on Github, but this can also be seen as an advantage


Todo:

- add 'mkdocs build' to the npm run dev script

* * *

## What is in the docs?
1. Implementation: notes about the implementation of functions
2. Research notes: reminders on how to do things
3. Features: ideas for new features, logs of features that are implemented
4. Bug: found, fixing and done. Serves also as a log 

Todo:

- Feature List per Release of ARTWORLD


* * *

For full documentation visit [mkdocs.org](https://www.mkdocs.org).



## Commands

* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

## Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.




