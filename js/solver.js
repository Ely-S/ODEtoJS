define(["js/vendor/numeric.js"], function(N){
	var Solver = function(start, end) {
		this.start = start;
		this.end = end;

	//	N.dopri(0,1,[3,0,4],function (x,y) { return [y[1], -y[0], y[2]]; });

	};

	Solver.prototype = {


		setFunction: function(func) {
			// must be a function of every dynamic variable
			this.func = func;
		},

		solve: function(alg) {
			alg = alg || "DOPRI";
			this[alg]();
		},

		state: function(state) {
			return this.state0 = state || this.state0;
		},


		dt: function(dt) {
			return this.dt = dt || this.dt;
		},

		DOPRI: function() {

			/*
			need to create Array of state0
			combine dfs to a single function that takes all of them,
			 	saves them,
			 	and returns them;
			 keep watchers working or change that
			 Plugin Solver to system

			*/

			this.dopri = numeric.dopri(this.start, this.end, this.state0, this.func);
			return this.dopri;

			/*

numeric.dopri(0, 1.2,[5,10], (function(){
    var a=1.0, b=0.2, p=0.04, c=0.5;      

 	return function(t, y) { write(t +" "+ y + "<br>");
	    var v = new Uint32Array(y.length);
	    v[0] = a*y[0] - b*y[0]*y[1];  
	    v[1] = p*y[0]*y[1] - c*y[1];   
	    return v;
  }
})() );

			*/

		},

		RK4: function() {

			// state is y

	       for (var i, y = this.state0, dt = this.dt, f = this.func, l = y.length,
	       		t= this.start, times = this.end; t<times; ++t)  {

	           t = dt*l;

			    var k1 = new Float32Array(l),
			      k2 = new Float32Array(l),
			      k3 = new Float32Array(l),
			      k4 = new Float32Array(l);

			/*
				var RK4 = function (x, h, y, f) {
					var k1 = h * f(x, y),
				        k2 = h * f(x + 0.5*h, y + 0.5*k1),
				        k3 = h * f(x + 0.5*h, y + 0.5*k2),
				        k4 = h * f(x + h, y + k3);
				        return x + h, y + (k1 + 2*(k2 + k3) + k4)/6.0
				};
			*/
			    
			    k1 = f(t, y); // Lotka-Voltarra as a function of y and t
			    
			    for (i=0; i<l; ++i)
			      // change x and y by the dt
			      k2[i] = y[i] + dt * k1[i]/2.0;
			    
			    k2 = f(t + dt / 2.0, k2);
			    
			    for (i=0; i<l; ++i)
			      k3[i] = y[i] + dt*k2[i]/2.0;
			    
			    k3 = f(t+dt/2.0, k3);
			    
			    for (i=0; i<l; ++i)
			      k4[i] = y[i] + dt*k3[i];
			    
			    k4 = f(t+dt, k4);
			    
			    for (i=0; i<l; ++i)
			      k1[i] = y[i] + dt *(k1[i] + 2.0 * (k2[i] + k3[i]) + k4[i]) /6.0;
			    
			    y = k1;
			}

		}

	};

	return Solver;

});