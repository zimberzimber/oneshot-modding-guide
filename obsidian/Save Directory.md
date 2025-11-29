As a mod maker, you should set up a separate save directory for your mod, instead of saving over vanilla files.
Other than saving players who uninstalled the game from trouble, you're also saving yourself the trouble of dealing with your mod loading a vanilla save.

The *only* case where you wouldn't care about this, is when your mod is purely an asset swap.
No new/changed maps, dialogue, functionality, or scripts.
It's your responsibility to ensure players don't lose their data or run into trouble because of your mod.
If you think your mod doesn't need this, then ignore this page at your own risk.


## Setup
Read [[Script Layer]], as this requires a very simple script change.

Create a new script, and have it load before anything else.
Should look like this if you're doing it through the editor:
![[save_directory_1.png]]

Copy this code into it:
```embed-ruby
{
	"PATH": "vault://Assets/save_override.rb",
	"TITLE": "Save_Override"
}
```


Then inside the script, change `CHANGE_ME` to your mod's name.
To avoid any potential issues, use only numbers, underscores, and lower case English characters.
