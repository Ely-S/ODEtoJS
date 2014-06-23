define(function(){
	"use strict";
	var Editor = function(input) {
		this.input = $(input).change((function(e){
			this.value.save(this.cb(this.input.val()));
		}).bind(this));
	};
	Editor.prototype.select = function(value, callback) {
		this.cb = callback || function(v){ return v; };
		this.input.val(value.val)
		this.value = value;
	};
	return {
		veditor: new Editor("#value"),
		feditor: new Editor("#formula")
	}
});