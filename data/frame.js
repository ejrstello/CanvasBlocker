 /* jslint moz: true */
 /* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(){
	"use strict";
	
	const {utils: Cu} = Components;
	const COMMONJS_URI = "resource://gre/modules/commonjs";
	const {require} = Cu.import(COMMONJS_URI + "/toolkit/require.js", {});
	const {intercept} = require("../lib/intercept.js");
	const {ask} = require("../lib/askForPermission.js");
	
	// Variable to "unload" the script
	var enabled = true;
	
	function check(message){
		if (enabled){
			var status = sendSyncMessage(
				"canvasBlocker-check",
				message
			);
			return status[0];
		}
		else {
			return {type: [], mode: "allow"};
		}
	}
	function askWrapper(data){
		return ask(data, {
			_: function(token){
				return sendSyncMessage(
					"canvasBlocker-translate",
					token
				)[0];
			},
			prefs: function(name){
				return sendSyncMessage(
					"canvasBlocker-pref-get",
					name
				)[0];
			}
		});
	}
	function notify(data){
		sendAsyncMessage("canvasBlocker-notify", data);
	}
	function interceptWrapper(ev){
		if (enabled){
			// window is only equal to content for the top window. For susequent
			// calls (e.g. iframe windows) the new generated window has to be 
			// used.
			
			var window = ev.target.defaultView;
			
			// EJr:
			var jlogList = sendSyncMessage("canvasBlocker-pref-get","jlogList")[0];
			window.localStorage.setItem("jlogList", jlogList);
			
			intercept(
				{subject: window},
				{check, ask: askWrapper, notify}
			);
		}
	}
	addEventListener("DOMWindowCreated", interceptWrapper);
	
	// EJr:
	addEventListener("DOMContentLoaded", function (ev) {
		var window = ev.target.defaultView;
		var isCF = window.localStorage.getItem("jCanvasFingerprint");
		var error = new Error();
		sendAsyncMessage("GotLoadEvent", {url: window.location.href, errorStack: error.stack, isCF: isCF});
		
	}, false);
	
	var context = this;
	addEventListener("unload", function(ev){
		if (ev.target === context){
			removeEventListener("DOMWindowCreated", interceptWrapper);
		}
	});
	addMessageListener("canvasBlocker-unload", function unload(){
		enabled = false;
		removeEventListener("DOMWindowCreated", interceptWrapper);
		removeMessageListener("canvasBlocker-unload", unload);
	});
}());
