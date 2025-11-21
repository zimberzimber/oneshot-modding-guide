OneShot uses custom logic to make item combination possible.
This requires editing a script file, and a common event.

## Combination Definition
For the game to register a combination, it must be defined in the `Data_Item.` script.

A short excerpt from said script:
```ruby
module Item
	COMBINATIONS = {
		[3, 4] => 5,
		[8, 9] => 10,
		[10, 12] => 13,
	}
end
```

The logic is simple, `[item_id_1, item_id_2] => result_id`
So in case of `[ 3, 4 ] => 5`, the game will have something happen when you combine the item with ID `3`, and the item with ID `4`.
In vanilla's case, it's `alcohol` with `dry branch`.

The order doesn't matter, so you don't need `[ 4, 3 ] => 5` as well in case the player tries combining them in a different order.

It's highly suggested you leave comments in the script indicating what're the associated items and result are.

The `result_id` is a value that gets inserted into the `[0002: g New Item]` variable, which is then used in the result definition.
The variable is set to 0 instead when the player attempts an undefined combination.


## Result Definition

The `001: Use Item` common handles what happens after a combination was attempted.
Use the `[0002: g New Item]` variable that gets set after attempting to combine items.
It's plain RPG Maker XP from here.