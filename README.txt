|             _____________________________________
|            / MineSweeper: 100% pure meat GNU GPL \
|            \ Will you be able not to love me?    /
|             -------------------------------------
|                    \   ^__^
|                     \  (..)\_______
|                        (__)\       )\/\
|                            ||----w |
|                            ||     ||
|
|                      MANUAL FOR SWEET DEVELOPERS
|_______________________________________________________________________________

* The app is under the terms of the GNU General Public License v3+.
  Please study your rights, and even your obligations.
  A full-text of the license is in:

	/LICENSE.txt

* The source code is only in this folder:

	/www

* The main scripts are in this file:

	/www/js/minesweeper.js

* To edit languages, see this file:

	/www/html10n.js/i18n.json

* To test the app on your Android connected through `adb` (Debug Mode) on PC,
  install first cordova on the PC and then run this command in the same folder
  of the project:

	cordova run android

  But.. because of this app is multiplatform, then you can study how to port
  this app on your favourite mobile OS. See the documentation of cordova to to
  that:

	http://docs.phonegap.com/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface

  For example to add iOS platform, you can run:

	cordova platform add ios

  But because I hate iOS, I cannot help more.
  Perhaps one day someone will explain more this part, hoping in the GPL-force.

* To change version of the app, edit properly version/versionName/versioCode in:

	/config.xml
	/platform/android/AndroidManifest.xml

* For questions:

	https://answers.launchpad.net/minesweeper

* For bug/idea submission:

	https://bugs.launchpad.net/minesweeper

* For talking about the weather, try with the founder:

	Valerio Bozzolan
	http://contatti.reyboz.it

 _______________________________________________________________________________
|
|                           IN THE NAME OF OUR FUN
|
| Thank you very much, dear reader, to enjoy this game.
| MineSweeper loves all the contributors, and their names will remain over the
| centuries, recorded in the Bazaar log (run it into the project folder):
|
|	bzr log -n 0 --log-format short | more
|
| In addition, thanks to all the people that released under a Free license
| certain stuff, allowing me and all the contributors to steal icons and sounds:
|
|	/CREDITS.txt
|
| I've originally created MineSweeper in 3-4 days only to drive away boredom,
| when I was in the Mauriziano Hospital in Turin (IT), during the post-operation
| tonsil period without a working Internet connection (sigh). So because I only
| well-knew PHP5 and HTML5/Javascript/CSS, and because I don't really like Java,
| so I've started MineSweeper in the simplest way: In HTML, CSS and Javascript.
|
| N.B.
| If in the future you don't want that people would create applications in HTML,
| please tell to the doctors of that hospital that without an RJ-45 socket or
| a working wireless connection, the people, one day, may would create other
| orrible apps (or they would burn the hospital).
|
|
|
| Have a nice day! :3
|
|	~ A de-tonsils-ed founder
|	  Valerio Bozzolan
|_______________________________________________________________________________
