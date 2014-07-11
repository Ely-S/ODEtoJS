define(["flow", "value", "svg", "editors", "js/vendor/lodash.min.js"], function(Flow, Value, SVG, editors, _) {
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
		return _.find(this.variables, {name: name});
	};

	Variable.prototype = {
		watching: false,
		width: 60,
		height: 60,
		value: 0,
		formula: "",

		toJSON: function() {
			var t = this;
			return {
				x: this.g.x(),
				y: this.g.y(),
				watching: this.watching,
				value: this.val.val,
				formula: this.formula,
				name: this.name
			};
		},

		events: {
			click: function(e){
				e.stopPropagation();
				this.select();
				this.g.node.classList.add("selected");
				if (Flow.waiting) {
					Flow.waiting.connect(this.g);
				} else if (e.shiftKey) {
					this.toggleWatch();
				} else if (e.ctrlKey  || Flow.clicked) {
					Flow.clicked = false;
					if (!Flow.waiting) {
						new Flow.connection(this.g);
					}
				}
			},
			mouseout: function(){
				this.delselected = false;
			}
		},

		select: function() {
			if (Variable.selected) Variable.selected.deselect();
			this.selected = true;
			Variable.selected = this;
			// should user hit the delete key now. Delete this
			this.delselected = true;
		},

		deselect: function() {
   		    this.g.node.classList.remove("selected");
			editors.veditor.deselect();
			editors.feditor.deselect();
		},

		reconstitute: function() {
			if (this.watching) {
				this.rect.node.classList.add("watching");	
			}
			this.dformula.val = this.formula;
			this.val.val = this.value;
			this.makeLinks();
		},

		linkNames: function() {
			return _.filter(this.formula.replace(/[\W\d]/g, "\n").split("\n"));
		},

		makeLinks:  function() {
			var linkNames = this.linkNames(),
			    g = this.g, k=this.links;
			_.forEach(linkNames, function(n) {
				// prevent duplicates
				for (var fn, i = 0, l = k.length; i < l; i++)
					if (k[i].other(this).name === n) return;
				fn = Variable.find(n);
				if(fn && fn.g) new Flow("Flow", g, fn.g);
			});
		},

		create: function(name){
			this.name = name;
			this.g = SVG.group();
			this.g.model = this;
			this.g.node.classList.add("variable");
			this.g.draggable().dragmove = (function(){
				for (var i = 0, k = this.links, l = k.length; i < l; i++)
					this.links[i].move();
			}).bind(this);
			this.text = SVG.plain(name);
			this.rect = SVG.rect(this.width, this.height).attr({ rx: "15px" });
			this.g.add(this.rect);
			this.rect.node.model = this;
			this.rect.click((function(){
				editors.veditor.select(this.val);
				editors.feditor.select(this.dformula);
			}).bind(this));
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

		static: function(){
			return (this.formula.trim() == "") || (this.formula.trim() == "0");
		},

		compile: function(argnames, dt) {

			var t = this, replaces = {},
			    operators = "(^|$|[\*\+\-\/+\%\(\) \<\>]+)";

				this.links.forEach(function(l){
					var other = l.other(t);
					if (other.static()) {
						replaces[other.name] = other.val.val;
					}
				});

			// TODO BUG: what if it replaces a name with one or more names
			for (var name in replaces) {
				var reg = new RegExp([operators, "(", name, ")", operators].join(""), "g");
				this.formula = this.formula.replace(reg, "$1("+replaces[name]+")$3");
			}

			if (this.formula.indexOf("IF ") > -1) {
				this.formula=this.formula.replace(/IF\s+(.*)\s+THEN\s+(.*)\s+ELSE\s+(.*)/, "$1?$2:$3");
			}

			return this.formula;			

		},

		delete: function() {
			var l;
			while (l = this.links.pop()) {
				l.g.remove();
			}
			this.g.remove();
			Variable.variables = _.reject(Variable.variables, this);
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
			this.textVal = textVal;
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