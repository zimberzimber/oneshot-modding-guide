This article covers some critical information about distributing your mod.
It does not cover *how* to distribute the mod, as it is platform dependent.


## Make a backup
I suggest making a copy of your entire project's folder and working on that.
Will prevent you from accidentally making unwanted changes in your development folder, and keep it as a backup in case you mess something up.


## Packing Scripts
You should pack all your scripts into a single file when working with extracted scripts.

For that, use the import feature from [[RMXP Extractor]].
Delete the extracted JSON files first 

**Once you're ready to release your mod**, you should pack the scripts up into a single file via [[RMXP Extractor]], instead of distributing the scripts as is.


## Cleanup
Since you're distributing a mod, it is **your responsibility** to ensure it still requires owning the 2016 release of OneShot to play.
You cannot distribute a copy of the game.
Because of that, you must clean the distribution to only include new and/or modified files.

It may be impossible to keep track of changes/additions, so I've [written a tool](https://github.com/zimberzimber/oneshot-mod-util) that compares your project to a vanilla game, and does the heavy lifting for you.
#TODO: Improve the tool's repository, see if it still works, state that the tool is not responsible 

***Distributed files are your responsibility.***
The tool only makes the job easier.
And it's important you go over the files you intend to distribute to ensure there's nothing you wouldn't want to distribute, like that copyrighted music piece you've used as a placeholder during development.


## Test It
Redownload a clean copy of vanilla OneShot, install the mod on it, and see that it functions properly.
