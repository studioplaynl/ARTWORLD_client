# Using MkDocs for ARTWORLD documentation

The ARTWORLD project [repository] (https://github.com/studioplaynl/ARTWORLD_client/)

[How to deploy ARTWORLD](1-implementation/How-to-deploy-artworld/)

## Why MkDocs?

Advantages:

- Auto generation of navigation based on folder structure.
- Easy theming
- Use of markdown and yml


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


[Formatting](https://squidfunk.github.io/mkdocs-material/reference/formatting/)

## Highlighting 
When Critic is enabled, Critic Markup can be used, which adds the ability to highlight suggested changes, as well as add inline comments to a document:

Text with suggested changes

Text can be {--deleted--} and replacement text {++added++}. This can also be
combined into {~~one~>a single~~} operation. {==Highlighting==} is also
possible {>>and comments can be added inline<<}.

{==

Formatting can also be applied to blocks by putting the opening and closing
tags on separate lines and adding new lines between the tags and the content.

==}

Text can be deleted and replacement text added. This can also be combined into onea single operation. Highlighting is also possible and comments can be added inline.

Formatting can also be applied to blocks by putting the opening and closing tags on separate lines and adding new lines between the tags and the content.

## Highlighting text
When Caret, Mark & Tilde are enabled, text can be highlighted with a simple syntax, which is more convenient that directly using the corresponding mark, ins and del HTML tags:

Text with highlighting

- ==This was marked==
- ^^This was inserted^^
- ~~This was deleted~~


## Sub- and superscripts
When Caret & Tilde are enabled, text can be sub- and superscripted with a simple syntax, which is more convenient than directly using the corresponding sub and sup HTML tags:

Text with sub- and superscripts

- H~2~O
- A^T^A

# [Diagrams](https://squidfunk.github.io/mkdocs-material/reference/diagrams/)


# [Data tables](https://squidfunk.github.io/mkdocs-material/reference/data-tables/)

``` py title="bubble_sort.py"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```

???+ note

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

??? note

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.

!!! info inline end "Lorem ipsum"

    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit. Nulla et euismod nulla.
    Curabitur feugiat, tortor non consequat
    finibus, justo purus auctor massa, nec
    semper lorem quam in massa.

!!! Abstract "Samenvatting"

    Dit is de samenvatting, hoe lang kan deze tekst zijn? Ik bedoel: hoe werkt de line formatting? Gaat dat vanzelf?

Ja dat gaat vanzelf!