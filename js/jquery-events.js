field = $(field_name);

$(".play").click(function() {
	ask_new_game();
});

$("#page-start-new-game a").click(function( event ) {
	var bombs = $("#page-start-new-game select[name='bombs']").val();
	var n_x   = $("#page-start-new-game select[name='n_x']").val();
	if(!new_game(bombs, n_x)) {
		alert("Please decrease bombs.");
		event.preventDefault();
	}
});
