This page contains useful information for players, which modders should also know about.

## In Game Timer
You can enable the in game speedrun timer by adding a file named `igt.ini` next to the game's `.exe`.


## True Save Reset
1) Navigate to `%appdata%/Oneshot`
2) Delete `save.dat` and `p-settings.dat`
3) Disable cloud sync if playing the game/mod through Steam

Mods may have a different save directory, or not have a save at all.
For example:
- **Fading Memory:** `%appdata%/OSFM`, requires disabling Steam cloud sync
- **Frostide:** `%appdata%/Oneshot_frostide` 
- **Metamorphosis:** Doesn't save


## Save Issues
Some mods may use the vanilla game save directory, causing issues once the mod is uninstalled.
If launching **clean, vanilla OneShot** displays an error, follow the save reset steps, and try again.
If launching a mod displays an error, seek help from the mod's developers or community.

As a mod maker, you should set up a separate save directory for your mod, instead of saving over vanilla files.
Other than saving players who uninstalled the game from trouble, you're also saving yourself the trouble of dealing with your mod loading a vanilla save.
This will be covered in its own topic.


## Save Generator
See [[Save Generator]].


## Installing Mods
It's the same with the itch.io version, you just navigate to the game's directory yourself instead of through Steam.
![[installing_mods.mp4]]


## Uninstalling Mods
With the itch.io version, you just delete the game files and redownload them from Itch.
![[uninstalling_mods.mp4]]