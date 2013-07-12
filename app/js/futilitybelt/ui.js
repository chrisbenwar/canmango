'use strict';
var futilitybelt = futilitybelt || {};

(function(fu) {
	/**
	 * A collection of unusual ui controls.
	 */	
	fu.ui = { };

	/**
	 * Set up a html element so that when you click 
	 * on it it starts firing a callback until the 
	 * mouse is released.
	 */
	fu.ui.RepeatButton = function(elem, callback, interval)
	{
		var repeater = new fu.timing.Repeater(callback, interval);

		$(elem).mousedown(function() {
			repeater.start.call(repeater);
		})
		$(elem).bind('mouseup mouseleave', function() {
			repeater.stop.call(repeater);
		});
	};

	fu.ui.getElem = function(id)
	{
		return document.getElementById(id);
	};

})(futilitybelt);
