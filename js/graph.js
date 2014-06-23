define(["js/d3.layout.min.js", "js/rickshaw.min.js"], function(){
	var Graph = function () {
		this.div = document.createElement("div");
		this.div.className="graph";
	};
	Graph.prototype = {
		render: function(){
			this.graph.render();
		},
		create: function(names){
			this.graph = new Rickshaw.Graph({
			  element: this.div,
		      renderer: "line",
		      width: 500,
		      height: 300,
			  stroke: true,
		      preserve: true,
			  series: names.map(function(name){
			  	return {
			  		color: Graph.prototype.randColor(),
			  		name: name,
			  		data: []
			  	};
			  })
			});
		},
		update: function() {
			this.graph.update();
			this.graph.render();
		},
		getSeries: function (name) { 
			return this.graph.series.filter(function(s){
				return s.name == name;
			})[0];
		},
		randColor: function(){
			return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
		}


	}
	return Graph;
});