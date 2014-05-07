/**
 * General settings
 */
var MINESWEEPER = {
	PREVENT_EXIT_TIMEOUT:500,
	SIDE_BORDERS:2,
	FIELD:"table#field",
	SINGLE_CELL:"table#field td",
	SINGLE_CELL_TAPPABLE:"table#field td",
	LATEST_APK: "http://minesweeper.reyboz.it/downloads/MineSweeper-latest.apk"
	/* CONTENT_INNER_WIDTH:0, This is automatically added */
};

/**
 * Defaults settings for localStorage
 */
var DEFAULTS = {
	"bomb_taps": 0,
	"game_nothings": 0,
	"long_vibration": 200,
	"play_times":0,
	"sound": true,
	"vibration": true,
	"short_vibration": 25,
	"win_times": 0
	/*"username": "Mr. Bombarolo", No default*/
}

/*
 * Global jQuery vars
 */
var field;
var field_el;
var field_el_tappable;

/**
 * Cell "constants"
 */
var TYPE = {
	DEFAULT:0,
	NOTHING:1,
	FLAGGED:2,
	BOMB:3,
};

/*
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
var prevent_exit = true;

/*
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

	SOUNDS.INTRO_LOOP.audio.pause(); 

	play_now(SOUNDS.START_GAME);
	set_flags_counter(0);
	game_nothings = 0;
	game_win = false;
	first_tap = true;
	bomb_taps = 0;
	return true;
}

/**
 * Prevent that first bomb is collocated in the first tap (otherwise user might get mad)
 */
function prepare_bombs(first_tap_x, first_tap_y) {
	cells = new Array();
	var candidates = new Array();
	for(var x=0; x<game_max_x; x++) {
		cells[x] = new Array();
		for(var y=0; y<game_max_y; y++) {
			cells[x][y] = {is_bomb:false, type:TYPE.DEFAULT}; // Reset game
			if(!(x == first_tap_x && y == first_tap_y)) {
				candidates.push( new Array(x, y) );
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

	for(var i=0; i<game_bombs; i++) {
		var cell_round = get_cell_round(candidates[i][0], candidates[i][1]);
		for(var j=0; j<8; j++) {
			var x = cell_round[j][0];
			var y = cell_round[j][1]
			if(have_sense(x, y) && !cells[x][y].is_bomb) {
				cells[x][y].n_near_bombs = get_n_near_bombs(cell_round[j][0], cell_round[j][1]);
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
			table += "<td class='cell-default'></td>";
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
	return float2int(MINESWEEPER.CONTENT_INNER_WIDTH / side);
}
function get_Ny_from_side(side) {
	return float2int(GUI_get_innerHeight() / side);
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
	var x1 = x-1;
	var x2 = x+1;
	var y1 = y-1;
	var y2 = y+1;
	return [[x1, y1], [x1, y], [x1, y2], [x, y1], [x2, y1], [x2, y], [x2, y2], [x, y2]];
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
function set_nothing(x, y, n) {
	if(cells[x][y].type != TYPE.NOTHING) {
		game_nothings++;
	}
	cells[x][y].type = TYPE.NOTHING;
	GUI_set_nothing(x, y, n);
	if(game_max_x * game_max_y - game_bombs <= game_nothings) { // Better "==", but I do not trust my coder mind
		GUI_alert_user_win();
	}
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

/*
 * GUI functions
 */
function GUI_ask_new_game() {
	$("#page-start-new-game").panel("open");
}
function GUI_get_innerHeight() {
	var less = $("div#header").innerHeight();
	return window.innerHeight - less;
}
function GUI_user_set_bomb(x, y) {
	switch(cells[x][y].type) {
		case TYPE.DEFAULT:
			if(cells[x][y].is_bomb) {
				play_now(SOUNDS.EXPLODE);
				GUI_set_bomb(x, y);
				cells[x][y].type = TYPE.BOMB;
				GUI_alert_user_lose();
			} else if(cells[x][y].n_near_bombs) {
				play_now(SOUNDS.TAP_NOTHING);
				set_nothing(x, y, cells[x][y].n_near_bombs);
			} else {
				play_now(SOUNDS.TAP_NOTHING);
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
	console.log("Set flag" + x + " " + y);
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
	var s = $(element);
	return $(s).parent().children().index($(s));
}
function GUI_get_y(element) {
	var s = $(element);
	return $(s).parent().parent().children().index($(s).parent());
}
function GUI_get_element(x, y) {
	return $("table#field tr").eq(y).find("td").eq(x);
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
	GUI_get_element(x, y).removeClass().addClass("cell-flag");
}
function GUI_set_bomb(x, y) {
	GUI_get_element(x, y).removeClass().addClass("cell-bomb");
}
function GUI_set_reset(x, y) {
	GUI_get_element(x, y).removeClass().addClass("cell-default");
}
function GUI_set_nothing(x, y, n) {
	GUI_get_element(x, y).removeClass().addClass("cell-nothing");
	GUI_get_element(x, y).text(
		((n) ? n : " ")
	);
}
function GUI_set_side(side) {
	field_el
		.width(side - MINESWEEPER.SIDE_BORDERS)
		.height(side - MINESWEEPER.SIDE_BORDERS)
		.css("maxWidth", (side - MINESWEEPER.SIDE_BORDERS) + "px")
		.css("maxHeight", (side - MINESWEEPER.SIDE_BORDERS) + "px");
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
		vibrate_now(get_option("short_vibration", "d"));
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
	play_now(SOUNDS.WIN);
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
	$("#popup-win").popup("open", {transition: "flow"});
	update_stats(true); // true -> win
}
function GUI_alert_user_lose() {
	play_now(SOUNDS.GAME_OVER);
	for(var x=0; x<game_max_x; x++) {
		for(var y=0; y<game_max_y; y++) {
			if(cells[x][y].is_bomb) {
					GUI_set_bomb(x, y);
			}
			cells[x][y].type = TYPE.NOTHING; // In order to deny clicks
		}
	}
	$("#popup-lose").popup("open", {transition: "slideup"});
	update_stats(false); // false -> lose
}

/**
 * Return true if it prevent closing the app
 */
function GUI_prevent_exit() {
	if(prevent_exit) {
		prevent_exit = false;
		$("#popup-alertclose").popup("open");
		setTimeout(
			function(){
				prevent_exit = true;
				$("#popup-alertclose").popup("close");
			},
			MINESWEEPER.PREVENT_EXIT_TIMEOUT
		);	
	} else {
		if(navigator.app){
			navigator.app.exitApp();
		}else if(navigator.device){
			navigator.device.exitApp();
		}
	}
}
function update_stats(win) {
	set_option("play_times", get_option("play_times", "d") + 1);
	set_option("game_nothings", get_option("game_nothings", "d") + game_nothings);
	set_option("bomb_taps", get_option("bomb_taps", "d") + bomb_taps);
	if(win) {
		set_option("win_times", get_option("win_times", "d") + 1);
		vibrate_now(get_option("short_vibration", "d"));
	} else {
		set_option("lose_times", get_option("lose_times", "d") + 1);
		vibrate_now(get_option("long_vibration", "d"));
	}
}

/*
 * Smarter localStorage functions (for my comfort)
 */
function get_option(name, force_type) {
	var value = localStorage.getItem(name);
	if(value === null) {
		var value = DEFAULTS[name];
	}
	if(force_type) {
		switch(force_type) {
			case "d": return parseInt(value); // Decimal integer
			case "f": return parseFloat(value); // Float
		}
	}
	return value;
}
function set_option(name, value) {
	if(typeof value === 'boolean') {
		value = bool2str(value);
	}
	localStorage.setItem(name, value);
}

/*
 * Device manipulation
 */
function play_now(jingle) {
	if(get_option("sound")) {
		jingle.audio.play();
	}
}
function vibrate_now(time) {
	if(navigator.notification && get_option("vibration")) {
		navigator.notification.vibrate(time);
	}
}

/*
 * Basically functions
 */
function shuffle(o) {
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
function bool2str(bool) {
	return bool ? "1" : "";
}

/**
 * Force an image to preserve its ratio width/height maximizing it into a certain
 * space and shrinking it with a dimensional rate.
 * The image will not be stretched.
 */
function img_shrink(img, into_width, into_height, dim_rate) { // dim_rate <= 1
	var img = $(img);
	var img_width = img.width();
	var img_height = img.height();
	var ratio = img_width / img_height;
	var pratio = into_width / into_height;
	if(ratio<pratio) {
		if(img_height > into_height) {
			img.css({width:'auto', height:into_height*dim_rate});
		}
	} else if(img_width > into_width) {
		img.css({width:into_width*dim_rate, height:'auto'});
	}
}
