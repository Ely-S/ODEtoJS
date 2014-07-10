define(["system", "table", "graph", "graph2", "output", "js/vendor/rickshaw.min.js"], function(System, Table, Graph, Graph2){
	"use strict";
	System.views.new("console", function(){
		this.dataStream = function() {
			return console.log.bind(console);
		};
		this.setup = function(){

		};
		this.done = function(){

		};
	});

//	System.views.create("console");

	System.views.new("graph", Graph);

	System.views.new("dygraph", Graph2);

	System.views.new("table", Table);

});