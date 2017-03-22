 /* jslint moz: true */
 /* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(){
	"use strict";
	require("./stylePreferencePane");
	
	
	const {when: unload} = require("sdk/system/unload");
	const {check} = require("./check.js");
	const {notify} = require("./notifications");
	
	const _ = require("sdk/l10n").get;
	const lists = require("./lists");
	const preferences = require("sdk/simple-prefs");
	const prefService = require("sdk/preferences/service");
	const prefs = preferences.prefs;
	
	const notificationPref =  {
		doShow: function(){
			return prefs.showNotifications;
		},
		setShow: function(value){
			prefs.showNotifications = value;
			prefService.set("extensions.CanvasBlocker@kkapsner.de.showNotifications", prefs.showNotifications);
		}
	};
	
	/*
	 * https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Chrome_Authority
	 * Cc = An alias for Components.classes
	 * Ci = An alias for Components.interfaces
	*/
	const {Cc, Ci} = require("chrome");
	var globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
	var frameURL = require("sdk/self").data.url("frame.js?" + Math.random());
	globalMM.loadFrameScript(frameURL, true);
	
	var listeners = [];
	function addMessageListener(name, func){
		listeners.push({name, func});
		globalMM.addMessageListener(name, func);
	}
	unload(function(){
		globalMM.removeDelayedFrameScript(frameURL);
		globalMM.broadcastAsyncMessage("canvasBlocker-unload");
		listeners.forEach(function(listener){
			globalMM.removeMessageListener(listener.name, listener.func);
		});
	});
	
	// EJr:
	addMessageListener("GotLoadEvent", function (msg) {
		let isCF = msg.data.isCF;
		var browser = msg.target;
		if (isCF) {
			notify(msg.data, {lists, _, notificationPref, browser});
		}
	});
	
	// messages from the frame.js
	addMessageListener("canvasBlocker-check", function(ev){
		var status = check(ev.data);
		return status;
	});
	
	addMessageListener("canvasBlocker-notify", function(ev){
		var browser = ev.target;
		notify(ev.data, {lists, _, notificationPref, browser});
	});
	
	addMessageListener("canvasBlocker-pref-get", function(ev){
		return prefs[ev.data];
	});
	addMessageListener("canvasBlocker-pref-set", function(ev){
		prefs[ev.data.name] = ev.data.value;
		prefService.set("extensions.CanvasBlocker@kkapsner.de." + ev.data.name, ev.data.value);
	});
	
	addMessageListener("canvasBlocker-list-match", function(ev){
		return lists.get(ev.data.list).match(ev.data.url);
	});
	addMessageListener("canvasBlocker-list-appendTo", function(ev){
		return lists.appendTo(ev.data.list, ev.data.entry);
	});
	
	addMessageListener("canvasBlocker-translate", function(ev){
		return _(ev.data);
	});
	
}());
