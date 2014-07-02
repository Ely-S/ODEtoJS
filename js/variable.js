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

	Variable.prototype = {
		watching: false,
		width: 80,
		height: 80,
		color: '#f06',
		value: 0,
		formula: "0",

		events: {
			click: function(e){
				if (e.shiftKey) {
					this.toggleWatch();
				}
			},
			mousedown: function() {
				document.onmousemove = (function(e) {
						this.g.move(e.clientX - 20, e.clientY - 20);
					this.links.forEach(function(e){
						e.move();
					});
				}).bind(this);
			},
			mouseup: function(){
				document.onmousemove = null;
			}
		},
		create: function(name){
			this.name = name;
			this.g = SVG.group();
			this.g.model = this;
			this.g.node.classList.add("variable");
			this.text = SVG.plain(name);
			this.rect = SVG.rect(this.width, this.height).attr({ fill: '#f06', rx: "15px" });
			this.g.add(this.rect);
			this.rect.node.model = this;
			this.rect.click((function(){
				editors.veditor.select(this.val, Number);
				editors.feditor.select(this.dformula);
			}).bind(this));
		},

		name: function(){
			this.text.text
		},

		connect: function(flow){
			this.links.push(flow);
		},

		delta: function() {
			return 1;
		},

		set: function(formula) {
			this.formula = formula;
		},

		compile: function(argnames) {
			var t = this,
				replaces = {},
				nonstatic = [];
//				argnames, vals;

				this.links.forEach(function(l){
					// replace static variables with their values
					var other = l.other(t);
					if (!other.formula || other.formula.trim() == "" || other.formula.trim() == "0") {
						replaces[other.name] = other.val.val;
					} else {
						nonstatic.push(other);
					}
				});

			// replace names with values for static params
			for (var name in replaces)
				this.formula = this.formula.replace(name, replaces[name]);

/*
				argnames = nonstatic.map(function(o){
					return o.name;
				});

				vals = nonstatic.map(function(o){
					return o.val;
				});

			// Wrap delta with the necessary arguments
			vals.unshift(this.val); // add this val to the begining
			argnames.unshift(this.name);

*/
			this.delta = new Function(argnames.join(","), "return " + this.formula);
			

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