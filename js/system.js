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
				dt = this.specs.dt, now,
				times = this.specs.time = Number($("#times").val());

			solver = new Solver({
				start: 0,
				end: times,
				func: this.vectorize(dt),
				state0: _(Variable.variables).pluck("val").pluck("val").__wrapped__,
				dt: dt,
				callback: this.recorder()
			});

			now = _.now()

			solver.solve(this.specs.method);

			console.log("Integration", _.now() - now);

			this.views.view.done();

			console.log("Display", _.now() - now);
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

		load: function(state) {
			var state = state || JSON.parse(localStorage["save"]);
			if (state.length) {
				// clear
				_.forEach(Variable.variables, function(v){
					v.delete();
				});

				Variable.variables = [];

				_.map(state, function(v){
					var n = new Variable(v.name, v.x, v.y);
					_.assign(n, v);
					return n;
				}).forEach(function(v) {
					v.reconstitute();
				});
			}

		},


		views: new Output($("#output"))
	};
	return sys;
});
