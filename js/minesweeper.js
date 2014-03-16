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
 * 	0: Nothing
 *	1: Bomb
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

/**
 * Init game
 */
game_reset(4, 1); // Fill 20 per x-row, 20 bombs

$("table#" + field_ID + " td").click(function() {
	var x = $(this).parent().children().index($(this));
	var y = $(this).parent().parent().children().index($(this).parent());
	if(game[x][y]) {
		alert("Hai perso");
	} else {
		field_indicate_as_flag(x, y);
	}
});

function game_reset(Nx, n_bombs) {
	var candidates = new Array();
	create_field_from_Nx(Nx);
	for(var i=0; i<game_max_x; i++) {
		game[i] = new Array();
		for(var j=0; j<game_max_y; j++) {
			game[i][j] = 0; // Reset game
			candidates.push(new Array(i, j));
		}
	}
	if(n_bombs >= candidates.length) {
		return false; // There are more bombs than elements
	}
	candidates = shuffle(candidates);
	for(var i=0; i<n_bombs; i++) {
		game[ candidates[i][0] ][ candidates[i][1] ] = 1; // Element elected as bomb
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
	for(var i=0; i<game_max_y; i++) {
		table += "<tr>";
		for(var j=0; j<game_max_x; j++) {
			table += "<td></td>";
		}
		table += "</tr>";
	}
	field.html(table);
	field_change_CSS_side(side);
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

function field_change_CSS_side(side) {
	$("td").width(side - CSS_side_borders);
	$("td").height(side - CSS_side_borders);
}

function field_indicate_as_flag(x, y) {
	$("tr").eq(y).find("td").eq(x).css("background", "grey");
}

function shuffle(o) {
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};
