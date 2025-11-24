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

	private
	def _call_event(event)
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

module Script
	# Get another event's self switch
	def get_others_self_switch(event_name, switch)
		id, _ = $game_map.event_by_name(event_name)
		$game_self_switches[[$game_map.map_id, id, switch]]
	end

	# Set another event's self switch
	def set_others_self_switch(event_name, switch, state)
		id, = $game_map.event_by_name(event_name)
		$game_self_switches[[$game_map.map_id, id, switch]] = !!state
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