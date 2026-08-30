This Ruby script makes preparing a distribution package easier by attempting to eliminate unmodified assets from your mod.

Technically you can use this for comparing, copying, and cleaning any two folders, but this is a OneShot modding guide.


## Setup
- Install Ruby
- Create a new text file, copy the contents from below into it, and save it with the `.rb` extension.
(e.g. `cleanup_script.rb`)


## Building the Catalogue
First, use the `Build catalogue`, where it will build some data with which is will compare your mod's files to vanilla.

You must pass it the absolute path to a **clean, vanilla OneShot** directory.
If you're unsure if your copy is clean, follow the `Uninstalling Mods` instructions in [[For Players]].

You only need to perform this action once, and if vanilla OneShot gets updated.


## Copy & Clean

Then you can have it make a copy of your mod and clean it from unmodified assets with the `Copy & clean` option.
It will create a new folder next to it named `_dist_output`, and output the results there.

```embed-ruby
{
	"PATH": "vault://Assets/cleanup_script.rb",
	"TITLE": "Cleanup Script"
}
```