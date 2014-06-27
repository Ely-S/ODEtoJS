define(["system", "table", "graph", "output", "js/rickshaw.min.js"], function(System, Table, Graph){
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

	System.views.new("graph", function(){
		this.graph = new Graph();
		this.setup = function(watching) {
			this.graph.create(watching.map(function(v){ return v.name; }))
		};
		this.dataStream = function(name, val){
			return (function(data, t){
				data.push({x: t, y: val.val});
			}).bind(this, this.graph.getSeries(name).data)
		};
		this.done = function() {
			this.graph.update();
			this.graph.makeControls();
		};
		return this.graph;
	});

	System.views.new("table", Table);

});