Working with multiple people can be hard if your only means of synchronizing the mod between the team members is sending .zip files through Discord, which is why I highly suggest you use a source control system like git.

If you know what it is, you should still keep the final part of this page in mind.

-----
## Don't know what that is?
That's fine.

To keep it simple, it's a system that tracks changes in a project, and can synchronize it between multiple people.

Look up a tutorial on how to use Github, it's friendly to new users.
And once you've set up your repository, make sure to make it `private` do avoid leaking your WIP content, or publishing assets you do not own under your name.

-----
## Do solo developers need this?

## I don't need all of this, they're only sending me assets to include in the mod

It still helps you keep track of changes, and allows you to maintain a backup in case something happens to your PC if you're using something like Github.


----
## It's too complicated...

Then don't use it.


-----
## Integration with RPG Maker

Since RPG Maker packs all of its data into Ruby marshal that's stored in the `.rxdata` files, git will not be able to compare or diff the changes.
In addition, even minor changes in the editor may modify about 10 files.

This means you must be ***VERY CAREFUL*** with who and when is making changes to avoid conflicts, as you cannot resolve them by merging the differences like with a text file, and will be forced to take one of them, without a clear indicator of what changes you might have discarded.

Either coordinate your modifications, or have a single member do all the RPG Maker work.

But when you do run into those conflict, you can use [[RMXP Extractor]] to resolve them manually.