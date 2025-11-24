RMXP Extractor is a Ruby gem which can export/import RPG Maker XP data to/from a more standard data format like JSON.
[Source code](https://github.com/melody-rs/RMXP-Extractor)

I cannot overstate just how much headache it has spared me from, but I can tell you what I've used it for so far:
- Extracting/Packing scripts
- Plain text searching 
- Comparing changes
- Resolving merge conflicts
- Mass edits
- Importing the data into MongoDB for shits and giggles

When collaborating, it may be worth setting up your source control to track exported data while ignoring the `.rxdata` files themselves.
I've not tried this myself though, but it sounds like it'd save even more headache, at the cost of taking some getting used to.


## I'm not a programmer, is it still useful?
It can be, depending on whether or not you can read JSON or YAML.
You don't need to be a programmer for that, they're just text formats describing data in a readable manner.
See the examples section at the end of this document.


---
## Setup
1) Download and install Ruby.
2) Open a terminal/console, and execute `gem install rmxp_extractor`
3) Go to your OneShot directory
4) Create a file named `extract.bat`, and add this line to it:
```batch
rmxp_extractor export json scripts
```
5) Create a file named `import.bat`, and add this line to it:
```batch
rmxp_extractor import json scripts
```

You only need to repeat `1)` and `2)` once per system, the rest are to be repeated per project.


---
## Exporting
Now every time you run `extract.bat`, it should create two folders next to it:
- `Data_JSON`, which contains all the `.rxdata` in a JSON format.
- `Scripts`, which contains all the Ruby scripts extracted from `Scripts.rxdata`

Keep in mind that modifying the extracted content will have no effect on the game, it's simply a copy in a different format.


---
## Importing
If you've made changes to the extracted content which you do want in the game, you can perform the inverse operation to pack the data back up into `.rxdata` for the game.

Running `import.bat` will pack all the exported data from `Data_JSON` and `Scripts`.

I **HIGHLY** suggest you only do this if know what you're doing, because you *can* lose data if you're not careful.

Since it will override data with what was exported, doing something like exporting data, making changes in the editor, then importing data, will lose everything you've done between the export and the import.

#TODO: There's a bug in the `import` command that doesn't pack up script commands properly. look into it.


---
## Some Examples

Here's a short example for how to search for text in the game:
#TODO
Keep in mind that each text line in the editor is a separate command

This can technically be used to find anything, but it can get complicated depending on what you're searching for.

I *may* make a tool that would help looking for common things, but don't count on it.