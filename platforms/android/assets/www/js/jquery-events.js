/* 
 * Open MineSweeper
 * Copyright (C) 2014 Valerio Bozzolan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Swipe: A sad story.
 */
$.event.special.swipe.scrollSupressionThreshold = screen.availWidth / 60; // (default: 10) (pixels) – More than this horizontal displacement, and we will suppress scrolling.
$.event.special.swipe.horizontalDistanceThreshold = screen.availWidth / 60; // (default: 30) (pixels) – Swipe horizontal displacement must be less than this.
$.event.special.swipe.verticalDistanceThreshold = screen.availHeight / 13; // (default: 75) (pixels) – Swipe vertical displacement must be less than this.
$.event.special.swipe.durationThreshold = 1800; // (default: 1000) (milliseconds) – More time than this, and it isn't a swipe.
$.event.special.tap.emitTapOnTaphold = false;

/*
 * Hold tap
 */
$.event.special.tap.tapholdThreshold = 300;

$(window).resize(function() {
	MINESWEEPER.CONTENT_INNER_WIDTH = $("div#content").innerWidth() - 32; // 16px + 16px of padding
});

$(document).ready(function() {

	// jQuery mobile workaround for Localization
	html10n.bind("localized", function() {
		console.log("Localized in " + html10n.language);
		$("select").selectmenu("refresh");
	});

	field = $(MINESWEEPER.FIELD);
	var splash = $("#splash");

	img_shrink("#splash img", splash.parent().innerWidth(), GUI_get_innerHeight(), 0.95);
	$(".img-shrink").each(function() {
		img_shrink(this, $("body").innerWidth(), $("body").innerHeight(), 0.7);
	});

	$(".open-new-game-page").click(function() {
		$("#page-start-new-game").panel("open");
	});

	$(".close-new-game-page").click(function() {
		$("#page-start-new-game").panel("close");
	});

	MINESWEEPER.CONTENT_INNER_WIDTH = $("div#content").innerWidth() - 32; // 16px + 16px of padding

	// Automatically ask for new game
	setTimeout(GUI_ask_new_game , 1000);

	$(".play").click(function( event ) {
		splash.hide();
		$("#popup-lose").popup("close");
		$("#popup-win").popup("close");
		var bombs = $("#page-start-new-game select[name='bombs']").val();
		var n_x   = $("#page-start-new-game select[name='n_x']").val();
		if(!new_game(bombs, n_x)) {
			alert(_("error-bombs"));
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
	$("#index").on("swiperight", function() {
		GUI_ask_new_game();
	});

	/*
	 * Settings page
	 */

	// One-time update
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
	});

	// All-time updates
	$(document).on("pagebeforeshow", "#settings", function() {
		$(".play_times").text( get_option("play_times"));
		$(".game_nothings").text(get_option("game_nothings"));
		$(".bomb_taps").text(get_option("bomb_taps"));
		$(".win_times").text(get_option("win_times"));
	});

	// onChange Language
	$("select#language").change(function() {
		var lang = $(this).find(":selected").val();
		if(lang == "default") {
			lang = (app.is_APP) ? navigator.language.split("-")[0] : (navigator.language || navigator.userLanguage).split("-")[0];
		}
		html10n.localize(lang);
		set_option("language", lang);
	});

	/*
	 * If browser
	 */

	if(!app.IS_APP) {
		// Localization
		html10n.localize(get_option("language"));

		// SOUNDS in DOM if browser
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
});
