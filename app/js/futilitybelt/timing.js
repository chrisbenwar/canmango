'use strict';
var futilitybelt = futilitybelt || {};

(function(fu) {
	/**
	 * A colletion of tools to make timing and repetition
	 * easier.
	 */
	fu.timing = { };	

	/**
	 * @construtor
	 *
	 * Creates a repeater object. This has a start and stop method
	 * and will call a callback repeatedley while started.
	 */
	fu.timing.Repeater = function(callback, interval) {
		var that = this;
		this.running = false;
		this.callback = callback;
		this.timer = null;
		this.interval = interval;
	};

	var rep = fu.timing.Repeater;

	rep.prototype = {
		start: function()
		{
			this.timer = setInterval(this.callback, this.interval);
		},

		stop: function()
		{
			clearInterval(this.timer);
		}
	};

})(futilitybelt);
