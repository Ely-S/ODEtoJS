define(["variable", "output"], function(Variable, Output){
	"use strict";
	var sys = {
		watching: [],
		run: function() {
			var t, times = Number($("#times").val()),
				go  = this.prepare(times);
			for (t = 0; t < times; t++ ) {
				go(t);
			};
			this.views.view.done();
		},

		reset: function(){
			this.variables.map(function(v){
				v.reset()
			});
		},

		prepare: function() {
			this.watching = Variable.variables.filter(function(e){
				return e.watching;
			});

			var actions = Variable.variables.map(function(v){
				v.compile();
				return v.calculate.bind(v);
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
					actions[i]();
				}
				for (i = 0; i < varlength; i++ ) {
					saves[i]()
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
