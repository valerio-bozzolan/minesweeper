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

	/**
	 * Settings page - One-time update
	 */
	$(document).on("pageinit", "#settings", function() {
		// Username
		$("input[name='username']").change(function() {
			localStorage.setItem("username", $("input[name='username']").val());
		});

		// Vibration
		$("input[name='vibration']").change(function(){
			localStorage.setItem("vibration", bool2int($(this).is(':checked')) );
		});

		// Force external links in stock browser
		$("a.my-external").click(function () {
			var addressValue = $(this).attr("href");
			if(navigator.app) {
				navigator.app.loadUrl(addressValue, { openExternal:true });
			} else {
				window.open(addressValue, '_system');
			}
			return false;
		});

		// Download APK link
		$(".download-latest").attr("href", DEFAULTS.LATEST_APK );
	});

	/**
	 * Settings page - All-time updates
	 */
	$(document).on("pagebeforeshow", "#settings", function() {
		// Username
		if(localStorage.getItem("username")) {
			$("input[name='username']").val( localStorage.getItem("username") );
		} else {
			$("input[name='username']").attr("placeholder", DEFAULTS.USERNAME );
		}

		// Vibration
		$("input[name='vibration']").attr('checked', int2bool(localStorage.getItem("vibration")) || 1 );

		// Stats
		$(".play_times").text( localStorage.getItem("play_times") || 0 );
		$(".game_nothings").text( localStorage.getItem("game_nothings") || 0 );
		$(".bomb_taps") .text( localStorage.getItem("bomb_taps")  || 0 );
		$(".win_times") .text( localStorage.getItem("win_times")  || 0 );
	});

	/**
	 * Incorporate all SOUNDS in DOM (if browser)
	 */
	if(!navigator.app) {
		for(var jingle in SOUNDS) {
			SOUNDS[jingle].audio = document.createElement('audio');
			SOUNDS[jingle].audio.setAttribute('src', SOUNDS[jingle].src );
		}
		SOUNDS.INTRO_LOOP.audio.play();
		SOUNDS.INTRO_LOOP.audio.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
	}

	GUI_ask_new_game();
});
