define(["js/vendor/lodash.min.js", "js/vendor/dygraphs.js"], function(_, Dygraphs){
	var Graph = function () {
		this.initialize();
//		this.create();
		//	$(this.element.children[0]).resizable(this.resize.bind(this));
	};
	Graph.prototype = {
		renderer: "line",
		width: 800,
		height: 500,
		labels: [],

		setup: function(watching) {
			this.labels = _(watching).pluck("val").pluck("name").__wrapped__;
			this.labels.unshift("x");
			this.data = [];
//			this.graph.updateOptions({labels: this.labels});
			this.create();
		},

		dataStream: function() {
			var l = this.labels.length, data = this.data;
			return function(t, y) {
				var n = [t];
				for (var i = 1; i<l; i++) {
					n[i] = y[i-1];
				}
				data.push(n);
			};
		},

		done: function() {
	        this.graph.updateOptions( { 'file': this.data } );
		},		

		resize: function() {

		},

		initialize: function() {
			this.data = [[0]];
			this.element = $("<div>").addClass("graph-container")
			.html("<div class='dyg graph'></div>")
			.width(this.wiwdth)
			.height(this.height)[0];
		},

		create: function(){
			this.graph = new Dygraph(this.element, this.data, {
				labels: this.labels,
                legend: 'always',
                logscale: false,
                animatedZooms: true
            });
		},

		randColor: function(){
			return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
		},


	}
	return Graph;
});