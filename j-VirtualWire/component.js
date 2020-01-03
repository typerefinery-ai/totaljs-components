COMPONENT('virtualwire', 'selector:.virtualwire;delay:10', function(self, config) {

	var old, delay;

	self.restore = function() {
		if (old) {
			for (var i = 0; i < self.dom.children.length; i++) {
				var child = self.dom.children[i];
				old[0].appendChild(child);
			}
			var exec = old.attrd('out');
			exec && EXEC(exec);
			old = null;
		}
	};

	self.backup = function(el) {

		if (!el || !el.length) {
			self.restore();
			return;
		}

		if (old && old[0] === el[0])
			return;

		self.restore();

		var children = el[0].children;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			self.dom.appendChild(child);
		}

		old = el;
		var exec = el.attrd('in');
		exec && EXEC(exec);
	};

	self.setter = function(value) {

		if (!value) {
			self.restore();
			return;
		}

		delay && clearTimeout(delay);
		delay = setTimeout(function(value) {
			delay = null;
			self.backup($(config.selector + '[data-if="' + value + '"]'));
		}, config.delay, value);
	};

});