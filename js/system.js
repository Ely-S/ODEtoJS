define(["variable", "output", "solver", "js/vendor/lodash.min.js"], function(Variable, Output, Solver, _){
	"use strict";
	var sys = {
		watching: [],

		specs: {
			dt: 1,
			time: 100
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
				callback: this.watcher(dt)
			});
			solver.solve("DOPRI");

//			solver.DOPRI(0, times, _(Variable.variables).pluck("val").pluck("val").__wrapped__, go);

			this.views.view.done();
		},

		reset: function(){
			this.variables.map(function(v){
				v.reset()
			});
		},

		vectorize: function(dt) {
			var dynavars, varnames, body;
			
			dynavars = _(Variable.variables).sortBy("name").filter(function(v){ return v.static(); });

			varnames = dynavars.pluck("name").__wrapped__;

			body =  "return [" + dynavars.map(function(v){	return v.compile(varnames, dt); }).join(",") + "];";

			return new Function(varnames, body);
		},

		watcher: function(dt) {
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
		    	for (i = 0; i < streamlength; i++) {
		    		streams[i](t, y);
		    	}
		    };

		},

		views: new Output($("#output"))
	};
	return sys;
});
