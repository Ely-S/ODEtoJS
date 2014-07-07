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
			$("g").one("click", function(e){
				Flow.waiting(this);
			});
		},
		"#run": Sys.run.bind(Sys)
	}
};


$("#workspace").on("click", ".variable", function(e){
	if (e.ctrlKey) {
		e.stopPropagation();
		if (!Flow.fl) {
			Flow.fl = Flow.waiting(this);
		}
	}
}).click(function(e){
	var pos = $("#workspace > svg").position();
	if (e.ctrlKey) {
		e.stopPropagation();
		new Variable(alphabet.next(), e.clientX - pos.left, e.clientY - pos.top);
	}
});



var timeout, out = false;
$(".output").hover(function(){
	clearTimeout(timeout);
	if (!out) {
		$("#output").css({width: "95%"});
		$(".workspace-toolbar").hide();
		$(".output-toolbar").show();
		out = true;
	}
}, function(){
	timeout = setTimeout(function(){
		$("#output").animate({width: "20px"}, 'fast');
		$(".workspace-toolbar").show();
		$(".output-toolbar").hide();
		out = false;
	}, 300);
});

// select things and select for deletion.
var selected, delselected;
$("svg").on("click", ".flow, .variable", function(e){
	e.stopPropagation();
	var prev = document.querySelector(".selected");
	if (prev) prev.classList.remove("selected");
	selected = delselected = this.instance;
	this.classList.add("selected");
}).on("mouseover", ".flow, .variable", function(){
	delselected = null;
});

$("#workspace").click(function(e){
	if (selected && e.target.tagName != "INPUT") {
		selected.model.deselect();
	}
});

$(document).on("keypress", function(e) {
	if (e.charCode == 127) {
		// because sometimes there is no selected
		try {
			selected.model.delete();
		} catch (e) {}
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
			v.formula  = formula[1];
			v.value = $("#value").val();
			v.reconstitute();
			y += 90;
	}
	});
}(50, 50));



var a= new Variable(alphabet.next(), 100, 200);
a.toggleWatch();
//var b = new Variable(alphabet.next(), 200, 200);
//b.toggleWatch();
//b.set("0.04*b*a-.5*b");

menu.init();
$(".chart")[0].click();
//$("#run").click();

});

});
