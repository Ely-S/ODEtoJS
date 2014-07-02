define(["variable", "output", "solver", "js/vendor/lodash.min.js"], function(Variable, Output, Solver, _){
	"use strict";
	var sys = {
		watching: [],

		specs: {
			dt: .05,
			time: 100
		},

		run: function() {
			var t, solver,
				dt = this.specs.dt,
				times = this.specs.time = Number($("#times").val()),//*(1/dt),
				go  = this.prepare();

			solver = new Solver(0, times);
			solver.setFunction(go);
			solver.state(_(Variable.variables).pluck("val").pluck("val").__wrapped__);
			solver.solve();

			this.views.view.done();
		},

		reset: function(){
			this.variables.map(function(v){
				v.reset()
			});
		},

		prepare: function() {
			var streams, actions, saves, streams, streamlength, varlength;

			this.watching = Variable.variables.filter(function(e){
				return e.watching;
			});

			this.views.view.setup(this.watching);

			streams = [];

			this.watching.forEach((function(w) {
				for (var a = 0, l = this.views.view.active.length; a < l; a++) {
					streams.push(this.views.view.active[a].dataStream(w.name, w.val)) 
				}
			}.bind(this)))

			var varnames = _(Variable.variables).pluck("name").sort().__wrapped__;

			actions = Variable.variables.map(function(v){
				v.compile(varnames);
				return v.calculate.bind(v);
			});

			saves = Variable.variables.map(function(v){
				return v.next.bind(v);
			});

			
			streamlength = streams.length;
		    varlength = Variable.variables.length;

			return function(t, y){
				for (var i = 0; i < varlength; i++ ) {
					actions[i](t, y);
					saves[i]();
				}
				for (i = 0; i < streamlength; i++ ) {
					streams[i](t);
				}
			};
		},
		views: new Output($("#output"))
	};
	return sys;
});
