define(["variable", "flow", "output", "solver", "datum", "js/vendor/lodash.min.js"], function(Variable, Flow, Output, Solver, Datum, _){
	"use strict";
	var sys = {
		watching: [],

		specs: {
			dt: .1,
			time: 100,
			method: "RK4"
		},

		run: function() {
			var t, solver,
				dt = this.specs.dt, now,
				times = this.specs.time = Number($("#times").val());

			// need to have a consistent order for function and recorder
			Variable.variables = _(Variable.variables).sortBy("name").sortBy("v.static");

			this.watching = Variable.variables.filter(function(e){
				return e.watching;
			});
			
			solver = new Solver({
				start: 0,
				end: times,
				func: this.vectorize(dt),
				state0: this.state0,
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
			var varnames, body, func, gencode, code;

			gencode = this.watching.map(function(v){ return v.compile(); })

			varnames = _(gencode.join().split(/[\*\+\-\/+\%\(\)\^ \<\>\(\)\,]+/g))
				.filter(function(x){
					return !(x.indexOf("?") > -1 || x=="Math.pow" || !isNaN(Number(x)));
				}).union(this.watching.pluck('name').__wrapped__).__wrapped__;

			// expressions must be in the order of the function arguments (varnames)
			code = gencode.sortBy(function(expression){
				// return the index of the variable in varnames with its expression
				for (var index, i = 0, vs=Variable.variables.__wrapped__, l = vs.length; i < l; i++) {
					if (vs[i].compile() === expression ) {
						index = varnames.indexOf(vs[i].name);
						console.log(index);
						if (index === -1) return varnames.length+1
						return index;
					}
				} 
			}).join();

			body =  "return [" + code + "];";

			func = new Function(varnames, body);

			this.state0 = _.map(varnames, function(v){
				return Number(Variable.find(v).val.val);
			});

			return func.apply.bind(func);

		},

		recorder: function() {

			var streams, streamlength;

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

		clear: function(){
			// clear
			Variable.variables.forEach(function(v){
				v.delete();
			});

			while(Variable.variables.pop()) ;
		},

		save: function(name) {
			var json = JSON.stringify(_(Variable.variables).map(function(v){
				return v.toJSON();
			}).__wrapped__);
			name = name || "save";
			localStorage.setItem(name, json);
		},

		load: function(profile) {
			if(localStorage[profile] === undefined) return;
			var state = JSON.parse(localStorage[profile]);
			if (typeof state == "object" && state.length) {

				this.clear();

				_.map(state, function(v){
					var n = new (v.static ? Datum : Variable)(v.name, v.x, v.y);
					_.assign(n, v);
					return n;
				}).forEach(function(v) {
					v.reconstitute();
				});
			}

		},

		// reads .stmx files
		read: function(file) {
			if (file.indexOf('<?xml version="1.0" encoding="utf-8" ?>')!=0) return; // The file is incompatible
			var fq = $(file.slice(40)),
				ss = fq.find("sim_specs"),
				model = fq.find("model"),
				variables = model.find("stock, aux"),
				flows = model.find("flow");

			this.clear(); // wipe slate clean

			_.map(variables, function(s){
				var d = s.querySelector("display"), qs, v; 

				if (s.tagName == "STOCK") {
					v = new Variable(s.getAttribute("name"), 1.2*Number(d.getAttribute("x")), 1.2*Number(d.getAttribute("y")));
				    v.color = d.getAttribute("color");				   

					qs = s.querySelectorAll("inflow");
				    if (qs.length) { // if there are inflows
					    v.formula = _.map(qs, function(i) {
					    		return _.find(flows, function(f){
					    			return f.getAttribute("name") == i.textContent;
					    		}).textContent.trim();
					    }).join(" + ");
					}

					qs = s.querySelectorAll("outflow");
				    if (qs.length) {
					    v.formula += " - " +
					    _.map(qs, function(i) {
					    		return _.find(flows, function(f){
					    			return f.getAttribute("name") == i.textContent;
					    		}).textContent.trim();
					    }).join(" - ");
					}

				} else {
					v = new Datum(s.getAttribute("name"), 1.2*Number(d.getAttribute("x")), 1.2*Number(d.getAttribute("y")));
				}

			    if (qs = s.querySelector("eqn")) v.value = qs.textContent;

				return v;
			}).forEach(function(v){
			    v.reconstitute();
			});


			$("#method").val(ss.attr("method"));
			$("#times").val(ss.find("stop").text());
			$("#dt").val(ss.find("dt").text());
		},

		views: new Output($("#output"))
	};
	return sys;
});
