/**
 * CSS settings
 */
var CSS = {
	side_borders:2,
	content_innerWidth:0, // This is not a default value
};

/**
 * DOM settings
 */
var MINESWEEPER = {
	FIELD:"table",
	SINGLE_CELL:"table td",
	SINGLE_CELL_TAPPABLE:"table td button"
};

/**
 * Global jQuery vars
 */
var field;
var field_el;
var field_el_tappable;

/**
 * Global constants
 */
var TYPE = {
	DEFAULT:0,
	NOTHING:1,
	FLAGGED:2,
	BOMB:3,
};

/**
 * Global vars
 */
var game; // game[x][y] = {is_bomb: boolean, type: int [, n_near_bombs: int]}
var game_max_x;
var game_max_y;
var game_flags;
var game_bombs;

/**
 * Game functions
 */
function ask_new_game() {
	$.mobile.navigate("#page-start-new-game");
}
function new_game(bombs, Nx) {
	GUI_clear_table();
	set_bombs(bombs);
	return game_prepare(Nx);
}
function game_prepare(Nx) {
	var candidates = new Array();
	game = new Array();
	create_field_from_Nx(Nx);
	for(var x=0; x<game_max_x; x++) {
		game[x] = new Array();
		for(var y=0; y<game_max_y; y++) {
			game[x][y] = {is_bomb:false, type:TYPE.DEFAULT}; // Reset game
			candidates.push( new Array(x, y) );
		}
	}
	if(game_bombs >= candidates.length) {
		return false; // There are more bombs than cells
	}
	candidates = shuffle(candidates);
	for(var i=0; i<game_bombs; i++) {
		game[ candidates[i][0] ][ candidates[i][1] ].is_bomb = true; // Element elected as bomb
	}
	// Set near bombs
	for(var x=0; x<game_max_x; x++) {
		for(var y=0; y<game_max_y; y++) {
			if(!game[x][y].is_bomb) {
				game[x][y].n_near_bombs = get_n_near_bombs(x, y);
			}
		}
	}
	set_flags_counter(0);
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
	for(var y=0; y<game_max_y; y++) {
		table += "<tr>";
		for(var x=0; x<game_max_x; x++) {
			table += "<td><button></button></td>";
		}
		table += "</tr>";
	}
	field.html(table);
	field_el = $(MINESWEEPER.SINGLE_CELL);
	field_el_tappable = $(MINESWEEPER.SINGLE_CELL_TAPPABLE);

	// Tap and taphold
	field_el_tappable.on('tap', function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		user_set_bomb(x, y);
	}).on('taphold', function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		user_set_flag(x, y);
	});	

	GUI_set_side(side);
}
function get_Nx_from_side(side) {
	return float2int(CSS.content_innerWidth / side);
}
function get_Ny_from_side(side) {
	var less = $("div#header").innerHeight() + $("div#footer").innerHeight(); // BUT PADDING/BORDER/MARGIN???
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
		return false; // Can't be a bomb: it's out of field
	}
	return game[x][y].is_bomb;
}
function get_cell_round(x, y) {
	return [
		[x-1, y-1], // Up left
		[x-1, y  ], // Left
		[x-1, y+1], // Down left
		[x  , y-1], // Up
		[x+1, y-1], // Up right
		[x+1, y  ], // Right
		[x+1, y+1], // Down right
		[x  , y+1]  // Down
	];
}
function user_set_bomb(x, y) {
	switch(game[x][y].type) {
		case TYPE.DEFAULT:
			if(game[x][y].is_bomb) {
				GUI_set_bomb(x, y);
				game[x][y].type = TYPE.BOMB;
				alert("You lose\n:(");
				ask_new_game();
			} else if(game[x][y].n_near_bombs) {
				set_nothing(x, y, game[x][y].n_near_bombs);
			} else {
				reveal_nothing(x, y);
			}
			break;
		case TYPE.FLAGGED:
			console.log("It's flagged. First remove flag!");
			break;
		default:
			// There is a flag or there is nothing. First user have to remove the flag
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
function set_nothing(x, y, n) {
	game[x][y].type = TYPE.NOTHING;
	GUI_get_element(x, y).css("background", "green").attr("disabled", "disabled");
	GUI_get_element(x, y).text(
		((n) ? n : " ")
	);
}
function have_near_bombs(x, y) {
	var cell_round = get_cell_round(x, y);
	for(var i=0; i<8; i++) {
		if(is_bomb(cell_round[i][0], cell_round[i][1])) {
			return true;
		}
	}
	return false;
}
function get_near_bombs(x, y) {
	var near_bombs = new Array();
	var cell_round = get_cell_round(x, y);
	for(var i=0; i<8; i++) {
		var cell_round_x = cell_round[i][0];
		var cell_round_y = cell_round[i][1];
		if(have_sense(cell_round_x, cell_round_y) && !game[cell_round_x][cell_round_y].is_bomb) {
			near_bombs.push(new Array( cell_round[i][0], cell_round[i][1] ));
		}
	}
	return near_bombs;
}
function get_n_near_bombs(x, y) {
	var n = 0;
	var cell_round = get_cell_round(x, y);
	for(var i=0; i<8; i++) {
		if(is_bomb(cell_round[i][0], cell_round[i][1])) {
			n++;
		}
	}
	return n;
}
function reveal_nothing(x, y) {
	set_nothing(x, y, game[x][y].n_near_bombs);
	var cell_round = get_cell_round(x, y);
	for(var i=0; i<8; i++) {
		var cell_round_x = cell_round[i][0];
		var cell_round_y = cell_round[i][1];
		if(have_sense(cell_round_x, cell_round_y)) {
			var cell = game[cell_round_x][cell_round_y];
			if(!cell.is_bomb && cell.type != TYPE.NOTHING) {
				if(cell.n_near_bombs) {
					set_nothing(cell_round_x, cell_round_y, cell.n_near_bombs);
				} else {
					reveal_nothing(cell_round_x, cell_round_y);
				}
			}
		}
	}
}

/**
 * GUI functions
 */
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
function GUI_set_near_bombs(x, y, n) {
	GUI_get_element(x, y).text(
		(!n) ? " " : n
	);
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
