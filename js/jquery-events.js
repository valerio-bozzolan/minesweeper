$(function() {
	$.event.special.tap.emitTapOnTaphold = false;

	field = $(MINESWEEPER.FIELD);

	$(".open-new-game-page").click(function() {
		$("#page-start-new-game").panel("open");
	});

	$(".close-new-game-page").click(function() {
		$("#page-start-new-game").panel("close");
	});

	CSS.content_innerWidth = $("div#content").innerWidth() - 32; // 16px + 16px of padding

	$(".play").click(function( event ) {
		var bombs = $("#page-start-new-game select[name='bombs']").val();
		var n_x   = $("#page-start-new-game select[name='n_x']").val();
		if(!new_game(bombs, n_x)) {
			alert("Please decrease bombs.");
		} else {
			$(".game-difficult-label").text(
				$("#page-start-new-game select[name='n_x'] option:selected").text() + " in " +
				$("#page-start-new-game select[name='bombs'] option:selected").text()
			);
			$("#page-start-new-game").panel("close");
		}
		return false;
	});

	GUI_ask_new_game();
});
