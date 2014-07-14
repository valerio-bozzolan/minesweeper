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
 *  _____________________________________
 * / MineSweeper: 100% pure meat GNU GPL \
 * \ Will you be able not to love me?    /
 *  -------------------------------------
 *         \   ^__^
 *          \  (..)\_______
 *             (__)\       )\/\
 *                 ||----w |
 *                 ||     ||
 */

/**
 * Soundtracks
 */
var SOUNDS = {
	INTRO_LOOP: {src:"media/kvantisera-loop.ogg", loop: true},
	GAME_OVER: {src:"media/game-over-evil.ogg"},
	START_GAME: {src:"media/lawn-mower-electric.ogg"},
	TAP_NOTHING: {src:"media/bip.ogg"},
	EXPLODE: {src:"media/shoot.ogg"},
	WIN: {src:"media/yuppie.ogg"}	
}

var app = {
	PATH: null,
	IS_APP: false,
	initialize: function() {
		app.PATH = this.getPhoneGapPath();
		this.bindEvents();
	},
	getPhoneGapPath: function() {
		var path = window.location.pathname;
		path = path.substr(path, path.length - 10);
		return 'file://' + path;
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener("deviceready", this.onDeviceReady, false);
		document.addEventListener("pause", this.onDevicePause, false);
		document.addEventListener("backbutton", this.onBackKeyDown, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.IS_APP = true;

		// Localization
		html10n.localize(get_option("language") || navigator.language.split("-")[0]);

		// SOUNDS with Media if app
		for(var jingle in SOUNDS) {
			if(typeof SOUNDS[jingle].loop == 'undefined') {
				SOUNDS[jingle].audio = new Media(app.PATH + SOUNDS[jingle].src);
			}
		}

		// SOUNDS loop
		SOUNDS.INTRO_LOOP.audio = new Media(
			app.PATH + SOUNDS.INTRO_LOOP.src,
			function() {} /* onSuccess */,
			function() {} /* onError   */,
			function(status) {
				if(status==Media.MEDIA_STOPPED) {
					SOUNDS.INTRO_LOOP.audio.play();
				}
			}
		);
		if(get_option("sound")) {
			SOUNDS.INTRO_LOOP.audio.play();
		}

		// SOUNDS in DOM if browser (see jquery-events.js)
	},
	onDevicePause: function() {
		SOUNDS.INTRO_LOOP.audio.pause(); // Would you be so kind to KILL IMMEDIATELY THIS FU***NG JINGLE WHEN I WANT TO STOP IT!?!? o__o'
	},
	onBackKeyDown: function() {
		GUI_prevent_exit();
		return false;
	}
};
