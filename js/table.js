define(["js/vendor/tempo.js", "js/vendor/lodash.min.js"], function (tempo, _){
	var Table, template = Tempo.prepare("table-template");
	Table = function() {
		this.element = document.createElement("div");
		this.element.className = "statistics-table";
		this.template = template.into(this.element);
		this.setup([]);
	};

	Table.prototype = {
		setup: function(watching) {
			this.rows =  _(watching).pluck("name").sort().map(function(name){
				return new Table.prototype.Row(name);
			}).__wrapped__;
		},
	
		dataStream: function() {
			var l = this.rows.length, rows = this.rows;
			return function(t, y){
				for (var i = 0; i<l; i++) {
					rows[i].add(y[i]);
				}
			};

		},

		done: function(){
			this.render();
		},
		
		Row: function(name){
			this.name = name;
		},

		render: function() {
			var rows = this.rows.map(function(row) {
				row.stdDev();
				row.total();				
				return row
			});
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
		add: function(y) {
			if (y > this.max) this.max = y;
			if (y < this.min) this.min = y;
			if (this.n == 0) this.first = y
			this.last = y;
 		    this.n = this.n + 1
		    this.delta = y - this.mean;
		    this.mean = this.mean + this.delta/this.n;
		    this.M2 = this.M2 + this.delta * (y - this.mean);
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