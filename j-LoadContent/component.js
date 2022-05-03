COMPONENT('loadcontent', 'wait:0;replace:SCR', function(self, config) {

	self.readonly();
	self.blind();

	self.make = function() {
		var template = $(config.selector);
		if (template.length) {
			var reg = new RegExp(config.replace, 'g');
			self.html(template.html().replace(reg, 'scr' + 'ipt'));
			COMPILE();
			config.exec && self.SEEX(config.exec, self.element);
		} else if (config.wait && self.dom)
			setTimeout(self.make, config.wait);
	};

});