define(["js/vendor/numeric.js"], function(N){
	var Solver = function(config) {

		_.assign(this, config);

		// Typed arrays are more efficient
		this.state0 = new Float32Array(this.state0);


	};

	Solver.prototype = {


		solve: function(alg) {
			alg = alg || "DOPRI";
			this[alg]();
		},

		Euler: function() {
			var i, t = this.start, times = this.end,
	       		cb = this.callback,
	       		y = this.state0, yn,
	       		dt = this.dt, f = this.func,
	       		l = y.length;

	       while(t<times) {

				cb(t, y);

	       		yn = f(t, y);

	       		for(i = 0; i < l; i++) {
	       			y[i] = y[i] + dt*yn[i];
	       		}

				t += dt;
	        }
	    },

		DOPRI: function() {

			this.dopri = numeric.dopri(this.start, this.end, this.state0, this.func, undefined, Infinity, this.callback);
			return this.dopri;

		},

		RK4: function() {

			// state is y
			var i,
	       		cb = this.callback,
	       		y = this.state0,
	       		dt = this.dt,
	       		f = this.func,
	       		l = y.length,
	       		t = this.start,
	       		k1,
	       		 k2 = new Float32Array(l),
	       		 k3 = new Float32Array(l),
	       		 k4 = new Float32Array(l),
	       		times = this.end;
	       	
	       	while (t < times) {
			    cb(t, y);

			    k1 = f(t, y);
			    
			    // loop through components of the vector
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
			      y[i] = y[i] + dt *(k1[i] + 2.0 * (k2[i] + k3[i]) + k4[i]) / 6.0;
			    
			 t+= dt;
			}

		}

	};

	return Solver;

});