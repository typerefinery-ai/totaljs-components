COMPONENT('autodarkmode', function(self, config) {

	self.readonly();
	self.singleton();
	self.blind();

	self.make = function() {

		var body = $('body');
		var match = W.matchMedia('(prefers-color-scheme: dark)');

		match.addEventListener('change', function(e) {
			body.tclass('ui-dark', e.matches);
			config.exec && self.SEEX(config.exec, match.matches);
		});

		body.tclass('ui-dark', match.matches);
		config.exec && self.SEEX(config.exec, match.matches);
	};

});