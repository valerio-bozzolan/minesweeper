/**
 * CSS settings
 */
var CSS = {
	side_borders:2/*,
	content_innerWidth:0, This is automatically added */
};

/**
 * DOM settings
 */
var MINESWEEPER = {
	FIELD:"table#field",
	SINGLE_CELL:"table#field td",
	SINGLE_CELL_TAPPABLE:"table#field td button"
};

/**
 * Default settings
 */
var DEFAULTS = {
	USERNAME: "Mr. Bombarolo",
	SHORT_VIBRATION: 75,
	LONG_VIBRATION: 500,
	LATEST_APK: "http://minesweeper.reyboz.it/downloads/MineSweeper-latest.apk"
};

/**
 * Soundtracks
 */
var SOUNDS = {
	INTRO_LOOP: {src:"media/kvantisera-loop.ogg"},
	GAME_OVER: {src:"media/game-over-evil.ogg"},
	START_GAME: {src:"media/lawn-mower-electric.ogg"},
	TAP_NOTHING: {src:"media/bip.ogg"},
	EXPLODE: {src:"media/shoot.ogg"},
	WIN: {src:"media/yuppie.ogg"}
}

/**
 * Global jQuery vars
 */
var field;
var field_el;
var field_el_tappable;

/**
 * Global "constants"
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
var cells; // cells[x][y] = {is_bomb: boolean, type: int [, n_near_bombs: int]}
var game_max_x;
var game_max_y;
var game_flags;
var game_bombs;
var game_nothings; // No, I'm not a stupid goat: the "s" remember me that this is the plural of "how many cells with type=TYPE.NOTHING", and so that this is not an useless "nothing" var.
var game_win;
var first_tap;
var bomb_taps;

/**
 * Game functions
 */

/**
 * Reset the game
 */
function new_game(bombs, Nx) {
	GUI_clear_table();
	create_field_from_Nx(Nx);
	set_bombs(float2int((game_max_x * game_max_y * bombs) / 100));
	if(game_bombs >= game_max_x * game_max_y) {
		return false; // Uh? More bombs than cells?
	}
	// Stop loop song
	if(sound_loop) {
		sound_loop.pause(); // see from index.js
	} else {
		SOUNDS.INTRO_LOOP.audio.pause(); // see jquery-events.js
	}
	singthesong(SOUNDS.START_GAME);
	set_flags_counter(0);
	game_nothings = 0;
	game_win = false;
	first_tap = true;
	bomb_taps = 0;
	return true;
}
/**
 * Prevent that first bomb is collocated at `secure_start_x` and `secure_start_y` position.
 */
function prepare_bombs(secure_start_x, secure_start_y) {
	cells = new Array();
	var candidates = new Array();
	for(var x=0; x<game_max_x; x++) {
		cells[x] = new Array();
		for(var y=0; y<game_max_y; y++) {
			cells[x][y] = {is_bomb:false, type:TYPE.DEFAULT}; // Reset game
			if(!(x == secure_start_x && y == secure_start_y)) {
				candidates.push( new Array(x, y) );
			} else {
				console.log("Not choosen " + x + " " + y);
			}
		}
	}

	/*
	 * This will win the "Lazy Trick" first prize to choose randomly N° bombs.
	 * But it (obviously) works properly and it makes this piece of code sooooo clean...
	 * So if you want to fight about it, write on your own your boring code and don't be stressful.
	 */
	candidates = shuffle(candidates);
	for(var i=0; i<game_bombs; i++) {
		cells[ candidates[i][0] ][ candidates[i][1] ].is_bomb = true; // Element elected as bomb
	}

	/*
	 * This will win the "Lazy Trick" second prize to facilitate the function `reveal_nothing(x, y)`.
	 * But it (obviously) works properly<del> and it makes this piece of code sooooo clean..</del>.
	 * So if you want to fight about it, write on your own your better code and don't be stressful.
	 */
	for(var x=0; x<game_max_x; x++) {
		for(var y=0; y<game_max_y; y++) {
			if(!cells[x][y].is_bomb) {
				cells[x][y].n_near_bombs = get_n_near_bombs(x, y);
			}
		}
	}
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
			table += "<td><button> </button></td>";
		}
		table += "</tr>";
	}
	field.html(table);
	field_el = $(MINESWEEPER.SINGLE_CELL);
	field_el_tappable = $(MINESWEEPER.SINGLE_CELL_TAPPABLE);
	GUI_set_side(side);
	GUI_bind_cell_events();
}
function get_Nx_from_side(side) {
	return float2int(CSS.content_innerWidth / side);
}
function get_Ny_from_side(side) {
	var less = $("div#header").innerHeight();
	return float2int((window.innerHeight - less) / side);
}
function set_bombs(n) {
	game_bombs = n;
	GUI_set_bombs_counter(n);
}
function set_flags_counter(n) {
	game_flags = n;
	GUI_set_flags_counter(n);
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
	return have_sense(x, y) && cells[x][y].is_bomb;
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
function set_nothing(x, y, n) {
	if(cells[x][y].type != TYPE.NOTHING) {
		game_nothings++;
	}
	cells[x][y].type = TYPE.NOTHING;
	GUI_set_nothing(x, y, n);
	console.log(game_max_x * game_max_y - game_bombs + " <= " + game_nothings);
	if(game_max_x * game_max_y - game_bombs <= game_nothings) { // Better "==", but I do not trust my coder mind
		GUI_alert_user_win();
	}
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
	set_nothing(x, y, cells[x][y].n_near_bombs);
	var cell_round = get_cell_round(x, y);
	for(var i=0; i<8; i++) {
		var cell_round_x = cell_round[i][0];
		var cell_round_y = cell_round[i][1];
		if(have_sense(cell_round_x, cell_round_y)) {
			var cell = cells[cell_round_x][cell_round_y];
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
function GUI_ask_new_game() {
	$("#page-start-new-game").panel("open");
}
function GUI_user_set_bomb(x, y) {
	switch(cells[x][y].type) {
		case TYPE.DEFAULT:
			if(cells[x][y].is_bomb) {
				singthesong(SOUNDS.EXPLODE);
				GUI_set_bomb(x, y);
				cells[x][y].type = TYPE.BOMB;
				GUI_alert_user_lose();
			} else if(cells[x][y].n_near_bombs) {
				singthesong(SOUNDS.TAP_NOTHING);
				set_nothing(x, y, cells[x][y].n_near_bombs);
			} else {
				singthesong(SOUNDS.TAP_NOTHING);
				reveal_nothing(x, y);
			}
			bomb_taps++;
			break;
		case TYPE.FLAGGED:
			console.log("It's flagged. First remove flag!");
			break;
	}
}
function GUI_user_set_flag(x, y) {
	switch(cells[x][y].type) {
		case TYPE.DEFAULT:
			cells[x][y].type = TYPE.FLAGGED;
			increase_flags_counter();
			GUI_set_flag(x, y);
			break;
		case TYPE.FLAGGED:
			cells[x][y].type = TYPE.DEFAULT;
			decrease_flags_counter();
			GUI_set_reset(x, y);
			break;
	}
}
function GUI_get_x(element) {
	var s = $(element).parent();
	return $(s).parent().children().index($(s));
}
function GUI_get_y(element) {
	var s = $(element).parent();
	return $(s).parent().parent().children().index($(s).parent());
}
function GUI_get_element(x, y) {
	return $("table#field tr").eq(y).find("td button").eq(x);
}
function GUI_clear_table() {
	field.empty();
}
function GUI_set_bombs_counter(n) {
	$(".bombs-counter").text(n);
}
function GUI_set_flags_counter(n) {
	$(".flags-counter").text(n);
}
function GUI_set_flag(x, y) {
	GUI_get_element(x, y).css("background", "yellow");
}
function GUI_set_bomb(x, y) {
	GUI_get_element(x, y).css("background", "red");
}
function GUI_set_reset(x, y) {
	GUI_get_element(x, y).css("background", "grey");
}
function GUI_set_nothing(x, y, n) {
	GUI_get_element(x, y).css("background", "green");
	GUI_get_element(x, y).text(
		((n) ? n : " ")
	);
}
function GUI_set_side(side) {
	field_el
		.width(side - CSS.side_borders)
		.height(side - CSS.side_borders)
		.css("maxWidth", (side - CSS.side_borders) + "px")
		.css("maxHeight", (side - CSS.side_borders) + "px");
}
function GUI_bind_cell_events() {
	field_el_tappable.on('tap', function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		if(first_tap) {
			prepare_bombs(x, y);
			first_tap = false;
		}
		GUI_user_set_bomb(x, y);
	}).on('taphold', function() {
		var x = GUI_get_x(this);
		var y = GUI_get_y(this);
		if(first_tap) {
			prepare_bombs(x, y);
			first_tap = false;
		}
		GUI_user_set_flag(x, y);
	});
}
function GUI_alert_user_win() {
	singthesong(SOUNDS.WIN);
	for(var x=0; x<game_max_x; x++) {
		for(var y=0; y<game_max_y; y++) {
			var cell = cells[x][y];
			if(cell.type == TYPE.DEFAULT) {
				if(cell.is_bomb) {
					GUI_set_flag(x, y);
				} else {
					alert("YET NOTHING CELLS. ALERT THE PROGRAMMER PLEASE WITH A SCREENSHOT!!!!\n(This mean that the programmer it's a bit confused. Alert him. Do it. Please. Please!)");
				}
			}	
			cells[x][y].type = TYPE.NOTHING; // In order to deny clicks
		}
	}
	update_stats(true);
	alert("Wei... Bu.. But...\nYOU WIN! :D");
}
function GUI_alert_user_lose() {
	singthesong(SOUNDS.GAME_OVER);
	for(var x=0; x<game_max_x; x++) {
		for(var y=0; y<game_max_y; y++) {
			if(cells[x][y].is_bomb) {
					GUI_set_bomb(x, y);
			}
			cells[x][y].type = TYPE.NOTHING; // In order to deny clicks
		}
	}
	update_stats(false);
	alert("You lose\n:(");
}
function update_stats(win) {
	localStorage.setItem("play_times",
		( parseInt(localStorage.getItem("play_times")) || 0 ) + 1
	);
	localStorage.setItem("game_nothings",
		( parseInt(localStorage.getItem("game_nothings")) || 0 ) + game_nothings
	);
	localStorage.setItem("bomb_taps",
		( parseInt(localStorage.getItem("bomb_taps")) || 0 ) + bomb_taps
	);
	if(win) {
		localStorage.setItem("win_times",
			( parseInt(localStorage.getItem("win_times")) || 0 ) + 1
		);
		if(navigator.notification && localStorage.getItem("VIBRATION")) {
			navigator.notification.vibrate( parseInt(localStorage.getItem("SHORT_VIBRATION")) || DEFAULTS.SHORT_VIBRATION );
		}
	} else {
		localStorage.setItem("lose_times",
			( parseInt(localStorage.getItem("lose_times")) || 0 ) + 1
		);
		if(navigator.notification && localStorage.getItem("VIBRATION")) {
			navigator.notification.vibrate( parseInt(localStorage.getItem("LONG_VIBRATION")) || DEFAULTS.LONG_VIBRATION );
		}
	}
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
function int2bool(int) {
	return int ? true : false;
}
function bool2int(bool) {
	return bool ? 1 : 0;
}

/**
 * Phone-"gap" related...
 */
function singthesong(track) {
	if(navigator.app) {
		new Media(
			PATH + track.src,
			function() {
			},
			function(error) {
				alert("Error with track " + track.src + " error: " + error.code + " " + error.message);
			}
		).play(); // App
	} else {
		track.audio.play(); // Browser
	}
}
