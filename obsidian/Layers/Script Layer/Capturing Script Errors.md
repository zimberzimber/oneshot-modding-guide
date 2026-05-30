In vanilla, all but the "file not found" errors raised by scripts will just kill the game without telling you why.
That is because the `Main` script which runs the game only attempts rescuing `Errno::ENOENT`:
```ruby
begin
  # ...
rescue Errno::ENOENT
  # Supplement Errno::ENOENT exception
  # If unable to open file, display message and end
  filename = $!.message.sub("No such file or directory - ", "")
  print("Unable to find file #{filename}.")
end
```

To capture all other errors, you must add another `rescue` to the chain for `NoMemoryError, ScriptError, StandardError` to capture everything else.
And since those errors would capture `Errno::ENOENT` as well, we can remove that block:
```ruby
begin
  # ...
rescue NoMemoryError, ScriptError, StandardError => error
  print("> #{error.class} - #{error.message}\n\n#{error.backtrace.join("\n")}")
end
```

It's a good idea to write the error to a file, so that it can be easily read, and makes it easier for players to forward the error to the developer.
In addition to that, the `print` function displays a blank dialogue box instead of indicating there's an issue for some unfathomable reason, so writing to a file deals with that as well.

This will always write the error to the `error.log` file, which can be opened with any text editor (like notepad), and let the user know if the error was too long to display:
```ruby
begin
  # ...
rescue NoMemoryError, ScriptError, StandardError => error
  str = "> #{error.class} - #{error.message}\n\n#{error.backtrace.join("\n")}"
  File.write("error.log", str)

  str = "Error too long to display - See `error.log` for details." if str.length > 2000
  print(str)
end
```

You may also want to add an `ensure` block to perform actions that should happen regardless of whether the was closed or errored out:
```ruby
begin
  # ...
rescue NoMemoryError, ScriptError, StandardError => error
  # ...
ensure
  # Actions to perform when the game is shutting down
end
```


## IMPORTANT
**Errors may potentially contain personally identifiable information!**
Example case: the game failed reading a file that doesn't exist in the save directory on Windows, which has the username in the path, which may be the user's full name. 

It is your responsibility as the mod maker to handle it appropriately.


## Full Modified Vanilla `main` Example:
```ruby
#==============================================================================
# ** Main
#------------------------------------------------------------------------------
#  After defining each class, actual processing begins here.
#==============================================================================

at_exit do
  Wallpaper.reset
  save unless $game_switches[99] || ($game_system.map_interpreter.running? || !$scene.is_a?(Scene_Map))
end

begin
  $console = Graphics.fullscreen
  Graphics.frame_rate = 60
  Font.default_size = 20

  # Load persistent data
  Persistent.load

  # Prepare for transition
  Graphics.freeze
  $demo = false
  $GDC = false
  # Make scene object (title screen)
  $scene = Scene_Title.new
  Oneshot.allow_exit false
  Oneshot.exiting false

#  x = Oneshot.textinput("Foo Bar")
#  print("#{x}")

  # Call main method as long as $scene is effective
  while $scene != nil
    $scene.main
  end
rescue NoMemoryError, ScriptError, StandardError => error
  str = "> #{error.class} - #{error.message}\n\n#{error.backtrace.join("\n")}"
  File.write("error.log", str)

  str = "Error too long to display - See `error.log` for details." if str.length > 2000
  print(str)
ensure
  Oneshot.exiting true
  Graphics.transition(20) unless $debug
  Journal.set "" if Journal.active?
  Oneshot.allow_exit true
end
```