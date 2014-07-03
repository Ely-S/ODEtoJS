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
				times = this.specs.time = Number($("#times").val()),//*(1/dt),
				go  = this.prepare(dt);

			solver = new Solver({
				start: 0,
				end: times,
				func: go,
				state0: _(Variable.variables).pluck("val").pluck("val").__wrapped__,
				dt: dt,
				callback: function(t, y){
					console.log(t, y);
				}
			});
			solver.solve("RK4");

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
			
			dynavars = _(Variable.variables).filter(function(v){ return v.static(); });

			varnames = dynavars.pluck("name").__wrapped__;

			body =  "return [" + dynavars.map(function(v){	return v.compile(varnames, dt); }).join(",") + "];";

			return new Function(varnames, body);
		},

		prepare: function(dt) {
			var streams, actions, saves, streams, streamlength, varlength;

			Variable.variables = _.sortBy(Variable.variables, "name");

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

			saves = Variable.variables.map(function(v){
				return v.next.bind(v);
			});

			
			streamlength = streams.length;
		    varlength = Variable.variables.length;

		    this.record = function(t, y){
		    	for (var i = 0; i < varlength; i++) {
		    		saves[i](t, y);
		    	}
		    	for (i = 0; i < streamlength; i++) {
		    		streams[i](t, y);
		    	}

		    };

		    return this.vectorize(dt);

/*			return function(t, y){
				var res = new Float32Array(y.length);
				for (var i = 0; i < varlength; i++ ) {
					res[i] = actions[i](t, y);
					saves[i]();
				}
				for (i = 0; i < streamlength; i++ ) {
					streams[i](t);
				}
				return res;
			};
*/
		},

		views: new Output($("#output"))
	};
	return sys;
});
