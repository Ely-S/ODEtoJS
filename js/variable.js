define(["value", "svg", "editors", "js/vendor/lodash.min.js"], function(Value, SVG, editors, _) {
	"use strict";

	var Variable = function(name, x, y) {
		var e;
		Variable.variables.push(this);
		this.links = [];
		this.create(name);
		for (e in this.events)
			this.rect.on(e, this.events[e].bind(this));
		this.val = new Value(1, name);
		this.addText();
		this.g.move(x, y);
		this.dformula = new Value();
		this.dformula.watch(this.set.bind(this));
	};

	Variable.variables = [];

	Variable.find = function(name) {
		return _.findWhere(this.variables, {name: name});
	};

	Variable.prototype = {
		watching: false,
		width: 80,
		height: 80,
		color: '#f06',
		value: 0,
		formula: "0",

		toJSON: function() {
			var t = this;
			return {
				x: this.g.x(),
				y: this.g.y(),
				watching: this.watching,
				value: this.value,
				formula: this.formula,
				name: this.name,
				linkNames: _.map(this.links, function(l){
					return l.other(t).name;
				})
			};
		},

		events: {
			click: function(e){
				if (e.shiftKey) {
					this.toggleWatch();
				}
			}
		},

		reconstitute: function() {
			if (this.watching) {
				this.rect.node.classList.add("watching");	
			}
			this.rect.attr({fill: this.color});
			this.dformula.val =this.formula;
			this.val.val = this.value;
		},

		create: function(name){
			this.name = name;
			this.g = SVG.group();
			this.g.model = this;
			this.g.node.classList.add("variable");
			this.g.draggable();
			this.text = SVG.plain(name);
			this.rect = SVG.rect(this.width, this.height).attr({ fill: '#f06', rx: "15px" });
			this.g.add(this.rect);
			this.rect.node.model = this;
			this.rect.click((function(){
				editors.veditor.select(this.val, Number);
				editors.feditor.select(this.dformula);
			}).bind(this));
		},

		connect: function(flow){
			// prevent duplicates
			for (var i = 0, k = this.links, l = k.length; i < l; i++)
				if (k[i] && k[i].id === flow.id) return;
			this.links.push(flow);
		},

		delta: function() {
			return 1;
		},

		set: function(formula) {
			this.formula = formula;
		},

		static: function(){
			return (this.formula.trim() == "") || (this.formula.trim() == "0");
		},

		compile: function(argnames, dt) {
			var t = this, replaces = {};

				this.links.forEach(function(l){
					var other = l.other(t);
					if (other.static()) {
						replaces[other.name] = other.val.val;
					}
				});

			// replace names with values for static params
			for (var name in replaces)
				this.formula = this.formula.replace(name, replaces[name]);

			return this.formula;			

		},

		delete: function() {
			var l;
			while (l = this.links.pop()) {
				l.g.remove();
			}
			this.g.remove();
		},

		calculate: function(t, y) {
			var d = this.delta.apply(this, y); 
			this.step = this.val.val + d;
			return d; 
		},

		next: function() {
			this.val.save(this.step);
		},

		center: function(){
			return {
				x: (this.width / 2) + this.x,
				y: (this.height / 2) -this.y  
			};
		},

		addText: function() {
			this.g.add(this.text);
			this.text.move(10, -20);
			var textVal = new Value(this.text.text()),
				t = this;
			this.text.click((function(){
				editors.neditor.select(textVal, function(n){
					t.text.text(n).move(10, -20);
					t.name = n;
					return n;
				}).place(this.text.node);
			}).bind(this));
		},

		toggleWatch: function() {
			if (this.watching = !this.watching) {
				this.rect.node.classList.add("watching");
			} else {
				this.rect.node.classList.remove("watching");
			}
		}

	};

	return Variable;
});