/**
 * Terminology:
 * 	N:         N° of <td> per row / N° of <tr> per culumn
 *	side:      pixel of every <td>
 *	field:     the table
 */

/**
 * Array index legend:
 * 	0: x
 *	1: y
 *
 * Game type legend:
 *	2: Flagged
 * 	1: Nothing
 *	0: Default
 */

/**
 * DOM elements
 */
var field_name = "table";
var field_el_name = "table td";
var field_el_tappable_name = "table td button";

/**
 * CSS properties
 */
var CSS_side_borders = 2; // px

/**
 * jQuery elements
 */
var field;
var field_el;
var field_el_tappable;

/**
 * Global vars
 */
var game = new Array(); // [x][y] = [is_bomb : boolean, type: int];
var game_max_x;
var game_max_y;
var game_flags;
var game_bombs;

function new_game(bombs, Nx) {
	GUI_clear_table();
	set_bombs(bombs);
	if(!game_prepare(Nx)) {
		return false;
	}

	return true;
}

function ask_new_game() {
	// ******************************************************
}

function game_prepare(Nx) {
	game = new Array();
	var candidates = new Array();
	set_flags_counter(0);
	create_field_from_Nx(Nx);
	for(var i=0; i<game_max_x; i++) {
		game[i] = new Array();
		for(var j=0; j<game_max_y; j++) {
			game[i][j] = {is_bomb:false, type:0}; // Reset game
			candidates.push(new Array(i, j));
		}
	}
	if(game_bombs >= candidates.length) {
		return false; // There are more bombs than elements
	}
	candidates = shuffle(candidates);
	for(var i=0; i<game_bombs; i++) {
		game[ candidates[i][0] ][ candidates[i][1] ].is_bomb = true; // Element elected as bomb
	}
	return true;
}

function create_field_from_Nx(Nx) {
	var side = float2int(window.innerWidth / Nx);
	create_field_from_side(side);
}

function create_field_from_side(side) {
	var table = "";
	game_max_x = get_Nx_from_side(side);
	game_max_y = get_Ny_from_side(side);
	for(var i=0; i<game_max_y; i++) {
		table += "<tr>";
		for(var j=0; j<game_max_x; j++) {
			table += "<td><button></button></td>";
		}
		table += "</tr>";
	}
	field.html(table);
	field_el = $(field_el_name);
	field_el_tappable = $(field_el_tappable_name);

	// Bind clicks
	field_el_tappable.bind("taphold", function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		user_set_flag(x, y);
	});

	// Tap
	field_el_tappable.click(function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		user_set_bomb(x, y);
	});

	GUI_set_side(side);
}

function get_Nx_from_side(side) {
	return float2int(window.innerWidth / side);
}

function get_Ny_from_side(side) {
	var less = $("div#navigation").innerHeight() + $("div#footer").innerHeight(); // Menù prima o dopo del campo di gioco
	return float2int((window.innerHeight - less) / side);
}
function set_bombs(n) {
	game_bombs = n;
	$(".bombs-counter").html(n);
}
function set_flags_counter(n) {
	game_flags = n;
	$(".flags-counter").html(n);
}
function increase_flags_counter() {
	set_flags_counter(game_flags + 1);
}
function decrease_flags_counter() {
	set_flags_counter(game_flags - 1);
}
function have_sense(x, y) {
	return x>=0 && y>=0 && x<game_max_x && y<game_max_y;
}
function is_bomb(x, y) {
	if(!have_sense(x, y)) {
		return false; // Can't be a bomb. It's out of field
	}
	return game[x][y].is_bomb;
}
function get_rounds(x, y) {
	return [
		[x-1, y-1], // Up left
		[x-1, y  ], // Left
		[x-1, y+1], // Down left
		[x  , y-1], // Up
		[x+1, y-1], // Up right
		[x+1, y  ], // Right
		[x+1, y+1], // Down right
		[x  , y+1] // Down
	];
}
function user_set_bomb(x, y) {
	if(game[x][y].is_bomb) {
		GUI_set_bomb(x, y);
		alert("You lose.");
		ask_new_game();
	} else {
		switch(game[x][y].type) {
			case 0:
				GUI_print_number(x, y);
				break;
			default:
				// There is a flag or there is nothing. First user have to remove the flag
		}
	}
}
function user_set_flag(x, y) {
	switch(game[x][y].type) {
		case 0:
			game[x][y].type = 2;
			increase_flags_counter();
			GUI_set_flag(x, y);
			break;
		case 2:
			game[x][y].type = 0;
			decrease_flags_counter();
			GUI_set_reset(x, y);
			break;
	}
}

/**
 * GUI functions
 */
function GUI_print_number(x, y) {
	GUI_set_nothing(x, y);
	var near = 0;
	var rounds = get_rounds(x, y);
	for(var i=0; i<8; i++) {
		if(is_bomb(rounds[i][0], rounds[i][1])) {
			near++;
		}
	}

	// No bomb? All => nothing
	if(!near) {
		near = " ";
		for(var i=0; i<8; i++) {
			if(have_sense(rounds[i][0], rounds[i][1])) {
				GUI_set_nothing(rounds[i][0], rounds[i][1]);
			}
		}
	}
	GUI_get_element(x, y).html(near);
}
function GUI_get_element(x, y) {
	return $("tr").eq(y).find("td button").eq(x);
}
function GUI_get_x(element) {
	var s = $(element).parent();
	return $(s).parent().children().index($(s));
}
function GUI_get_y(element) {
	var s = $(element).parent();
	return $(s).parent().parent().children().index($(s).parent());
}
function GUI_set_flag(x, y) {
	GUI_get_element(x, y).css("background", "yellow");
}
function GUI_set_bomb(x, y) {
	GUI_get_element(x, y).css("background", "red");
}
function GUI_set_nothing(x, y) {
	GUI_get_element(x, y).css("background", "green");
}
function GUI_set_reset(x, y) {
	GUI_get_element(x, y).css("background", "none");
}
function GUI_set_side(side) {
	field_el.width(side - CSS_side_borders);
	field_el.height(side - CSS_side_borders);
	field_el.css("maxWidth", (side - CSS_side_borders) + "px");
	field_el.css("maxHeight", (side - CSS_side_borders) + "px");
}
function GUI_clear_table() {
	field.empty();
}

/**
 * Basically functions
 */
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o) { //v1.0
	for(var j, x, i=o.length; i; j=Math.floor(Math.random() * i), x=o[--i], o[i]=o[j], o[j]=x);
	return o;
}
function float2int(value) {
	return value | 0;
}
