$(function() {
	$.event.special.tap.emitTapOnTaphold = false;

	field = $(MINESWEEPER.FIELD);

	$(".open-new-game-page").click(function() {
		$("#page-start-new-game").panel("open");
	});

	$(".close-new-game-page").click(function() {
		$("#page-start-new-game").panel("close");
	});

	MINESWEEPER.CONTENT_INNER_WIDTH = $("div#content").innerWidth() - 32; // 16px + 16px of padding

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

	// Swipe RIGHT for the main menu
	$(document).on("swiperight", function() {
		GUI_ask_new_game();
	});

	/**
	 * Settings page - One-time update
	 */
	$(document).on("pageinit", "#settings", function() {

		// Username
		if(get_option("username")) {
			$("input[name=username]").val( get_option("username") );
		}

		// Vibration
		$("input[name=vibration]").prop('checked', get_option("vibration") ).checkboxradio("refresh");

		// Sound
		$("input[name=sound]").prop('checked', get_option("sound") ).checkboxradio("refresh");

		// onChange username
		$("input[name=username]").change(function() {
			var el = $(this);
			set_option(el.attr("name"), el.val());
		});

		// onChange vibration
		$("input[name=vibration]").change(function() {
			set_option("vibration", $(this).is(":checked"));
			vibrate_now(get_option("short_vibration"));
		});

		// onChange sound
		$("input[name=sound]").change(function() {
			set_option("sound", $(this).is(":checked"));
			if(!$(this).is(":checked")) {
				SOUNDS.INTRO_LOOP.audio.pause();
			} else {
				play_now(SOUNDS.TAP_NOTHING);
			}	
		});

		// Force external links in stock browser
		$("a.my-external").click(function () {
			var addressValue = $(this).attr("href");
			if(app.IS_APP) {
				navigator.app.loadUrl(addressValue, { openExternal:true });
			} else {
				window.open(addressValue, '_system');
			}
			return false;
		});

		// Download APK link
		$(".download-latest").attr("href", MINESWEEPER.LATEST_APK );
	});

	/**
	 * Settings page - All-time updates
	 */
	$(document).on("pagebeforeshow", "#settings", function() {
		// Stats
		console.log("Stats updated");
		$(".play_times").text( get_option("play_times"));
		$(".game_nothings").text(get_option("game_nothings"));
		$(".bomb_taps").text(get_option("bomb_taps"));
		$(".win_times").text(get_option("win_times"));
	});

	/**
	 * SOUNDS in DOM if browser
	 */
	if(!app.IS_APP) {
		// in DOM if browser
		for(var jingle in SOUNDS) {
			SOUNDS[jingle].audio = document.createElement('audio');
			SOUNDS[jingle].audio.setAttribute('src', SOUNDS[jingle].src );
		}

		// SOUNDS loop
		if(get_option("sound")) {
			SOUNDS.INTRO_LOOP.audio.play();
			SOUNDS.INTRO_LOOP.audio.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
		}
	}

	GUI_ask_new_game();
});
