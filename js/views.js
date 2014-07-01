define(["system", "table", "graph", "output", "js/vendor/rickshaw.min.js"], function(System, Table, Graph){
	"use strict";
	System.views.new("console", function(){
		this.dataStream = function(name, val) {
			return function(t) {
				console.log(name, t, val.val);
			};
		};
		this.setup = function(){

		};
		this.done = function(){

		};
	});

	System.views.create("console");

	System.views.new("graph", Graph);

	System.views.new("table", Table);

});