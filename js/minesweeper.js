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
 * Array content legend:
 *	2: Flagged
 * 	1: Nothing
 *	0: Bomb
 */

/**
 * Globals
 */
var field_ID = 'field';
var field = $("#" + field_ID);
var CSS_side_borders = 2; // px

var game = new Array(); // [x][y] = {0, 1};
var game_max_x;
var game_max_y;
var game_flags;
var game_bombs;

$(function() {
	$(".play").click(function() {
		ask_new_game();
	});
	$("#dialog").dialog({
		autoOpen: false,
		show: {
			effect: "blind",
			duration: 1000
		},
		hide: {
			effect: "explode",
			duration: 1000
		}
	});
	$("#dialog-close").click(function() {
		if(new_game($("#bombs").val(), $("#n_x").val())) {
			$("#dialog").dialog("close");			
		} else {
			alert("Sorry, decrease bombs.");
		}
	});
	ask_new_game();
});

function new_game(bombs, Nx) {
	GUI_clear_table();
	set_bombs(bombs);
	if(!game_prepare(Nx)) {
		return false;
	}
	$("table#" + field_ID + " td").click(function() {
		var x = $(this).parent().children().index($(this));
		var y = $(this).parent().parent().children().index($(this).parent());
		switch(game[x][y]) {
			case 0:
				GUI_set_bomb(x, y);
				alert("You lose.");
				ask_new_game();
				break;
			case 1:
				game[x][y] = 2;
				increase_flags_counter();
				GUI_set_flag(x, y);
				break;
			case 2:
				game[x][y] = 1;
				decrease_flags_counter();
				GUI_set_nothing(x, y);
				break;
		}
	});
	return true;
}

function ask_new_game() {
	$("#dialog").dialog("open");
}

function game_prepare(Nx) {
	game = new Array();
	var candidates = new Array();
	set_flags_counter(0)
	create_field_from_Nx(Nx);
	for(var i=0; i<game_max_x; i++) {
		game[i] = new Array();
		for(var j=0; j<game_max_y; j++) {
			game[i][j] = 1; // Reset game
			candidates.push(new Array(i, j));
		}
	}
	if(game_bombs >= candidates.length) {
		return false; // There are more bombs than elements
	}
	candidates = shuffle(candidates);
	for(var i=0; i<game_bombs; i++) {
		game[ candidates[i][0] ][ candidates[i][1] ] = 0; // Element elected as bomb
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
			table += "<td></td>";
		}
		table += "</tr>";
	}
	field.html(table);
	GUI_set_side(side);
}

function get_Nx_from_side(side) {
	return float2int(window.innerWidth / side);
}

function get_Ny_from_side(side) {
	var less = $("div#navigation").innerHeight(); // Menù prima o dopo del campo di gioco
	return float2int((window.innerHeight - less) / side);
}

function float2int(value) {
	return value | 0;
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

/**
 * GUI functions
 */
function GUI_set_flag(x, y) {
	$("tr").eq(y).find("td").eq(x).css("background", "grey");
}
function GUI_set_bomb(x, y) {
	$("tr").eq(y).find("td").eq(x).css("background", "red");
}
function GUI_set_nothing(x, y) {
	$("tr").eq(y).find("td").eq(x).css("background", "yellow");
}
function GUI_set_side(side) {
	$("td").width(side - CSS_side_borders);
	$("td").height(side - CSS_side_borders);
}
function GUI_clear_table() {
	 field.empty();
}

/**
 * Basically functions
 */
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
