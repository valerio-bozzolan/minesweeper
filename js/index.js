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
	getPhoneGapPath: function() {
		var path = window.location.pathname;
		path = path.substr(path, path.length - 10);
		return 'file://' + path;
	},
	initialize: function() {
		app.PATH = this.getPhoneGapPath();
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener("deviceready", this.onDeviceReady, false);
		document.addEventListener("pause", this.onDevicePause, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.IS_APP = true;

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
	}
};
