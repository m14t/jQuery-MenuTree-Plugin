// 
/*!
 * jquery.plugin.menuTree.js v0.4
 * Copyright 2010, Bill Heaton http://pixelhandler.com
 *
 * Requires jquery version 1.4
 * http://jquery.com/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://docs.jquery.com/License
 *
 * Date: Sat Jan 30 5:00 GMT-8:00
 */
(function($) {
	$.fn.menuTree = function(options) {
		
		// default options
		$.fn.menuTree.defaults = { 
			animation: false, 
			handler: 'css',
			speed: 'fast',
			listElement: 'ul',
			hrefBegins: '#',
			trace: false
		};
		// extend default options with aruments on function call
		var opts = $.extend({}, $.fn.menuTree.defaults, options);
		// tree behavior only operates on anchor elements in the list that begin with a hash '#' unless options called for
		$.fn.menuTree.treeTargets = this.find("a[href^='"+opts.hrefBegins+"']");
		if (opts.trace) { $.fn.tracer.log("option :"+opts.hrefBegins+", amiation: "+opts.animation); }

		// select targets to reveal based on options we choose what list element to target default is 'ul'
		function selector(curTarget) {
			var $found;
			switch(opts.listElement) {
				case "dd":
					$found = $(curTarget).parent().next(opts.listElement);
					break;
				case "ol":
					$found = $(curTarget).next(opts.listElement);
					break;
				default: 
					$found = $(curTarget).next(opts.listElement);
			}
			if (opts.trace) { $.fn.tracer.log("find/hide: "+opts.listElement+", "+$found.text().substr(0,26).trim() + "..." ); }
			return $found;
		}
		
		// do the magic with the click event ...
		function clickHandler(event) {
			var $target = $(event.target);
			if (opts.trace) { $.fn.tracer.log($target.text()+": responsive, "+$target.data('responsive')); }
			// if data value is not ready bail out
			if (!$target.data('responsive')){
				return;
			}
			$target.stop();
			$target.data('state','transition');
			$target.trigger('statechange');
			// choose your animation behavior based on options passed to plugin instance
			if (!opts.animation) { // false uses CSS to handle effects
				$(this.treeReveal).toggleClass('collapsed');
				$target.toggleClass('expanded');
				$target.data('state','ready');
				$target.trigger('statechange');
			} else { // true uses opts.handler to choose effects
				
				switch(opts.handler) {
					case "slideToggle":
						$(this.treeReveal).slideToggle( opts.speed, function() {
							var $handler = $(this).prev('.menuTree');
							$handler.toggleClass('expanded');
							$handler.data('state','ready');
							$handler.trigger('statechange');
						});
						break;
					case "toggle":
						$(this.treeReveal).toggle( opts.speed, function() {
							var $handler = $(this).prev('.menuTree');
							$handler.toggleClass('expanded');
							$handler.data('state','ready');
							$handler.trigger('statechange');
						});
						break;
					default: 
						// css only, but if called with true we should do something
				}
			}
			event.preventDefault();
		}
		
		// set up listener controller function on window
		// used to prevent multiple clicks, click event is disabled during animation
		$.fn.menuTree.controller = function(event) {
			var $target = $(event.target);
			if ($target.data('state') != 'ready'){
				$target.data('responsive',false);
			} else {
				$target.data('responsive',true);
				// may need to collapse children
				if ($target.next(opts.listElement).find('.expanded').length > 0) {
					$target.next(opts.listElement).find('.expanded').each(function() {
						$(this).removeClass('expanded');
						$(this).next(opts.listElement).hide();
						if (opts.trace) { $.fn.tracer.log('collapsed: '+ $(this).text()); }
					});
				}
			}
		};
		
		// setup tree behavior and bind on controller
		return $.fn.menuTree.treeTargets.each(function() {
			
			var $localTarget = $(this);
			$localTarget.data({
				state: 'ready',
				responsive: true
			});
			// set behavior up on all .menuTree anchors create with plugin
			$localTarget.addClass('menuTree');

			// hide the child elements to reveal later
			this.treeReveal = selector($localTarget);
			$(this.treeReveal).toggleClass('collapsed');
			
			// set Click event handler for targets
			$localTarget.click(clickHandler);
			
			// bind the Controller to listen for state change on
			$('.menuTree').bind('statechange',$.fn.menuTree.controller);
			if (opts.trace) { 
				$.fn.tracer.log("target: "+$localTarget.text()+", state: "+$localTarget.data('state')+", responsive: "+$localTarget.data('responsive'));
			}
		});
		
	};
})(jQuery);