define(["variable", "output", "solver"], function(Variable, Output, Solver){
	"use strict";
	var sys = {
		watching: [],

		specs: {
			dt: .05,
			time: 100
		},

		run: function() {
			var t,
				dt = this.specs.dt,
				times = this.specs.time = Number($("#times").val())*(1/dt),
				go  = this.prepare(dt, times);

			solver = new Solver(0, time);
			solver.solve();

			this.views.view.done();
		},

		reset: function(){
			this.variables.map(function(v){
				v.reset()
			});
		},

		prepare: function(dt) {
			this.watching = Variable.variables.filter(function(e){
				return e.watching;
			});

			var actions = Variable.variables.map(function(v){
				v.compile();
				return v.calculate.bind(v, dt);
			});

			var saves = Variable.variables.map(function(v){
				return v.next.bind(v);
			});

			
			this.views.view.setup(this.watching);

			var streams = [];

			this.watching.forEach((function(w) {
				for (var a = 0, l = this.views.view.active.length; a < l; a++) {
					streams.push(this.views.view.active[a].dataStream(w.name, w.val)) 
				}
			}.bind(this)))
			
			var streamlength = streams.length,
			    varlength = Variable.variables.length;

			return function(t){
				for (var i = 0; i < varlength; i++ ) {
					actions[i](t*dt);
				}
				for (i = 0; i < varlength; i++ ) {
					saves[i]()
				}
				for (i = 0; i < streamlength; i++ ) {
					streams[i](t*dt);
				}
			};
		},
		views: new Output($("#output"))
	};
	return sys;
});
