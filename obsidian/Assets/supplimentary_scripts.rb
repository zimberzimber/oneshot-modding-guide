# This script monkeypatches some things in the vanilla scripts to enable some quality of life functionality.
# Read the documentation where you got the script from for additional information.

class Game_Event
	# Check if the event is not earased, and has any commands to execute in the current list.
	def execution_valid?()
		return !(@erased || @list.nil? || (@list.count { |c| c.code != 108 && c.code != 408 && c.code != 0 } == 0))
	end
end

class Game_Map
	# Returns an event by ID
	def event_by_id(event_id)
		return @events[event_id]
	end

	# Find the first event with the given name, returning a pair of its ID and its instance
	def event_by_name(event_name)
		return *@events.find { |id, e| e.name == event_name }
	end
end

class Interpreter
	# Trigger an event on the map by name
	# Does nothing if there's no event with that name
	# Having multiple events with the same name will trigger the one with the lowest ID
	# Unlike `start`, it follows common event behavior, where the event starts executing when it's called, and not when the current event is done
	# And unlike common events, the commands are executed within the context of the called event, instead of the context of the calling event
	def call_event(event_name)
		ev_id, ev = $game_map.event_by_name(event_name)
		return _call_event(ev)
	end


	# Same as `call_event`, but by ID instead
	def call_event_by_id(event_id)
		ev = $game_map.event_by_id(event_id)
		return _call_event(ev)
	end


	# Returns whether calling the given on map event is valid
	# Checks if the event with the name exists, and that it has commands to execute
	# While `call_event` already does that, this method allows for setup before actually calling the event
	def can_call_event(event_name)
		_, ev = $game_map.event_by_name(event_name)
		return ev && ev.execution_valid?
	end

	# Same as `can_call_event`, but by ID instead
	def can_call_event_by_id(event_id)
		ev = $game_map.event_by_id(event_id)
		return ev && ev.execution_valid?
	end

	# Get another event's self switch
	def get_others_self_switch(event_name, switch)
		id, _ = $game_map.event_by_name(event_name)
		$game_self_switches[[$game_map.map_id, id, switch]]
	end

	# Set another event's self switch
	def set_others_self_switch(event_name, switch, state)
		id, = $game_map.event_by_name(event_name)
		$game_self_switches[[$game_map.map_id, id, switch]] = !!state
		$game_map.need_refresh = true
	end

	private
	def _call_event(ev)
		# Return false if the event wasn't found, was erased, or has no commands in the list
		return false if !ev || !ev.execution_valid?

		# Copied off command_117
		@child_interpreter = Interpreter.new(@depth + 1)
		@child_interpreter.setup(ev.list, ev.id, ev.name)

		# Found and called event, return true so the caller knows it actually executed
		# Very useful in script condition commands
		return true
	end
end

module RPG
	module Cache
		class << self
			alias :_og_load_bitmap :load_bitmap

			EMPTY_BITMAP = Bitmap.new(1, 1)

			def load_bitmap(path, filename, hue = 0)
				# Return an empty bitmap for files starting with a `!` to allow placeholders that shouldn't appear in game
				return EMPTY_BITMAP if filename.start_with?("!")

				# Wrap and keep hue positive to prevent memory leaks and redundant memory usage
				hue %= 360
				hue += 360 if hue < 0
				return _og_load_bitmap(path, filename, hue)
			end
		end
	end
end

# Simplify entering proper debug mode
$debug = File.exists?("debug_tester.dat") unless $debug

# Debug specific stuff past this point
return unless $debug

class Collision_View
	TILE_OFFSET = 384
	GAME_WIDTH = 640
	GAME_HEIGHT = 480

	attr_reader :enabled

	def initialize()
		@enabled = false
	end
	
	def update()
		if Input.trigger?(Input::R)
			@enabled ? hide() : show()
	    end

		if @enabled
			@map.ox = $game_map.display_x / 4
	    	@map.oy = $game_map.display_y / 4
		end
	end

	def show()
		dispose()
		@enabled = true
		
		@vieport = Viewport.new(0, 0, GAME_WIDTH, GAME_HEIGHT)
		@vieport.z = 999

		@map = Tilemap.new(@vieport, GAME_WIDTH / 32 + 2, GAME_HEIGHT / 32 + 2)
		@map.tileset = RPG::Cache.tileset('debug_collision')
		@map.map_data = buildMapData()
		Graphics.frame_reset()
	end
	
	def hide()
		dispose()
		@enabled = false
	end

	def dispose()
		@vieport.dispose() if @vieport
		@vieport = nil
		@map = nil
	end
	
	def isEventPassable(ev)
		return true if ev.through
		return false if ev.tile_id == 0 && ev.character_name.empty?
		return false if $game_map.passages[ev.tile_id] & 0x0f == 0x0f
		return false unless ev.character_name.empty?

		return true
	end
	
	DIRS = [
		2, # DOWN
		4, # Left
		6, # Right
		8  # UP
	]

	def buildMapData()
		# Temporarily move the player out of the way as to not interfere with collision checks
		px, py = $game_player.x, $game_player.y
		$game_player.x = -1
		$game_player.y = -1

		map_data = Table.new($game_map.width, $game_map.height)

		$game_map.width.times do |x|
	    	$game_map.height.times do |y|
				flag = 0
				DIRS.each do |dir|
					flag += 1 << (dir / 2 - 1) unless $game_player.passable?(x, y, dir)
				end
				
				map_data[x, y] = TILE_OFFSET + flag if flag > 0
	      	end
	    end

		# Put the player back
		$game_player.x = px
		$game_player.y = py

		return map_data
	end
end

$collision_view = Collision_View.new()

class Scene_Map
	alias :_og_transfer_player :transfer_player
	def transfer_player()
		$collision_view.hide()
		_og_transfer_player()
	end
end

class Spriteset_Map
	alias :_og_update :update
	def update()
		_og_update()
		$collision_view.update()
	end
end

class Game_Player
	alias :_og_passable? :passable?

	def passable?(x, y, d)
		return true if Input.press?(Input::CANCEL)
		return _og_passable?(x, y, d)
	end
end

module Graphics
	@@game_modification_time = File.stat("Data/Actors.rxdata").mtime

	class << self
		alias :_og_update :update

		def update()
        	if File.stat("Data/Actors.rxdata").mtime != @@game_modification_time && $scene.class == Scene_Map
        		sleep(0.1) # to give rmxp a chance to save the file properly
				
        		$data_actors = load_data("Data/Actors.rxdata")
        		$data_items = load_data("Data/Items.rxdata")
        		$data_armors = load_data("Data/Armors.rxdata")
        		$data_animations = load_data("Data/Animations.rxdata")
        		$data_tilesets = load_data("Data/Tilesets.rxdata")
        		$data_common_events = load_data("Data/CommonEvents.rxdata")
				
        		RPG::Cache.clear()
        		$game_map.setup($game_map.map_id)
        		$scene = Scene_Map.new()
        		$game_player.center($game_player.x, $game_player.y)
        		@@game_modification_time = File.stat("Data/Actors.rxdata").mtime
        	end

        	_og_update()
		end
	end
end