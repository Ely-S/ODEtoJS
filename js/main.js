require("js/vendor/jquery-1.10.2.min.js svg variable flow system output js/vendor/shortcut.js views".split(" "),
function($, SVG, Variable, Flow, Sys, Graphs, Shortcut){
"use strict";

/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}

jQuery(function($){

var alphabet = {
	index: 97,
	next: function(){
		return String.fromCharCode(this.index++);
	}
};


var menu = {
	fl: false,
	init: function() {
		for (var btn in this.buttons) {
			$(btn).click(this.buttons[btn]);
		}
		for (var inp in this.inputs) {
			$(inp).change(this.inputs[inp]);
		}
	},
	inputs: {
		"#method": function(){
			Sys.specs.method = this.value
			$("#dt").attr("disabled", this.value == "DOPRI");

		},
		"#dt": function(){
			Sys.specs.dt = parseFloat(this.value);
		}
	},
	buttons: {
		"#save": function() {
			Sys.save();
		},
		"#load": function() {
			Sys.load();
		},
		"#btn-stock": function(){
			$("#workspace").one("click", function(e){
				var s = new Variable(alphabet.next(), e.clientX, e.clientY);
			});
		},
		"#btn-flow": function(){
			Flow.clicked = true;
		},
		"#run": Sys.run.bind(Sys)
	}
};


$("#workspace").click(function(e){
	var pos = $("#workspace > svg").position();
	if (e.ctrlKey) {
		e.stopPropagation();
		new Variable(alphabet.next(), e.clientX - pos.left, e.clientY - pos.top);
	}
}).click(function(e){
	// deselect
	if (Variable.selected && Variable.selected.rect.node != e.target && e.target.tagName != "INPUT")
		if (e.target.tagName == "div"  && e.target.className.indexOf("btn") != -1) 
			Variable.selected.deselect();
});

$(document).on("keypress", function(e) {
	if (e.charCode == 127) { // delete key
		if (Variable.selected)
			Variable.selected.delete();
	}
});

(function(x, y) {
	$("#editor").submit(function(e){
		e.preventDefault();
		var formula = $("#formula").val().split("="),
			f = Variable.find(formula[0]);
		if (formula.length < 2) return; 
		if (f) {
			f.dformula.save(formula[1]);
			f.makeLinks();
		} else {
			var v = new Variable(formula[0], x, y);
			v.formula = formula[1];
			v.value = $("#value").val().trim() || 0;
			v.reconstitute();
			y += 90;
	}
	});
}(50, 50));



var a= new Variable(alphabet.next(), 100, 200);
a.toggleWatch();

menu.init();
//$(".chart")[0].click();
//$("#run").click();

});

});
