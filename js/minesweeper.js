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
var CSS_side_borders = 2; // 1 px dx + 1 px sx
var CSS = {
	side_borders:2,
	content_innerWidth:0, // This is not a default value
	};

/**
 * jQuery elements
 */
var field;
var field_el;
var field_el_tappable;

/**
 * Global vars
 */
var game; // [x][y] = [is_bomb : boolean, type: int];
var game_max_x;
var game_max_y;
var game_flags;
var game_bombs;
var TYPE = {DEFAULT:0, NOTHING:1, FLAGGED:2};

function new_game(bombs, Nx) {
	GUI_clear_table();
	set_bombs(bombs);
	return game_prepare(Nx);
}
function ask_new_game() {
	$.mobile.navigate("#page-start-new-game");
}
function game_prepare(Nx) {
	game = new Array();
	var candidates = new Array();
	set_flags_counter(0);
	create_field_from_Nx(Nx);
	for(var i=0; i<game_max_x; i++) {
		game[i] = new Array();
		for(var j=0; j<game_max_y; j++) {
			game[i][j] = {is_bomb:false, type:TYPE.DEFAULT}; // Reset game
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
	return float2int(CSS.content_innerWidth / side);
}
function get_Ny_from_side(side) {
	var less = $("div#header").innerHeight() + $("div#footer").innerHeight(); // Menù prima o dopo del campo di gioco
	return float2int((window.innerHeight - less) / side);
}
function set_bombs(n) {
	game_bombs = n;
	$(".bombs-counter").text(n);
}
function set_flags_counter(n) {
	game_flags = n;
	$(".flags-counter").text(n);
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
			case TYPE.DEFAULT:
				GUI_print_number(x, y);
				break;
			case TYPE.FLAGGED:
				// Toast notification
				break;
			default:
				// There is a flag or there is nothing. First user have to remove the flag
		}
	}
}
function user_set_flag(x, y) {
	switch(game[x][y].type) {
		case TYPE.DEFAULT:
			game[x][y].type = TYPE.FLAGGED;
			increase_flags_counter();
			GUI_set_flag(x, y);
			break;
		case TYPE.FLAGGED:
			game[x][y].type = TYPE.DEFAULT;
			decrease_flags_counter();
			GUI_set_reset(x, y);
			break;
	}
}
function set_nothing(x, y) {
	game[x][y].type = TYPE.NOTHING;
	GUI_set_nothing(x, y);
}

/**
 * GUI functions
 */
function GUI_print_number(x, y) {
	alert("Set nothing "+x+" " + y);
	set_nothing(x, y);
	var near = 0;
	var rounds = get_rounds(x, y);
	for(var i=0; i<8; i++) {
		var xx = rounds[i][0];
		var yy = rounds[i][1];
		if(is_bomb(xx, yy)) {
			near++;
		} else if(have_sense(xx, yy) && game[xx][yy].type != TYPE.NOTHING) {
			GUI_set_nothing(xx, yy);
			GUI_print_number(xx, yy);
		}
	}

	if(!near) {
		near = " ";
	}
	GUI_get_element(x, y).text(near);
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
	GUI_get_element(x, y).css("background", "green").attr("disabled", "disabled");
}
function GUI_set_reset(x, y) {
	GUI_get_element(x, y).css("background", "grey");
}
function GUI_set_side(side) {
	field_el.width(side - CSS.side_borders);
	field_el.height(side - CSS.side_borders);
	field_el.css("maxWidth", (side - CSS.side_borders) + "px");
	field_el.css("maxHeight", (side - CSS.side_borders) + "px");
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
