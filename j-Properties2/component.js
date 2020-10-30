COMPONENT('properties2', 'datetimeformat:yyyy-MM-dd HH:mm;dateformat:yyyy-MM-dd;timeformat:HH:mm;modalalign:center;style:1;validation:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container;
	var types = {};
	var skip = false;
	var values, funcs;

	self.nocompile();
	self.bindvisible();

	self.validate = function(value) {

		if (config.validation) {
			for (var i = 0; i < value.length; i++) {
				if (value[i].invalid)
					return false;
			}
		}

		return true;
	};

	self.make = function() {

		self.aclass(cls + (config.style === 2 ? (' ' + cls + '-2') : ''));

		if (!$('#propertie2supload').length)
			$(document.body).append('<input type="file" id="properties2upload" />');

		self.append('<div><div class="{0}-container"></div></div>'.format(cls));
		container = self.find(cls2 + '-container');

		var keys = Object.keys(types);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			types[key].init && types[key].init();
		}
	};

	self.finditem = function(el) {
		var index = +$(el).closest(cls2 + '-item').attrd('index');
		return index >= 0 ? self.get()[index] : null;
	};

	self.findel = function(el) {
		return $(el).closest(cls2 + '-item');
	};

	self.modifyval = function(item) {
		values[item.name] = item.value;
		var items = self.get();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (!item.show)
				continue;
			var is = funcs[item.name + '_show'](values);
			self.find(cls2 + '-item[data-index="{0}"]'.format(i)).tclass('hidden', !is);
		}
	};

	self.register = function(name, init, render) {
		types[name] = {};
		types[name].init = init;
		types[name].render = render;
		init(self);
	};

	types.string = {};
	types.string.init = function() {

		self.event('click', cls2 + '-tstring', function() {
			var el = $(this);
			if (!el.hclass('ui-disabled'))
				el.find('input').focus();
		});

		self.event('change', '.pstring', function() {
			var t = this;
			var item = self.finditem(t);
			var val = t.value.trim();

			switch (item.transform) {
				case 'uppercase':
					val = val.toUpperCase();
					t.value = val;
					break;
				case 'lowercase':
					val = val.toLowerCase();
					t.value = val;
					break;
				case 'capitalize':
					var tmp = val.split(' ');
					for (var i = 0; i < tmp.length; i++)
						tmp[i] = tmp[i].substring(0, 1).toUpperCase() + tmp[i].substring(1);
					t.value = tmp.join(' ');
					break;
				case 'slug':
					val = val.slug();
					break;
			}

			var isvalid = item.required ? !!val : true;
			if (isvalid) {

				// Is RegExp?
				if (typeof(item.validate) === 'object') {
					isvalid = item.validate.test(val);
				} else {
					switch (item.validate) {
						case 'email':
							isvalid = val.isEmail();
							break;
						case 'phone':
							isvalid = val.isPhone();
							break;
						case 'url':
							isvalid = val.isURL();
							break;
					}
				}
			}

			var el = self.findel(t);

			if (isvalid) {
				item.value = val;
				item.changed = item.prev !== val;
				el.tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item);
				self.modifyval(item);
			}

			self.change(true);
			item.invalid = !isvalid;
			el.tclass(cls + '-invalid', item.invalid);
			t.$processed = true;
			item.required && self.validate2();
		});
	};

	types.string.render = function(item, next) {
		next('<div class="{0}-string"><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pstring"{4} /></div>'.format(cls, item.maxlength, item.placeholder || '', Thelpers.encode(item.value), item.disabled ? ' disabled' : ''));
	};

	types.password = {};
	types.password.init = function() {

		self.event('click', cls2 + '-tpassword', function() {
			var el = $(this);
			if (!el.hclass('ui-disabled'))
				el.find('input').focus();
		});

		self.event('focus', '.ppassword', function() {
			$(this).attr('type', 'text');
		});
		self.event('blur', '.ppassword', function() {
			$(this).attr('type', 'password');
		});
		self.event('change', '.ppassword', function() {
			var t = this;
			var item = self.finditem(t);
			var val = t.value.trim();

			var isvalid = item.required ? !!val : true;
			if (isvalid) {
				// Is RegExp?
				if (typeof(item.validate) === 'object')
					isvalid = item.validate.test(val);
			}

			var el = self.findel(t);

			if (isvalid) {
				item.value = val;
				item.changed = item.prev !== val;
				el.tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item);
				self.modifyval(item);
			}

			item.invalid = !isvalid;
			el.tclass(cls + '-invalid', item.invalid);
			t.$processed = true;
			self.change(true);
			item.required && self.validate2();
		});
	};
	types.password.render = function(item, next) {
		next('<div class="{0}-string"><input type="password" maxlength="{1}" placeholder="{2}" value="{3}" class="ppassword"{4} /></div>'.format(cls, item.maxlength, item.placeholder || '', Thelpers.encode(item.value), item.disabled ? ' disabled' : ''));
	};

	types.number = {};
	types.number.init = function() {

		self.event('click', cls2 + '-tnumber', function() {
			var el = $(this);
			if (!el.hclass('ui-disabled'))
				el.find('input').focus();
		});

		self.event('blur change', '.pnumber', function() {
			var t = this;

			if (t.$processed)
				return;

			var item = self.finditem(t);
			var val = t.value.trim();

			if (!val && item.value == null)
				return;

			var el = self.findel(t);
			var isvalid = true;

			val = val.parseFloat();

			if (item.min != null && val < item.min)
				isvalid = false;
			else if (item.max != null && val > item.max)
				isvalid = false;

			item.invalid = !isvalid;

			if (isvalid) {
				t.value =val + '';
				item.value = val;
				item.changed = item.prev !== val;
				el.tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item);
				self.modifyval(item);
			}

			el.tclass(cls + '-invalid', item.invalid);
			t.$processed = true;
			self.change(true);
			item.required && self.validate2();
		});

		self.event('keydown', '.pnumber', function(e) {
			var t = this;

			t.$processed = false;

			if (e.which === 38 || e.which === 40) {
				var num = t.value.parseFloat();
				var item = self.finditem(t);
				if (e.which === 38)
					num += item.inc || 1;
				else if (e.which === 40)
					num -= item.inc || 1;
				t.value = num;
				e.preventDefault();
			}

		});
	};
	types.number.render = function(item, next) {
		next('<div class="{0}-number"><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pnumber"{4} /></div>'.format(cls, 20, item.placeholder || '', Thelpers.encode((item.value == null ? '' : item.value) + ''), item.disabled ? ' disabled' : ''));
	};

	types.date = {};
	types.date.init = function() {

		self.event('click', cls2 + '-tdate', function() {
			var el = $(this);
			if (!el.hclass('ui-disabled'))
				el.find('input').focus();
		});

		self.event('blur change', '.pdate', function(e) {

			var t = this;

			if (e.type === 'change')
				SETTER('!datepicker', 'hide');

			if (t.$processed)
				return;

			var item = self.finditem(t);
			var val = t.value.parseDate(config.dateformat);
			item.value = val;
			item.changed = !item.prev || item.prev.format(config.dateformat) !== val.format(config.dateformat);
			self.findel(t).tclass(cls + '-changed', item.changed);
			config.change && self.EXEC(config.change, item, function(val) {
				t.value = val;
			});
			self.modifyval(item);
			self.change(true);
			item.required && self.validate2();
			t.$processed = true;
		});

		self.event('keydown', '.pdate', function(e) {
			var t = this;
			t.$processed = false;
			if ((e.which === 38 || e.which === 40) && t.value) {
				var val = t.value.parseDate(config.dateformat);
				var item = self.finditem(t);
				val = val.add((e.which === 40 ? '-' : '') + (item.inc || '1 day'));
				t.value = val.format(config.dateformat);
				e.preventDefault();
			}
		});

		self.event('click', '.pdate', function() {
			var t = this;
			var el = $(t);
			var opt = {};
			var item = self.finditem(t);
			opt.element = el.closest(cls2 + '-date').find('input');
			opt.value = item.value;
			opt.callback = function(value) {
				t.$processed = false;
				t.value = value.format(config.dateformat);
				el.trigger('change');
			};
			SETTER('datepicker', 'show', opt);
		});
	};
	types.date.render = function(item, next) {
		next('<div class="{0}-date"><i class="fa fa-calendar pdate"></i><div><input type="text" maxlength="{1}" placeholder="{2}" value="{3}" class="pdate" /></div></div>'.format(cls, config.dateformat.length, item.placeholder || '', item.value ? item.value.format(config.dateformat) : ''));
	};

	types.bool = {};
	types.bool.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tbool', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-booltoggle').trigger('click');
			});
		}

		self.event('click', cls2 + '-booltoggle', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var t = this;
			var el = $(t);
			var item = self.finditem(t);

			if (item.disabled)
				return;

			el.tclass('checked');
			item.value = el.hclass('checked');
			item.changed = item.prev !== item.value;
			self.findel(t).tclass(cls + '-changed', item.changed);
			config.change && self.EXEC(config.change, item);
			self.modifyval(item);
			self.change(true);
			item.required && self.validate2();
		});
	};
	types.bool.render = function(item, next) {
		next('<div class="{0}-bool"><span class="{0}-booltoggle{1}"><i></i></span></div>'.format(cls, item.value ? ' checked' : ''));
	};

	types.exec = {};
	types.exec.init = function() {
		self.event('click', cls2 + '-' + (config.style === 2 ? 't' : '') + 'exec', function() {
			var t = this;
			var el = $(t);
			var item = self.finditem(t);
			if (!item.disabled && item.exec)
				self.EXEC(item.exec, item, el);
		});
	};
	types.exec.render = function(item, next) {
		next('<div class="{0}-exec">{1}<i class="fa fa-angle-right"></i></div>'.format(cls, item.value ? Thelpers.encode(item.value) : ''));
	};

	types.text = {};
	types.text.render = function(item, next) {
		next('<div class="{0}-text">{1}</div>'.format(cls, item.value ? Thelpers.encode(item.value) : ''));
	};

	types.list = {};
	types.list.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tlist', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-list').trigger('click');
			});
		}

		self.event('click', cls2 + '-list', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var opt = {};
			opt.offsetY = -5;
			opt.element = $(t);
			opt.items = typeof(item.items) === 'string' ? item.items.indexOf('/') === -1 ? GET(item.items) : item.items : item.items;
			opt.custom = item.dircustom;
			opt.minwidth = 80;
			if (item.dirsearch)
				opt.placeholder = item.dirsearch;
			else if (item.dirsearch == false)
				opt.search = false;
			opt.callback = function(value) {

				if (typeof(value) === 'string') {
					opt.element.find('span').text(value);
					item.value = value;
				} else {
					opt.element.find('span').html(value[item.dirkey || 'name']);
					item.value = value[item.dirvalue || 'id'];
				}

				if (item.dircustom && item.dirappend !== false) {
					if (!opt.items)
						opt.items = [];
					if (opt.items.indexOf(item.value) === -1)
						opt.items.push(item.value);
				}

				item.changed = item.prev !== item.value;
				self.findel(t).tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item, function(val) {
					opt.element.find('span').text(val);
				});
				self.modifyval(item);
				self.change(true);
				item.required && self.validate2();
			};
			SETTER('directory', 'show', opt);
		});
	};

	types.list.render = function(item, next) {
		var template = '<div class="{0}-list">' + (config.style === 2 ? '' : '<i class="fa fa-chevron-down"></i>')  + '<span>{1}</span></div>';
		if (item.detail) {
			AJAX('GET ' + item.detail.format(encodeURIComponent(item.value)), function(response) {
				next(template.format(cls, response[item.dirkey || 'name'] || item.placeholder || DEF.empty));
			});
		} else {
			var arr = typeof(item.items) === 'string' ? GET(item.items) : item.items;
			var m = (arr || EMPTYARRAY).findValue(item.dirvalue || 'id', item.value, item.dirkey || 'name', item.placeholder || DEF.empty);
			next(template.format(cls, m));
		}
	};

	types.menu = {};
	types.menu.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tmenu', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-menu').trigger('click');
			});
		}

		self.event('click', cls2 + '-menu', function() {
			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var opt = {};
			if (config.style === 2)
				opt.align = 'right';
			opt.offsetY = -5;
			opt.element = $(t);
			opt.items = typeof(item.items) === 'string' ? item.items.indexOf('/') === -1 ? GET(item.items) : item.items : item.items;
			opt.callback = function(value) {

				if (typeof(value) === 'string') {
					opt.element.find('span').text(value);
					item.value = value;
				} else {
					opt.element.find('span').html(value[item.dirkey || 'name']);
					item.value = value[item.dirvalue || 'id'];
				}

				if (item.dircustom && item.dirappend !== false) {
					if (!opt.items)
						opt.items = [];
					if (opt.items.indexOf(item.value) === -1)
						opt.items.push(item.value);
				}

				item.changed = item.prev !== item.value;
				self.findel(t).tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item, function(val) {
					opt.element.find('span').text(val);
				});
				self.modifyval(item);
				self.change(true);
				item.required && self.validate2();
			};
			SETTER('menu', 'show', opt);
		});
	};

	types.menu.render = function(item, next) {
		var template = '<div class="{0}-menu">' + (config.style === 2 ? '' : '<i class="fa fa-chevron-down"></i>') + '<span>{1}</span></div>';
		if (item.detail) {
			AJAX('GET ' + item.detail.format(encodeURIComponent(item.value)), function(response) {
				next(template.format(cls, response[item.dirkey || 'name'] || item.placeholder || DEF.empty));
			});
		} else {
			var arr = typeof(item.items) === 'string' ? GET(item.items) : item.items;
			var m = (arr || EMPTYARRAY).findValue(item.dirvalue || 'id', item.value, item.dirkey || 'name', item.placeholder || DEF.empty);
			next(template.format(cls, m));
		}
	};

	types.color = {};
	types.color.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tcolor', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-colortoggle').trigger('click');
			});
		}

		self.event('click', cls2 + '-colortoggle', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var opt = {};
			// opt.offsetY = -5;
			// opt.offsetX = 6;
			opt.align = config.modalalign;
			opt.element = $(t);
			opt.callback = function(value) {
				opt.element.find('b').css('background-color', value);
				item.value = value;
				item.changed = item.prev !== item.value;
				self.findel(t).tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item, function(val) {
					opt.element.find('b').css('background-color', val);
				});
				self.modifyval(item);
				self.change(true);
				item.required && self.validate2();
			};
			SETTER('colorpicker', 'show', opt);
		});
	};
	types.color.render = function(item, next) {
		next('<div class="{0}-color"><span class="{0}-colortoggle"><b{1}>&nbsp;</b></span></div>'.format(cls, item.value ? (' style="background-color:' + item.value + '"') : ''));
	};

	types.fontawesome = {};
	types.fontawesome.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tfontawesome', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-fontawesometoggle').trigger('click');
			});
		}

		self.event('click', cls2 + '-fontawesometoggle', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var opt = {};
			opt.align = config.modalalign;
			opt.element = $(t);
			opt.callback = function(value) {
				opt.element.find('i').rclass().aclass(value);
				item.value = value;
				item.changed = item.prev !== item.value;
				self.findel(t).tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item, function(val) {
					opt.element.find('i').rclass().aclass(val);
				});
				self.modifyval(item);
				self.change(true);
				item.required && self.validate2();
			};
			SETTER('faicons', 'show', opt);
		});
	};
	types.fontawesome.render = function(item, next) {
		next('<div class="{0}-fontawesome"><span class="{0}-fontawesometoggle"><i class="{1}"></i></span></div>'.format(cls, item.value || ''));
	};

	types.emoji = {};
	types.emoji.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-temoji', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-emojitoggle').trigger('click');
			});
		}

		self.event('click', cls2 + '-emojitoggle', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var opt = {};
			opt.align = config.modalalign;
			opt.element = $(t);
			opt.callback = function(value) {
				opt.element.html(value);
				item.value = value;
				item.changed = item.prev !== item.value;
				self.findel(t).tclass(cls + '-changed', item.changed);
				config.change && self.EXEC(config.change, item, function(val) {
					opt.element.html(val);
				});
				self.modifyval(item);
				self.change(true);
				item.required && self.validate2();
			};
			SETTER('emoji', 'show', opt);
		});
	};
	types.emoji.render = function(item, next) {
		next('<div class="{0}-emoji"><span class="{0}-emojitoggle">{1}</span></div>'.format(cls, item.value || DEF.empty));
	};

	types.file = {};
	types.file.init = function() {

		if (config.style === 2) {
			self.event('click', cls2 + '-tfile', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).find(cls2 + '-file').trigger('click');
			});
		}

		self.event('click', cls2 + '-file', function(e) {

			e.preventDefault();
			e.stopPropagation();

			// Loads file
			var t = this;
			var item = self.finditem(t);

			if (item.disabled)
				return;

			var file = $('#propertiesupload');

			if (item.accept)
				file.attr('accept', item.accept);
			else
				file.removeAttr('accept');

			file.off('change').on('change', function() {
				var file = this;
				var data = new FormData();
				data.append('file', file.files[0]);
				SETTER('loading', 'show');
				UPLOAD(item.url, data, function(response) {
					item.value = response;
					item.changed = item.prev !== item.value;
					self.findel(t).tclass(cls + '-changed', item.changed);
					config.change && self.EXEC(config.change, item, function(val) {
						self.findel(cls2 + '-filename').text(val);
					});
					SETTER('loading', 'hide', 1000);
					file.value = '';
					self.modifyval(item);
					self.change(true);
					item.required && self.validate2();
				});
			}).trigger('click');
		});
	};

	types.file.render = function(item, next) {
		next('<div class="{0}-file"><i class="far fa-folder"></i><span class="{0}-filename">{1}</span></div>'.format(cls, item.filename || item.value || DEF.empty));
	};

	self.render = function(item, index) {

		var type = types[item.type === 'boolean' ? 'bool' : item.type];
		var c = cls;

		if (item.show) {
			if (!funcs[item.name + '_show'](values))
				c = 'hidden ' + c;
		}

		var meta = { label: item.label, type: item.type };

		if (item.icon) {
			var tmp = item.icon;
			var color;
			tmp = tmp.replace(/#[a-f0-9]+/gi, function(text) {
				color = text;
				return '';
			}).trim();
			if (tmp.indexOf(' ') === -1)
				tmp = 'fa fa-' + tmp;
			meta.icon = Tangular.render('<i class="{{ icon }}"{{ if color }} style="{{ type }}color:{{ color }}"{{ fi }}></i>', { icon: tmp, color: color, type: config.style === 2 ? 'background-' : '' });
		} else
			meta.icon = '';

		var el = $(('<div class="{2}-item{3} {2}-t{type}' + (item.required ? ' {2}-required' : '') + (item.icon ? ' {2}-isicon' : '') + (item.note ? ' {2}-isnote' : '') + '" data-index="{1}">' + (config.style === 2 ? '{{ icon }}<div>' : '') + '<div class="{0}-key">' + (config.style === 2 ? '' : '{{ icon }}') + '{{ label }}</div>' + (config.style === 2 ? '<div class="{0}-value">&nbsp;</div><div class="{0}-note">{1}</div>'.format(cls, Thelpers.encode(item.note)) : '<div class="{0}-value">&nbsp;</div>') + '</div>' + (config.style === 2 ? '</div>' : '')).format(cls, index, c, item.required ? (' ' + cls + '-required') : '').arg(meta));

		type.render(item, function(html) {

			if (item.note && config.style !== 2)
				html += '<div class="{0}-note">{1}</div>'.format(cls, item.note);

			el.find(cls2 + '-value').html(html);
			item.disabled && el.aclass('ui-disabled');

		}, el);

		return el;
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		if (!value)
			value = EMPTYARRAY;

		container.empty();

		var groups = {};

		values = {};
		funcs = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			var g = item.group || 'Default';

			item.invalid = false;

			if (!groups[g])
				groups[g] = { html: [] };

			switch (item.type) {
				case 'fontawesome':
				case 'string':
					item.prev = item.value || '';
					break;
				case 'date':
					item.prev = item.value ? item.value.format(config.dateformat) : null;
					break;
				// case 'number':
				// case 'bool':
				// case 'boolean':
				// case 'list':
				default:
					item.prev = item.value;
					break;
			}

			if (item.show)
				funcs[item.name + '_show'] = typeof(item.show) === 'string' ? FN(item.show) : item.show;

			values[item.name] = item.value;

			if (item.required)
				item.invalid = !item.value;

			groups[g].html.push(self.render(item, i));
		}

		var keys = Object.keys(groups);
		for (var i = 0; i < keys.length; i++) {

			var key = keys[i];
			var group = groups[key];
			var hash = 'g' + HASH(key, true);
			var el = $('<div class="{0}-group" data-id="{2}"><label>{1}</label><section></section></div>'.format(cls, key, hash));
			var section = el.find('section');

			for (var j = 0; j < group.html.length; j++)
				section.append(group.html[j]);

			container.append(el);
		}

		self.validate2();
	};

});