Debug mode can help a lot during development.
It's a little weird in vanilla, as it's split into two parts.


## Limited Debug
On startup, the game checks for the presence of a file named `debug_tester.dat` in the game's directory.

This gives you two things:
- Some debug items
- Accessing the switch/variable debug menu in game via the F9 key


## Proper Debug
By launching the game with the `--debugMode=true` argument, the game better recognizes it's in debug mode.
**Note that it does not provide the benefits of `Limited Debug`**, as they're separate.

Most notably, it sets the `$debug` variable to `true` in Ruby, which you can use anywhere in scripts or the editor.
An example of that can be found in the INIT map, where it checks `$debug` and sends the player to the debug room if it's `true`.

The overall usefulness besides quick access to the debug room is up to you.

To set it up, create a file named `start_debug.bat` in the game's folder, and write one of the following lines into it, depending on the version:

Steam version:
```batch
steamshim.exe --debugMode=true
```

itch.io version:
```batch
oneshot.exe --debugMode=true
```

If you've changed the engine, then look into its documentation on how to apply debug mode, as it may have a better solution.