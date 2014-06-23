define(["graph"], function (Graph) {
	var Graphs = function(parent) {
		this.el = parent.addClass("graphs");
	};
	Graphs.prototype = {
		graphs: [],
		new: function() {
			graph = new Graph();
			this.graphs.push(graph);
			this.el.append(graph.div);
			return graph;
		}
	};
	return new Graphs($("#graphs"));
//	return Graphs;
});