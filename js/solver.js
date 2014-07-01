define(["js/vendor/numeric.js"], function(N){
	var Solver = function(start, end) {
		this.start = start;
		this.end = end;

//	N.dopri(0,1,[3,0,4],function (x,y) { return [y[1], -y[0], y[2]]; });

		var func = function() { // must be a function of every dynamic variable

		};

	};

	Solver.prototype = {
		RK4: function(y, t, dt, f) {
		    var l = y.length, i,
		      c1[] = new new Float32Array(l);
		      c2[] = new new Float32Array(l);
		      c3[] = new new Float32Array(l);
		      c4[] = new new Float32Array(l);
		    
		    c1 = f(y, t); // Lotka-Voltarra as a function of y and t
		    
		    for (i=0; i<l; ++i)
		      // change x and y by the dt
		      c2[i] = y[i] + dt * c1[i]/2;
		    
		    c2 = f(c2, t + dt / 2);
		    
		    for (i=0; i<l; ++i)
		      c3[i] = y[i] + dt*c2[i]/2;
		    
		    c3 = f(c3, t+dt/2);
		    
		    for (i=0; i<l; ++i)
		      c4[i] = y[i] + dt*c3[i];
		    
		    c4 = f(c4, t+dt);
		    
		    for (i=0; i<l; ++i)
		      c1[i] = y[i] + dt *(c1[i] + 2 * (c2[i] + c3[i]) + c4[i]) /6;
		    
		    return c1;
		},

		DOPRI: function(){

			this.dopri = N.dopri(start, end, [3,0,4], function (x, ys) {

				/* call each delta with its arguments

				return deltas.map(function(d){
					return d.apply(ys);
				})

				*/

			});

		}
	};

	return Solver;

});