define(["js/d3.layout.min.js", "js/vendor/jquery-ui.min.js", "js/rickshaw.min.js", "js/vendor/rick-extensions.js"], function(){
	var Graph = function () {
		this.element = $("<div>").addClass("graph-container")
			.html("<div class='graph'></div><div class='controls'></div>")[0];
	};
	Graph.prototype = {
		renderer: "line",
		width: 300,
		height: 500,

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

		render: function(){
			this.graph.render();
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
		},

		create: function(names){
			this.element.children[0].innerHTML="";
 			this.graph = new Rickshaw.Graph({
			  element: this.element.children[0],
			  renderer: this.renderer,
			  width: this.height,
			  height: this.width,
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
				while(data.length > 0)
			    	data.pop();
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
			var temp = $("#control-template"), graph = this.graph;
			$(this.el).find(".controls").html(temp[0].outerHTML)
				.find("form").removeClass("hidden");
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