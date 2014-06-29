define(function(){
	"use strict";
	var Editor = function(input) {
		this.input = $(input).change((function(e){
			this.value.save(this.cb(this.input.val()));
		}).bind(this)).show();
	};
	Editor.prototype.select = function(value, callback) {
		this.cb = callback || function(v){ return v; };
		this.input.val(value.val)
		this.value = value;
		return this
	};

	Editor.prototype.place = function(el) {
		this.input
			.css(el.getBoundingClientRect()) // overlap
			.width(100)
			.blur(function(){
				this.style.width = 0;		 // hide again
			});
	};

	return {
		veditor: new Editor("#value"),
		feditor: new Editor("#formula"),
		neditor: new Editor("#name")
	}
});