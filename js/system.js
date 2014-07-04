define(["variable", "flow", "output", "solver", "js/vendor/lodash.min.js"], function(Variable, Flow, Output, Solver, _){
	"use strict";
	var sys = {
		watching: [],

		specs: {
			dt: .1,
			time: 100,
			method: "Euler"
		},

		run: function() {
			var t, solver,
				dt = this.specs.dt,
				times = this.specs.time = Number($("#times").val());

			solver = new Solver({
				start: 0,
				end: times,
				func: this.vectorize(dt),
				state0: _(Variable.variables).pluck("val").pluck("val").__wrapped__,
				dt: dt,
				callback: this.recorder()
			});
			
			solver.solve(this.specs.method);

			this.views.view.done();
		},

		reset: function(){
			this.variables.map(function(v){
				v.reset()
			});
		},

		vectorize: function(dt) {
			var dynavars, varnames, body, func;
			
			dynavars = _(Variable.variables).sortBy("name").filter(function(v){ return !v.static(); });

			varnames = dynavars.pluck("name").__wrapped__;

			body =  "return [" + dynavars.map(function(v){ return v.compile(varnames, dt); }).join(",") + "];";

			func = new Function(varnames, body);

			return func.apply.bind(func);

		},

		recorder: function() {
			var streams, streamlength;

			this.watching = Variable.variables.filter(function(e){
				return e.watching;
			});

			this.views.view.setup(this.watching);

			streams = _.map(this.views.view.active, function(view) {
				return view.dataStream();
			});

			streamlength = streams.length;

		    return function(t, y) {
		    	for (var i = 0; i < streamlength; i++) {
		    		streams[i](t, y);
		    	}
		    };

		},

		save: function() {
			var json = JSON.stringify(_.map(Variable.variables, function(v){
				return v.toJSON();
			}));
			localStorage.setItem("save", json);
		},

		load: function() {
			var state = JSON.parse(localStorage["save"]);
			if (state.length) {
				// clear
				_.forEach(Variable.variables, function(v){
					v.delete();
				});

				Variable.variables = [];

				_.map(state, function(v){
					var n = new Variable(v.name, v.x, v.y);
					_.assign(n, v);
					n.reconstitute();
					return n;
				}).forEach(function(n){
					_.forEach(n.linkNames, function(l) {
						new Flow("Flow", n.g, Variable.find(l).g);
					});
				});
			}

		},


		views: new Output($("#output"))
	};
	return sys;
});
