define(function(){
	"use strict";
	var  Value = function(val, name) {
		// Observable data
		this.watcher = function(){};
		this.val = this.default = val || 0;
		this.name = name;
	};

	Value.prototype = {
		name: "",
		
		reset: function() {
			this.constructor.call(this, this.default, this.name);
		},
		
		save: function(val) {
			this.val = val;
			this.change(val);
		},

		change: function(val) {
		  this.watcher.call(this, val);
		},

		watch: function(watcher) {
			this.watcher = watcher;
		} 

	};
	return Value;
});