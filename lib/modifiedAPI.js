 /* jslint moz: true, bitwise: true */
 /* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(){
	"use strict";
	
	// Ejr:
	const zPlus = require("./zPlus");
	
	function getFakeCanvas(window, original){
		var context = window.HTMLCanvasElement.prototype.getContext.call(original, "2d");
		var imageData, data, source;
		if (context){
			imageData = window.CanvasRenderingContext2D.prototype.getImageData.call(context, 0, 0, original.width, original.height);
			source = imageData.data;
		}
		else {
			context = 
				window.HTMLCanvasElement.prototype.getContext.call(original, "webgl") ||
				window.HTMLCanvasElement.prototype.getContext.call(original, "experimental-webgl") ||
				window.HTMLCanvasElement.prototype.getContext.call(original, "webgl2") ||
				window.HTMLCanvasElement.prototype.getContext.call(original, "experimental-webgl2");
			imageData = new window.wrappedJSObject.ImageData(original.width, original.height);
			source = new window.wrappedJSObject.Uint8Array(imageData.data.length);
			window.WebGLRenderingContext.prototype.readPixels.call(
				context,
				0, 0, original.width, original.height,
				context.RGBA, context.UNSIGNED_BYTE,
				source
			);
		}
		data = imageData.data;
		
		for (var i = 0, l = data.length; i < l; i += 1){
			var value = source[i];
			if (value >= 0x80){
				value = value ^ Math.floor(Math.random() * 0x20);
			}
			else if (value >= 0x40){
				value = value ^ Math.floor(Math.random() * 0x10);
			}
			else if (value >= 0x20){
				value = value ^ Math.floor(Math.random() * 0x08);
			}
			else if (value >= 0x10){
				value = value ^ Math.floor(Math.random() * 0x04);
			}
			else if (value >= 0x08){
				value = value ^ Math.floor(Math.random() * 0x02);
			}
			else if (value >= 0x04){
				value = value ^ Math.floor(Math.random() * 0x01);
			}
			data[i] = value;
		}
		var canvas = original.cloneNode(true);
		context = window.HTMLCanvasElement.prototype.getContext.call(canvas, "2d");
		context.putImageData(imageData, 0, 0);
		return canvas;
	}
	function getWindow(canvas){
		var win = canvas.ownerDocument.defaultView;
		zPlus.file_log_set(win);
		return win;
	}
	
	
	
	// changed functions and their fakes
	exports.changedFunctions = {
		getContext: {
			type: "context",
			object: "HTMLCanvasElement"
		},
		toDataURL: {
			type: "readout",
			object: "HTMLCanvasElement",
			fake: function toDataURL(imageType){
				var window = getWindow(this);
				
				// EJr:
				zPlus.log_save("1,,,SRC_1,,,toDataURL,,," + imageType +",,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
				var dataURL_orig = window.HTMLCanvasElement.prototype.toDataURL.apply(this);
				var dataURL_fake = window.HTMLCanvasElement.prototype.toDataURL.apply(getFakeCanvas(window, this), arguments);
				zPlus.log_save("2,,,SRC_0,,,toDataURL,,,dataURL_orig,,," + window.document.referrer + ",,," + this.baseURI + ",,," + this.width + ",,," + this.height + ",,," + dataURL_orig);
				zPlus.log_save("2,,,SRC_0,,,toDataURL,,,dataURL_fake,,," + window.document.referrer + ",,," + this.baseURI + ",,," + this.width + ",,," + this.height + ",,," + dataURL_fake);
				var str_msg=this.baseURI + '-width:' + this.width + '-height:' + this.height;
				var pg_label = zPlus.calcMD5_2(str_msg);
				var pg_valor = parseInt(window.localStorage.getItem(pg_label));
				var pg_label_is = zPlus.calcMD5_2(str_msg) + "isEmoji";
				var pg_valor_is = parseInt(window.localStorage.getItem(pg_label_is));
				var pg_label_not = zPlus.calcMD5_2(str_msg) + "notEmoji";
				var pg_valor_not = parseInt(window.localStorage.getItem(pg_label_not));
				if (   dataURL_orig.length > 995
					&& pg_valor > 0
					&& (pg_valor_not > 0 || (pg_valor_not < 1 && pg_valor_is < 1))
				) {
					if ( parseInt(this.width) > 16 &&  parseInt(this.height) > 16 ) {
						if (imageType != "junior") {
							var ctx = window.HTMLCanvasElement.prototype.getContext.call(this, "2d");
							var imageData = ctx.getImageData(0,0,this.width, this.height,"junior");
							var data = imageData.data;
							var nA=-7, nB=-7;
							var nColors = false;
							for (var i = 0; (i < data.length && ((nA == -7) || (nB == -7) || (nA == nB))); i += 4) {
								var nA = (data[i] + data[i + 1] + data[i + 2] + data[i + 3]);
								if ((nA != -7) && (nB != -7) && (nA != nB)) {
									nColors = true;
								} else {
									if (nA > -7) nB = nA;
								}
							}
							if ( nColors ) {
								zPlus.log_save("1,,,SRC_2,,,toDataURL,,," + imageType +",,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
								window.localStorage.removeItem(pg_label);
								window.localStorage.setItem('jCanvasFingerprint', true);
							}
						}
					}
				}
				
				if (imageType == "junior") {
					return dataURL_orig;
				} else {
					return dataURL_fake;
				}
			}
		},
		toBlob: {
			type: "readout",
			object: "HTMLCanvasElement",
			fake: function toBlob(callback){
				var window = getWindow(this);
				
				// EJr:
				zPlus.log_save("1,,,SRC_1,,,toBlob,,,,,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
				
				return window.HTMLCanvasElement.prototype.toBlob.apply(getFakeCanvas(window, this), arguments);
			},
			exportOptions: {allowCallbacks: true}
		},
		mozGetAsFile: {
			type: "readout",
			object: "HTMLCanvasElement",
			mozGetAsFile: function mozGetAsFile(callbak){
				var window = getWindow(this);
				
				// EJr:
				zPlus.log_save("1,,,SRC_1,,,mozGetAsFile,,,,,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
				
				return window.HTMLCanvasElement.prototype.mozGetAsFile.apply(getFakeCanvas(window, this), arguments);
			}
		},
		getImageData: {
			type: "readout",
			object: "CanvasRenderingContext2D",
			fake: function getImageData(sx, sy, sw, sh, fake_arg){
				var window = getWindow(this.canvas);
				
				// EJr:
				zPlus.log_save("1,,,SRC_1,,,getImageData,,,,,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
				
				// EJr:
				if (fake_arg == "junior") {
					var context = window.HTMLCanvasElement.prototype.getContext.call(this.canvas, "2d");
					return window.CanvasRenderingContext2D.prototype.getImageData.apply(context, arguments);
				} else {
					var context = window.HTMLCanvasElement.prototype.getContext.call(getFakeCanvas(window, this.canvas), "2d");
					var data = window.CanvasRenderingContext2D.prototype.getImageData.apply(context, arguments).data;
					var imageData = new window.wrappedJSObject.ImageData(sw, sh);
					for (var i = 0, l = data.length; i < l; i += 1){
						imageData.data[i] = data[i];
					}
					return imageData;
				}
			}
		},
		
		// EJr:
		fillText: {
			type: "junior",
			object: "CanvasRenderingContext2D",
			fake: function fillText(text, x, y, maxWidth){
				var window = getWindow(this.canvas);
				zPlus.log_save("4,,,SRC_4,,,fillText,,,"+this.fillStyle+"---"+text+"---"+x+"---"+y+",,," + window.document.referrer + ",,," + this.canvas.baseURI + ",,," + window.location);
				zPlus.log_save("1,,,SRC_0,,,fillText,,,,,," + window.document.referrer + ",,," + this.canvas.baseURI + ",,," + window.location);
				var str_msg=this.canvas.baseURI + '-width:' + this.canvas.width + '-height:' + this.canvas.height;
				var pg_label = zPlus.calcMD5_2(str_msg);
				var isText = text;
				var myRe1 = /[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]|\uD83C\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uD83C\uDDFE\uD83C[\uDDEA\uDDF9]|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDFC\uD83C[\uDDEB\uDDF8]|\uD83C\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uD83C\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF8\uDDFE\uDDFF]|\uD83C\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uD83C\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uD83C\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uD83C\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uD83C\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uD83C\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uD83C\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uD83C\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uD83C\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uD83C\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uD83C\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uD83C\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uD83C\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uD83C\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF]|\uD83C\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uD83C\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|[#\*0-9]\u20E3/g;
				var myArray = myRe1.exec(isText);
				var myString = isText.replace(myRe1, '');
				var pg_label_is = zPlus.calcMD5_2(str_msg) + "isEmoji";
				var pg_valor_is = parseInt(window.localStorage.getItem(pg_label_is));
				var pg_label_not = zPlus.calcMD5_2(str_msg) + "notEmoji";
				var pg_valor_not = parseInt(window.localStorage.getItem(pg_label_not));
				if (
					((     isText == String.fromCharCode( 55356, 57135 )
						|| isText == String.fromCharCode( 55356, 57221 )
						|| isText == String.fromCharCode( 55356, 56806, 55356, 56826 )
						|| isText == String.fromCharCode( 55356, 57331, 55356, 57096 )
						|| isText == String.fromCharCode( 55356, 57221, 55356, 57343 )
						|| isText == String.fromCharCode( 55356, 57331, 65039, 8205, 55356, 57096 )
						|| isText == String.fromCharCode( 55357, 56835 )
						|| isText == String.fromCharCode( 55358, 56631 )
					 )
					)
					|| (myArray != null && myArray.length == 1 && myString == "")
				) {
					myString = "";
					if ( pg_valor_is > 0 )
						pg_valor_is += 1;
					else
						pg_valor_is = 1;
					window.localStorage.setItem(pg_label_is, pg_valor_is);
				} else {
					if ( pg_valor_not > 0 )
						pg_valor_not += 1;
					else
						pg_valor_not = 1;
					window.localStorage.setItem(pg_label_not, pg_valor_not);
				}
				if (   parseInt(this.canvas.width) > 16
					&& parseInt(this.canvas.height) > 16
					&& ((myArray != null && myArray.length != 1) || myString != "")
				) {
					var pg_valor = parseInt(window.localStorage.getItem(pg_label));
					if ( pg_valor > 0 )
						pg_valor += 1;
					else
						pg_valor = 1;
					window.localStorage.setItem(pg_label, pg_valor);
				}
				return window.CanvasRenderingContext2D.prototype.fillText.apply(this, arguments);
			}
		},
		
		// EJr:
		strokeText: {
			type: "junior",
			object: "CanvasRenderingContext2D",
			fake: function strokeText(text, x, y, maxWidth){
				var window = getWindow(this.canvas);
				zPlus.log_save("1,,,SRC_0,,,strokeText,,,,,," + window.document.referrer + ",,," + this.canvas.baseURI + ",,," + window.location);
				var str_msg=this.canvas.baseURI + '-width:' + this.canvas.width + '-height:' + this.canvas.height;
				var pg_label = zPlus.calcMD5_2(str_msg);
				if ( parseInt(this.canvas.width) > 16 &&  parseInt(this.canvas.height) > 16 ) {
					var pg_valor = parseInt(window.localStorage.getItem(pg_label));
					if ( pg_valor > 0 )
						pg_valor += 1;
					else
						pg_valor = 1;
					window.localStorage.setItem(pg_label, pg_valor);
				}
				return window.CanvasRenderingContext2D.prototype.strokeText.apply(this, arguments);
			}
		},
		
		// EJr:
		fillRect: {
			type: "junior",
			object: "CanvasRenderingContext2D",
			fake: function fillRect(x, y, width, height){
				var window = getWindow(this.canvas);
				zPlus.log_save("4,,,SRC_4,,,fillRect,,,"+this.fillStyle+"---"+x+"---"+y+"---"+width+"---"+height+",,," + window.document.referrer + ",,," + this.canvas.baseURI + ",,," + window.location);
				return window.CanvasRenderingContext2D.prototype.fillRect.apply(this, arguments);
			}
		},
		
		// EJr:
		arc: {
			type: "junior",
			object: "CanvasRenderingContext2D",
			fake: function arc(x, y, radius, startAngle, endAngle, anticlockwise){
				var window = getWindow(this.canvas);
				zPlus.log_save("4,,,SRC_4,,,arc,,,"+this.fillStyle+"---"+x+"---"+y+"---"+radius+",,," + window.document.referrer + ",,," + this.canvas.baseURI + ",,," + window.location);
				return window.CanvasRenderingContext2D.prototype.arc.apply(this, arguments);
			}
		},
		
		readPixels: {
			type: "readout",
			object: "WebGLRenderingContext",
			fake: function readPixels(x, y, width, height, format, type, pixels){
				var window = getWindow(this.canvas);
				
				// EJr:
				zPlus.log_save("1,,,SRC_1,,,readPixels,,,,,," + window.document.referrer + ",,," + this.baseURI + ",,," + window.location);
				
				var context = window.HTMLCanvasElement.prototype.getContext.call(getFakeCanvas(window, this.canvas), "webGL");
				return window.WebGLRenderingContext.prototype.readPixels.apply(context, arguments);
			}
		}
	};
}());
