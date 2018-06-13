COMPONENT('importer', function(self, config) {

	var init = false;
	var clid = null;

	self.readonly();
	self.setter = function(value) {

		if (config.if !== value) {
			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);
			return;
		}

		if (clid) {
			clearTimeout(clid);
			clid = null;
		}

		if (init) {
			config.reload && EXEC(config.reload);
			return;
		}

		init = true;
		self.import(config.url, function() {
			config.reload && EXEC(config.reload);
		});
	};

	self.clean = function() {
		config.clean && EXEC(config.clean);
		setTimeout(function() {
			self.empty();
			init = false;
			clid = null;
		}, 1000);
	};
});