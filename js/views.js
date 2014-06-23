define(["system", "graphs", "js/rickshaw.min.js"], function(System, Graphs){
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
		this.graph = Graphs.new();
		this.setup = function(watching) {
			this.graph.create(watching.map(function(v){ return v.name; }))
		};
		this.dataStream = function(name, val){
			this.data = this.graph.getSeries(name).data;
			return (function(data, t){
				data.push({x: t, y: val.val});
			}).bind(this, this.data)
		};
		this.done = function() {
			this.graph.update();
		};
	});
	System.views.select("graph");

});