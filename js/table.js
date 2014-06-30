define(["js/vendor/tempo.js"], function (tempo){
	var Table, template = Tempo.prepare("table-template");
	Table = function() {
		this.element = document.createElement("div");
		this.element.className = "statistics-table";
		this.template = template.into(this.element);
		this.data = {};
	};

	Table.prototype = {
		setup: function() {
			this.rows = {};
		},
	
		dataStream: function(name, val) {
			this.rows[name] = new this.Row(name);
			return this.rows[name].add.bind(this.rows[name], val);
		},

		done: function(){
			this.render();
		},
		
		Row: function(name){
			this.name = name;
		},

		render: function() {
			var i, rows = [];
			for (i in this.rows) {
				this.rows[i].stdDev();
				this.rows[i].total();				
				this.rows[i].name = i;
				rows.push(this.rows[i]);
			}
			this.template.render(rows);
		}


	};

	Table.prototype.Row.prototype =  {
		min: Math.min(),
		max: Math.max(),
		first: null,
		last: null,
		n: 0,
		mean: 0,
		M2: 0,
		add: function(val, x) {
			x = val.val;
			if (x > this.max) this.max = x;
			if (x < this.min) this.min = x;
			if (this.n == 0) this.first = x
			this.last = x;
 		    this.n = this.n + 1
		    this.delta = x - this.mean;
		    this.mean = this.mean + this.delta/this.n;
		    this.M2 = this.M2 + this.delta * (x - this.mean);
		},
		total: function(){
			this.sum = this.mean * this.n;
		},
		stdDev: function(){
		    if (this.n < 2) return 0;
		    return this.STDDev = this.M2 / (this.n - 1)
		}
	};

	return Table;
});