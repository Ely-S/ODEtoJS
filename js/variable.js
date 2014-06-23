define(["value", "svg", "editors"], function(Value, SVG, editors) {
	"use strict";

	var Variable = function(name, x, y) {
		var e;
		Variable.variables.push(this);
		this.links = [];
		this.create(name);
		for (e in this.events)
			this.g.on(e, this.events[e].bind(this));
		this.val = new Value(1);
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

		events: {
			click: function(e){
				if (e.shiftKey) {
					this.toggleWatch();
				}
			},
			mousedown: function() {
				document.onmousemove = (function(e) {
						this.g.move(e.x, e.y);
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
			var t = this,
				argnames = this.links.map(function(l){
					return l.other(this).name;
				});
				argnames.unshift(this.name);
			this.delta = new Function(argnames.join(","), "return " + formula);
			this.delta = this.delta.bind(this);
			return this;
		},

		compile: function() {
			// Wrap delta with the necessary arguments
			var delta = this.delta,
				vals = this.links.map(function(l){
					return l.other(this).val;
				});
			vals.unshift(this.val); // add this val to the begining
			this.dt = function() {
				return delta.apply(this, vals.map(function(v){ return v.val; }));
			};
			this.val.name = this.name;
		},

		calculate: function() {
			 return this.step = this.val.val + this.dt(); 
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
			this.text.move(10, 50);
			var textVal = new Value(this.text.text()),
				t = this;
			this.text.click((function(){
				editors.veditor.select(textVal, function(n){
					t.text.text(n);
					t.name = n;
					return n;
				});
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