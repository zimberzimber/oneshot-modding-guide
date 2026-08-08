RPG Maker saves its data as [Ruby marshal](https://ruby-doc.org/core-2.6.8/Marshal.html), which is not very friendly to anything but Ruby, making it frustrating to work with beyond what the RPG Maker editor allows.
[RPG Tool](https://github.com/melody-rs/rpgtool) is a program designed to convert this marshal into plaintext formats like JSON and vice versa, opening a lot of options RPG Maker doesn't provide on its own.

The article will be using JSON for explanations, but you can use any other text format.


## I'm not a programmer, is it still useful?
Depends on how familiar you are with formats like JSON.
You don't need to be a programmer for that, it's just text describing data, although in a complex manner.

If this is all too alien for you, I suggest you at least try using it, but only when you must.

---

## What can I do with it?

### Extracting and Packing Scripts
Extract the scripts so you can use an IDE instead of editing scripts through RPG Maker's awful script editor.
Pack them back up after you're done editing or for release.
Read [[Modifying Scripts]] for more details.

#### Searching
Some things can be impossible to find in your project, a few examples being:
- Where a certain switch/variable is set/used
- Some piece of dialogue
- Where a sprite or sound effect is used

By converting to JSON, you can use tools and techniques that work with plain text to find what you're looking for.
See [[Searching]] for more details.

#### Comparing Changes / Resolving Conflicts
If you have multiple people working in the editor, you'll sooner or later run into conflicts, and will have a hard time comparing the differences.
Converting to JSON allows you to compare them with any diff tool.

#### Mass Edits
Renamed a character?
Convert to JSON, use `find and replace` function in your text editor of choice, then convert back to RPG 

#### Anything you can do with data
In the end it's just data.
Throw it in a database, put it through an ETL pipeline, apply some machine learning, and create your very own OneShot based world machine.

---

## Setup
1) Go to your mod's folder
2) [Download the release for your OS](https://github.com/melody-rs/rpgtool/releases) into it
3) Create a file named `rmxp_export.bat`, and add this line to it:
```powershell
rpgtool.exe structured --format marshal json ./Data ./Data_JSON rpgxp
```
4) Create a file named `rmxp_import.bat`, and add this line to it:
```powershell
rpgtool.exe structured --format json marshal ./Data_JSON ./Data rpgxp
```
5) Create a file named `rmxp_unpack_scripts.bat`, and add this line to it:
```powershell
rpgtool.exe unpack ./Data/xScripts.rxdata ./Scripts
```
6) Create a file named `rmxp_pack_scripts.bat`, and add this line to it:
```powershell
rpgtool.exe pack ./Scripts ./Data/xScripts.rxdata
```


---

## Usage

- `rmxp_export.bat` converts RPG Maker data to JSON, and puts it in the `Data_JSON` folder
- `rmxp_import.bat` converts JSON from `Data_JSON` back into RPG Maker data
- `rmxp_unpack_scripts.bat` unpacks the scripts in `xScripts.rxdata` into the `Scripts` folder
- `rmxp_pack_scripts.bat` packs scripts from the `Scripts` folder back into `xScripts.rxdata`


---

## Keep in Mind!
Exporting data/scripts **only creates a copy of the data in a different format!**
This means that any changes you make in the exported data/scripts will not apply to the game itself.

Importing data/scripts back will **override whatever changes you made in editor!**
This means that if you export data, make changes in editor, then import back, will undo the changes you made between the export and the import.

**The inverse is true as well.**
Exporting data, making changes in it, then making changes in editor, then exporting again, will undo your changes in the exported data.

Whatever you do, **always test your changes, and keep backups when you can.**
Using a version control tool like git helps a lot as you can undo changes.