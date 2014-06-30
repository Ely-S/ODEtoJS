define(["js/vendor/d3.layout.min.js", "js/vendor/jquery-ui.min.js", "js/vendor/rickshaw.min.js", "js/vendor/rick-extensions.js"], function(){
	var Graph = function () {
		this.element = $("<div>").addClass("graph-container")
			.html("<div class='graph'></div><div class='controls'></div>")[0];
	};
	Graph.prototype = {
		renderer: "line",
		width: 500,
		height: 300,

		setup: function(watching) {
			this.create(watching.map(function(v){ return v.name; }))
		},

		dataStream: function(name, val){
			return (function(data, t){
				data.push({x: t, y: val.val});
			}).bind(this, this.getSeries(name).data)
		},

		done: function() {
			this.update();
			this.makeControls();
		},

		update: function() {
			this.graph.update();
			this.render();
		},		

		render: function(){
			this.graph.render();
			this.yAxis.render();
			this.xAxis.render();
		},

		initialize: function(type) {
			this.renderer = type || "line";
			this.graph = new Rickshaw.Graph({
				element: this.element.children[0],
				renderer: this.renderer,
				width: this.width,
				height: this.height,
				series: [{
					data: this.randPoints(),
					color: 'steelblue'
				}]
			});
			this.makeAxis();
		},

		create: function(names){
			// replace graph
			this.element.innerHTML="<div class='graph-container'>\
			<div class='graph'></div>\
			<div class='controls'></div></div>";
 			this.graph = new Rickshaw.Graph({
			  element: this.element.children[0],
			  renderer: this.renderer,
			  width: this.width,
			  height: this.height,
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
			this.makeAxis();
		},

		reset: function() {
			this.series.forEach(function(s){
				var data = s.data;
				while(data.pop()) {}
			});
		},

		makeAxis: function(){
			this.xAxis = new Rickshaw.Graph.Axis.X({
    			graph: this.graph,
			});

			this.yAxis = new Rickshaw.Graph.Axis.Y({
			    graph: this.graph,
			});
			this.yAxis.render();
			this.xAxis.render();
		},

		getSeries: function (name) { 
			return this.graph.series.filter(function(s){
				return s.name == name;
			})[0];
		},
		randColor: function(){
			return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
		},
		randPoints: function(length) {
			length = length || 10;
			var points = Array(length);
			while (length--) {
				points[length] = {
					x: length * 10,
					y: Math.floor(Math.random()*100)/3 + 30
				};
			}
			return points;
		},
		makeControls: function(){
			var graph = this.graph;
/*
			var preview = new Rickshaw.Graph.RangeSlider( {
				graph: graph,
				element: addDiv()
			} );
*/			
			

			var hoverDetail = new Rickshaw.Graph.HoverDetail( {
				graph: graph,
				xFormatter: function(x) {
					return x;
				}
			} );
/*

			var legend = new Rickshaw.Graph.Legend( {
				graph: graph,
				element: temp.find(".legend")[0]
			});


			var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
				graph: graph,
				legend: legend
			} );

			var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
				graph: graph,
				legend: legend
			} );

			var order = new Rickshaw.Graph.Behavior.Series.Order( {
				graph: graph,
				legend: legend
			} );

			var smoother = new Rickshaw.Graph.Smoother( {
				graph: graph,
				element: temp.find(".smoother")[0]
			} );

			var controls = new RenderControls( {
				element: temp.find("form")[0],
				graph: graph
			});*/


		}

	}
	return Graph;
});