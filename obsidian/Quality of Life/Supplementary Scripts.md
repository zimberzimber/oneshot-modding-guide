I've ran into a lot of cases where RPG Maker was missing some functionality which I found to be almost mandatory.
Because of that, I kept adding functionality I'd want to have to make my life easier, and am now sharing some of it with you.

## Setup
Read [[Script Layer]], as this requires a very simple script change.

Save this image, name it `debug_collision.png` and move it into `Graphics/Tilesets`:
![[supplimentary_scripts_1.png]]

Create a new script, and have it load second to last, before `Main`.
Should look like this if you're doing it through the editor:
![[supplimentary_scripts_2.png]]

Then copy the contents of this code block into it:

```embed-ruby
{
	"PATH": "vault://Assets/supplimentary_scripts.rb",
	"TITLE": "Supplimentary_Scripts"
}
```