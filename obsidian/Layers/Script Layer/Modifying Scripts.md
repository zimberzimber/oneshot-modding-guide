The game handles scripts in a slightly different way.
While the editors uses the `/Data/Scripts.rxdata` file, the game itself reads the `/Data/xScripts.rxdata` file.
Don't ask why.

Depending on your approach to scripting, you must take a few steps...

So for the game to load your updated scripts, you must save your changes, delete `xScripts.rxdata`, make a copy of `Scripts.rxdata`, and rename it to `xScripts.rxdata`.


## Scripting via RPG Maker Script Editor

While suboptimal, annoying, and terrible for source control, the setup doesn't require any additional tools besides RPG Maker.
You can use this method if you don't intend to delve into scripting too often, like only doing the minor script changes required for some of the [[Editor Layer]] parts.

Initially, you will not see the scripts in RPG Maker's script editor.
Here's what you must do:
- Go to the `Data` folder
- Delete `Scripts.rxdata`
- Make a copy of `xScripts.rxdata`
- Rename the copy to `Scripts.rxdata`
- Close the editor if it was open

Next time you open the script editor, you'll see all the scripts.

Now, every modification you make to the scripts **will not automatically apply to the game.**
For the game to see the changes, you must follow these steps **every time you want to apply changes**:
- Save the project
- Go to the `Data` folder
- Delete `xScripts.rxdata`
- Make a copy of `Scripts.rxdata`
- Rename the copy to `xScripts.rxdata`
- Relaunch the game if it was open

Next time the game launches, it will have your modified scripts.

You don't need to worry about packing your scripts with this method.


## Scripting the Right Way
While more advanced, this setup is one and done, but requires some additional tools and packing the scripts for releases.

Use the [[RMXP Extractor]] to extract the scripts, which will create the `scripts` folder with the extracted script files, and a `_scripts.txt` file.

Then set this as the only RPG Maker script via the editor:
```embed-ruby
PATH: "vault://Assets/main_override.rb"
TITLE: "Main"
```

This will read the `_scripts.txt` file to determine which files are to load from the `scripts` folder, and in what order.

Now you can read, modify, and create new scripts with your favorite text editing program, instead of being forced to suffer RPG Maker's awful script editor.
Just make sure you save your changes and relaunch the game for them to take effect.

Any time you add a new script, you must include it in `_scripts.txt`, and make sure it loads after its dependencies, but after whatever it's a dependency for.