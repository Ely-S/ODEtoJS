define(["flow", "value", "svg", "editors", "js/vendor/lodash.min.js"], function(Flow, Value, SVG, editors, _) {
	"use strict";

	var operators = "(^|$|[\*\+\-\/+\%\(\)\^ \<\>]+)";

	var Variable = function(name, x, y) {
		Variable.variables.push(this);
		this.links = [];
		this.create(name, x, y);
		for (var e in this.events)
			this.rect.on(e, this.events[e].bind(this));
		this.addText();
		this.init();
		this.compiled = {}; // to memoize
	};

	Variable.variables = [];

	Variable.find = function(name) {
		return _(this.variables).find({name: name});
	};

	Variable.prototype = {
		watching: false,
		width: 50,
		height: 50,
		value: 0,
		formula: "",
		rx: "4px",

		init: function(){
			// initializes data
			this.val = new Value(1, name);
			this.dformula = new Value();
			this.dformula.watch(this.set.bind(this));
		},

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
				// move this to top layer
				SVG.node.appendChild(this.g.node);
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
			this.selected = true;
			Variable.selected = this;
			editors.fullmode();
			editors.veditor.select(this.val, this.onedit());
			editors.feditor.select(this.dformula, this.onedit());
			// should user hit the delete key now. Delete this
			this.delselected = true;
		},

		onedit: function() {
			return (function(){
				this.makeLinks();
				this.deadLinks();
			}).bind(this);
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

		deadLinks: function() {
			// remove unnecessary links
			var linkNames = this.linkNames(), t = this;
			linkNames.push(this.name);
			_(this.links).filter(function(l){
				return linkNames.indexOf(l.other(t).name) + l.other(t).linkNames().indexOf(t.name) == -2 ;
			}).forEach(function(l){
				l.delete();
			});
		},

		linkNames: function() {
			return _((this.formula +" "+this.val.val).split(/[\*\+\-\/+\%\(\)\^ \<\>\(\)]+/g))
				.filter(function(v){
					return isNaN(Number(v)); // Remove numbers
				}).uniq();
		},

		makeLinks:  function() {
			var g = this.g, links=this.links;
			this.linkNames().forEach(function(n) {
				// prevent duplicates
//				for (var fn, i = 0, l = links.length; i < l; i++)
//					if (links[i].other(this).name === n) return;
				var fn = Variable.find(n);
				if(fn && fn.g) new Flow("Flow", g, fn.g);
			});
		},

		create: function(name, x ,y){
			this.name = name;
			this.g = SVG.group();
			this.g.model = this;
			this.g.node.classList.add("variable");
			this.g.draggable().dragmove = (function(){
				for (var i = 0, k = this.links, l = k.length; i < l; i++)
					k[i].move();
			}).bind(this);
			this.text = SVG.plain(name);
			this.rect = SVG.rect(this.width, this.height).attr({ rx: this.rx });
			this.g.add(this.rect);
			this.rect.node.model = this;
			this.g.move(x, y);
		},

		connect: function(flow){
			this.links.push(flow);
		},

		discronnect: function(flow){
			this.links = _.without(this.links, flow);
			return this;
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

		compile: function(formula) {

			var key, formula = key = formula || this.formula;

			if (this.compiled[formula]) return this.compiled[formula]; 

			// prevent it from compiling itself later
			this.compiling = true;

			this.linkNames().forEach(function(l){
				var reg, rep,  other = Variable.find(l);
				if (other && !other.compiling && other.static()) {
					reg = new RegExp([operators, "(", other.name, ")", operators].join(""), "g"),
					rep = "$1("+other.compile()+")$3";
					// not all browser accept the g flag to the RegExp constructor
					while (formula.indexOf(other.name)!==-1) {
						formula = formula.replace(reg, rep);
					}
				}
			});

			this.compiling = false;

			// replace exponential operator with Math.pow
			// convert IF THEN ELSE to ? : expression
			formula = formula.replace(/(\w+)\^(\w+)/g, "Math.pow($1, $2)")
							.replace(/IF\s+(.*)\s+THEN\s+(.*)\s+ELSE\s+(.*)/g, "$1?$2:$3");

			return this.compiled[key] = formula;

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