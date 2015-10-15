define(["variable", "value", "svg", "editors", "js/vendor/lodash.min.js"], function(Variable, Value, SVG, editors, _) {

	var Datum = function() {
		Variable.apply(this, arguments);
		this.g.node.classList.add("datum");
	};

	Datum.prototype = _.create(Variable.prototype, {
		'constructor': Datum,

		rx: "15px",
		width: 40,
		height: 40,
		static: true,

		init: function() {
			this.val = new Value(1, name);
		},

		select: function() {
	  	  if(Variable.selected && Variable.selected !== this)
				Variable.selected.deselect();
			Variable.selected = this;
			this.selected = true;
			editors.halfmode();
			editors.veditor.select(this.val, this.onedit());
			this.delselected = true;
		},

		deselect: function() {
	   	    this.g.node.classList.remove("selected");
			editors.veditor.deselect();
		},

		compile: function() {

			if (!isNaN(Number(this.val.val)) && this.static) {
				// if val is a numeric string and there is no formula
				return this.val.val;
			}

			return Variable.prototype.compile.call(this, this.val.val)

		},

		reconstitute: function() {
			if (this.watching) {
				this.rect.node.classList.add("watching");	
			}
			this.val.val = this.value;
			this.makeLinks();
		}

	});

	return Datum;


});