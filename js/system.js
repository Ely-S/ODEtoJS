define(["variable"], function(Variable){
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

			var view = this.views.view;
			
			this.views.view.setup(this.watching);

			var watchlength = this.watching.length,
			streams = this.watching.map(function(v){
				return view.dataStream(v.name, v.val);
			});


			var varlength = Variable.variables.length;

			return function(t){
				for (var i = 0; i < varlength; i++ ) {
					actions[i]();
				}
				for (i = 0; i < varlength; i++ ) {
					saves[i]()
				}
				for (i = 0; i < watchlength; i++ ) {
					streams[i](t);
				}
			};
		},
		views: {
			new: function(name, view) {
				this.views[name] = new view();
			},
			select: function(name) {
				this.view = this.views[name];
			},
			views: {},
			view: {}
		},
	};
	return sys;
});
