COMPONENT('parameters', 'search:Search;dateformat:yyyy-MM-dd;offset:5', function(self, config) {

	var cls = 'ui-parameters';
	var cls2 = '.ui-parameters';
	var container, search, scroller, prevh, skip;

	self.readonly();
	self.nocompile && self.nocompile();
	self.bindvisible();

	self.init = function() {
		Thelpers.ui_parameters_value = function(val, format) {
			if (val instanceof Date)
				return val.format(format);
			if (typeof(val) === 'number')
				return val;
			return val ? Thelpers.encode(val.toString()) : '';
		};
		Thelpers.ui_parameters_label = function() {
			return this.label || this.name;
		};
	};

	self.template = Tangular.compile('<div class="{0}-item{{ if modified }} {0}-modified{{ fi }}" data-index="{{ $.index }}" data-search="{{ $.search }}"><div class="{0}-value{{ if unit }} {0}-unit{{ fi }}{{ if invalid }} {0}-invalid{{ fi }}">{{ if unit }}<span>{{ unit }}</span>{{ fi }}{{ if type === \'boolean\' }}<div class="{0}-boolean">{{ if value }}true{{ else }}false{{ fi }}</div>{{ else }}<div><input class="{0}-input" data-type="{{ type }}" value="{{ value | ui_parameters_value(\'{1}\') }}" placeholder="{{ placeholder }}"/></div>{{ fi }}</div><div class="{0}-type">{{ type }}</div><div class="{0}-name">{{ name | ui_parameters_label }}</div></div>'.format(cls, config.dateformat));

	self.search = function() {
		var val = search.find('input').val().toSearch();
		search.find('i').rclass('fa-').tclass('fa-search', !val).tclass('fa-times', !!val);
		self.find(cls2 + '-item').each(function() {
			var el = $(this);
			el.tclass('hidden', val ? el.attrd('search').indexOf(val) === -1 : false);
		});
		self.scrollbar.resize();
	};

	self.resize = function() {
		var h = 0;

		if (config.height > 0)
			h = config.height;
		else if (config.parent)
			h = (config.parent === 'window' ? WH : config.parent === 'parent' ? self.parent().height() : self.closest(config.parent).height()) - search.height() - self.element.offset().top - config.offset;

		if (prevh === h)
			return;

		prevh = h;
		scroller.css('height', h);
		self.scrollbar.resize();
	};

	self.make = function() {

		self.aclass(cls + (config.hidetype ? (' ' + cls + '-hidetype') : ''));
		self.append('<div class="{0}-search"><span><i class="fa fa-search"></i></span><div><input type="text" placeholder="{1}" maxlength="50" class="{0}-searchinput" /></div></div><div class="{0}-scroller"><div class="{0}-container"></div></div>'.format(cls, config.search));
		container = self.find(cls2 + '-container');
		search = self.find(cls2 + '-search');
		scroller = self.find(cls2 + '-scroller');

		self.scrollbar = SCROLLBAR(scroller);

		search.on('keydown', cls2 + '-searchinput', function(e) {
			setTimeout2(self.ID, self.search, 300);
		});

		container.on('keydown', cls2 + '-input', function(e) {

			if (e.which !== 38 && e.which !== 40)
				return;

			var t = this;
			var type = t.getAttribute('data-type');
			if (type !== 'number' && type !== 'date')
				return;

			var row = $(t).closest(cls2 + '-item');
			var index = +row.attrd('index');
			var item = self.get()[index];
			var val = t.value;

			if (item.type === 'number') {
				val = val.replace(',', '.');
				val = +val;
			} else if (item.type === 'date')
				val = val.parseDate(config.dateformat);

			switch (e.which) {
				case 38: // up
					if (item.type === 'date')
						val = val.add('1 day').format(config.dateformat);
					else
						val += 1;
					e.preventDefault();
					break;
				case 40: // down
					if (item.type === 'date')
						val = val.add('-1 day').format(config.dateformat);
					else
						val -= 1;
					e.preventDefault();
					break;
			}

			this.value = val + '';
		});

		search.on('click', '.fa-times', function() {
			search.find('input').val('');
			self.search();
		});

		container.on('dblclick', cls2 + '-boolean', function() {

			var el = $(this).parent();
			var row = el.closest(cls2 + '-item');
			var index = +row.attrd('index');
			var item = self.get()[index];
			var indexer = { index: index, search: item.name.toSearch() };

			skip = true;

			item.value = !item.value;
			item.modified = item.prev !== item.value;
			row.replaceWith(self.template(item, indexer));
			item.modified && self.change(true);
			UPD(self.path, 2);
		});

		var skipblur = false;

		container.on('change blur', cls2 + '-input', function(e) {

			if (skipblur)
				return;

			if (e.type === 'change') {
				setTimeout(function() {
					skipblur = false;
				}, 300);
				skipblur = true;
			}

			var el = $(this);
			var row = el.closest(cls2 + '-item');
			var index = +row.attrd('index');
			var item = self.get()[index];
			var indexer = { index: index, search: item.name.toSearch() };
			item.value = el.val();

			switch (item.type) {
				case 'date':
					item.value = item.value ? item.value.parseDate(config.dateformat) : null;
					if (item.value && isNaN(item.value.getTime())) {
						item.invalid = true;
						item.value = item.prev;
					} else
						item.invalid = false;

					if (!item.invalid)
						item.invalid = (item.min ? item.min > item.value : false) || (item.max ? item.max < item.value : false);

					var a = item.value ? item.value.format(config.dateformat) : 0;
					var b = item.prev ? item.prev.format(config.dateformat) : 0;
					item.modified = a !== b;
					break;
				case 'number':
					var val = item.value.parseFloat();
					item.invalid = (item.min != null && val < item.min) || (item.max != null && val > item.max);
					if (!item.invalid)
						item.value = val;
					item.modified = item.value !== item.prev;
					break;
				default:
					item.modified = item.value !== (item.prev == null ? '' : item.prev);
					break;
			}

			row.replaceWith(self.template(item, indexer));
			item.modified && self.change(true);

			skip = true;
			UPD(self.path, 2);
		});

		self.on('resize', self.resize);
		self.resize();
		self.scrollbar.resize();
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		var builder = [];
		var indexer = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			indexer.index = i;
			indexer.search = item.name.toSearch();
			item.prev = item.type === 'date' && item.value ? item.value.format(config.dateformat) : item.value;
			builder.push(self.template(item, indexer));
		}

		container.html(builder.join(''));
		self.search();
		self.resize();
	};

});