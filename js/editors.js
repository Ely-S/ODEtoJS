define(function(){
	"use strict";
	var Editor = function(input) {
		this.input = $(input).change((function(e){
			if (this.selected)
				this.value.save(this.cb(this.input.val()));
		}).bind(this)).show();
	};
	Editor.prototype.select = function(value, callback) {
		var t = this;
		this.cb = callback || function(v){ return v; };
		this.input.val(value.val);
		this.selected = true;
		this.value = value;
		return this;
	};

	Editor.prototype.deselect = function() {
		this.selected = false;
	};

	Editor.prototype.place = function(el) {
		var t = this;
		this.input
			.css(el.getBoundingClientRect()) // overlap
			.width(100)
			.blur(function(){
				this.style.width = 0;		 // hide again
			});
	};

	Editor.prototype.selected = false;

	return {
		veditor: new Editor("#value"),
		feditor: new Editor("#formula"),
		neditor: new Editor("#name")
	}
});