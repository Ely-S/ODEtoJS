define(["graph", "graph2", "system"], function (Graph, System) {
	var Output = function(parent) {
		this.el = parent.addClass("graphs");
		this.el.on("click", ".chart", (function(e){
			var g = this.create("graph");
			g.initialize($(e.target).text().trim());
//			g.update();
			e.preventDefault();
			e.stopPropagation();
		}).bind(this));
		this.el.on("click", ".table", (function(e){
			this.create("table").render();
			e.preventDefault();
		}).bind(this)).click(function(e){
		  $(this).width("95%").css("overflow-y", "auto");
		  $("#workspace").one("click", function(){
		  	$("#output").width("50px").css("overflow-y", "hidden");
		  });
		});
		this.el.on("click", ".graph", (function(e){
			this.create("dygraph");
		}).bind(this));

	};

	Output.prototype = {
		newGraph: function() {
			this.widgets.push(graph);
			return graph;
		},

		new: function(name, view) {
			this.views[name] = view;
		},
		create: function(name) {
			var v =  new this.views[name]();
			this.el.append(v.element);
			this.view.active.push(v);
			return v;
		},
		views: {},
		view: {
			active: [], // selected views
			setup: function(w){
				for (var i = 0, l = this.active.length; i < l; i++)
					this.active[i].setup(w)
			},
			done: function(){
				for (var i = 0, l = this.active.length; i < l; i++)
					this.active[i].done()
			}
		}
	};
	return Output;
});