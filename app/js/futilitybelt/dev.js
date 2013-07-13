'use strict';
var futilitybelt = futilitybelt || {};

(function(fu) {

	fu.dev = { };

	fu.dev.logger = {
		config: {
						
		},
		log: function(message, type) {
			if(type == 'force' || logger.config[type])
			{
				if(console && console.log)
				{
					console.log( JSON.stringify(message));
				}
			}
		}
	};

	var logger = fu.dev.logger;
})(futilitybelt)
