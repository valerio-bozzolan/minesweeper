$(function() {
	$.event.special.tap.emitTapOnTaphold = false;

	field = $(MINESWEEPER.FIELD);

	$(".play").click(function() {
		ask_new_game();
	});

	CSS.content_innerWidth = $("div#content").innerWidth() - 32; // 16px + 16px of padding

	$("#page-start-new-game a").click(function( event ) {
		var bombs = $("#page-start-new-game select[name='bombs']").val();
		var n_x   = $("#page-start-new-game select[name='n_x']").val();
		if(!new_game(bombs, n_x)) {
			alert("Please decrease bombs.");
			event.preventDefault();
		}
	});

	// Tap event: in minesweeper.js (function create_field_from_side(side))

	// Tap hold event: in minesweeper.js (function create_field_from_side(side))

	ask_new_game();
});
