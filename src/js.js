// utils
function loadJS( src, cb ){
	"use strict";
	var ref = window.document.getElementsByTagName( "script" )[ 0 ];
	var script = window.document.createElement( "script" );
	script.src = src;
	script.async = true;
	ref.parentNode.insertBefore( script, ref );
	if (cb && typeof(cb) === "function") {
		script.onload = cb;
	}
	return script;
}
(function() {
	'use strict';
	
	var _jPlayerURL ='https://apps.bostonglobe.com/common/js/jplayer/jquery.jplayer-2.9.2.min.js';
	
	var init = function() {
		loadLibrary(function(loaded) {
			if(!loaded) {
				$('.globe-audio-player').each(function() {
					createPlayer(this);
				});
			}
		});
	};

	var loadLibrary = function(cb) {
		if(!window.jQuery.jPlayer) {
			loadJS(_jPlayerURL, function() { cb(); });
		} else {
			cb('loaded');
		}
	};

	var createPlayer = function(el) {
		var $el = $(el);

    	var text = $el.attr('data-text');
    	var filepath = $el.attr('data-filepath');
        
        var html = '';
        html += '<button class="play">';
        html += '<div class="progress"></div>';
        html += '<span>' + text + '</span>';
        html += '</button>';
        html += '<div class="player"></div>';

        $el.append(html);
        
        Audio.setup($el, filepath);

        $el.find('button').on('click', Audio.toggle);
	};

	var getSource = function(filepath) {
		var path = filepath.trim();
		var test1 = '.mp3';
		var test2 = '/Boston';
		
		var invalid = path.indexOf(test1, path.length - test1.length) === -1 || path.indexOf(test2) !== 0;

		if(invalid) { 
			alert('Incorrect path to MP3. Make sure to paste entire path from "/Boston" through ".mp3".');
			return false;
		} else {
			if(window.location.hostname.indexOf('prdedit') > -1) {
				return 'http://prdedit.bostonglobe.com/r' + path;
			} else {
				var content = 'Content/';
				var webgraphics = '/WebGraphics/';

				var left = path.indexOf(content) + content.length;
				var right = path.indexOf(webgraphics);

				var section = path.substring(left, right);
				var end = path.substring(right + webgraphics.length, path.length);

				return 'https://c.o0bg.com/rw/Boston/2011-2020/WebGraphics/' + section + '/BostonGlobe.com/' + end;
			}
		}
	};

	var Audio = {
		dom: {},
		url: null,
		enabled: false,
		playing: false,
		loaded: false,
		toggling: false,
		sourceAdded: false,

		setup: function($el, filepath) {

			Audio.url = getSource(filepath);

			Audio.dom.button = $el.find('button');
			Audio.dom.player = $el.find('.player');
			Audio.dom.progress = $el.find('.progress');

			Audio.dom.player.jPlayer({
	            swfPath: 'https://apps.bostonglobe.com/common/js/jplayer/jquery.jplayer-2.9.2.swf',
	            loop: false,
	            supplied: 'mp3',
	            timeupdate: Audio.progress,
	            error: function(e) {
	            	console.log('audio error');
	            },
				abort: function(e) {
					console.log('audio abort');
				},
				play: function(e) {
					Audio.toggling = false;
					Audio.playing = true;
					Audio.setIcon('pause');
				},
				pause: function(e) {
					Audio.toggling = false;
					Audio.playing = false;
					Audio.setIcon('play');
				},
				ended: function(e) {
					Audio.playing = false;
					Audio.setIcon('play');
				}
	        });
		},

		load: function(params) {
			Audio.url = params.url + '.mp3';
			Audio.addedSource = false;
		},

		toggle: function() {
			var doToggle = function() {
				if(Audio.playing) {
					Audio.dom.player.jPlayer('pause');	
				} else {
					Audio.dom.player.jPlayer('play');
				}
			};

			if(!Audio.toggling) {
				Audio.toggling = true;

				if(!Audio.sourceAdded) {
					Audio.sourceAdded = true;
					Audio.dom.player.jPlayer('setMedia', { mp3: Audio.url });
				}
				
				if(!Audio.enabled) {
					Audio.enabled = true;
					if(isMobile.iOS()) {
						Audio.iosHackThePlanet(doToggle);
					} else {
						doToggle();
					}
				} else {
					doToggle();
				}
			}
		},

		iosHackThePlanet: function(cb) {
			 Audio.dom.player.jPlayer('setMedia', { mp3: 'https://apps.bostonglobe.com/common/audio/empty.mp3' })
			 	.jPlayer('pause');

			setTimeout(function() {
				Audio.dom.player.jPlayer('setMedia', { mp3: Audio.url });
		        cb();
			}, 30);
		},

		empty: function() {
			Audio.url = null;
			Audio.playing = false;
			Audio.loaded = false;
			Audio.toggling = false;
			Audio.sourceAdded = false;
		},

		progress: function(e) {
			var duration = e.jPlayer.status.duration;
			var position = e.jPlayer.status.currentTime;

			if(position > 0) {
				var percent = Math.floor(position / duration * 1000) / 10;
				var percentString = Math.min(percent, 100) + '%';
				
				Audio.dom.progress.css('width', percentString);
			}
		},

		setIcon: function(state) {
			if(state) {
				var remove = state === 'play' ? 'pause' : 'play';
				Audio.dom.button.removeClass(remove).addClass(state);	
			} else {
				Audio.dom.button.removeClass('play pause');
			}
		}
	};	

	var isMobile = { 
		Android: function() { return navigator.userAgent.match(/Android/i); }, 
		BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); }, 
		iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, 
		Opera: function() { return navigator.userAgent.match(/Opera Mini/i); }, 
		Windows: function() { return navigator.userAgent.match(/IEMobile/i); }, 
		any: function() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
	};

	init();
})();