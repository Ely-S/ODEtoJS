require("js/vendor/jquery-1.10.2.min.js svg variable flow system output js/vendor/shortcut.js views js/vendor/foundation.min.js".split(" "),
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
		if (e.target.tagName == "svg"  || e.target.className.indexOf("btn") != -1) 
			Variable.selected.deselect();
});

$(document).on("keypress", function(e) {
	if (e.charCode == 127) { // delete key
		if (Variable.selected && Variable.selected.delselected)
			Variable.selected.delete();
	}
});

var Profiles = function() {
	var selprof = $(document.getElementsByName("profile"));

	selprof.html("<option value=''></option>");

	_(localStorage).keys().forEach(function(k){
		var d =  document.createElement("option");
		d.value = k;
		d.textContent = k;
		selprof.append(d);
	});
};

Profiles();

$("#load, #save").click(function(){
	$(document.getElementById(this.getAttribute("data-reveal-id")))
		.foundation("reveal", "open");
});

$(".selectProfile").on("click", ".btn", function(e){
	e.preventDefault();
	var profile = $("select", this.parentNode).val() || $("input", this.parentNode).val(),
		action = $(this).text();
	if (action == "Save") {
		Profiles();
		Sys.save(profile);
	} else if (action == "Load") {
		Sys.load(profile);
		$(document.getElementsByName("profile")).filter("select").val(profile);
	}
	$(this.parentNode).foundation("reveal", "close");
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
a.set("1");
menu.init();
//$(".graph").click();
//$("#load").click();
//$("#run").click();

});

});
