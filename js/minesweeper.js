/**
 * Terminology:
 * 	N:         N° of <td>
 *	side:      pixel of every <td>
 *	field:     the table
 */

var field_ID = 'field';

var field = $("#" + field_ID);

var game;

create_table_from_Nx(20, field);

$("table#" + field_ID + " td").click(function() {
	var col = $(this).parent().children().index($(this));
	var row = $(this).parent().parent().children().index($(this).parent());
	alert(col + " " + row);
});

function instantiate_table(n_bombs, element) {

}

function create_table_from_Nx(Nx, element) {
	var side = float2int(window.innerWidth / Nx);
	create_table_from_side(side, element);
}

function create_table_from_side(side, element) {
	var Nx = get_Nx_from_side(side);
	var Ny = get_Ny_from_side(side);
	var table = "";
	for(var i=0; i<Ny; i++) {
		table += "<tr>";
		for(var j=0; j<Nx; j++) {
			table += "<td></td>";
		}
		table += "</tr>";
	}
	element.html(table);
	change_CSS_side(side);
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

function change_CSS_side(side) {
	$("td").width(side - 2); // Less CSS borders
	$("td").height(side - 2); // Less CSS borders
}
