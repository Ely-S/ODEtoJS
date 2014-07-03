require("js/vendor/jquery-1.10.2.min.js svg variable flow system output js/vendor/shortcut.js views".split(" "),
function($, SVG, Variable, Flow, Sys, Graphs, Shortcut){
"use strict";

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
	} else {
		$(this).toggleClass("selected");
	}
}).click(function(e){
	if (e.ctrlKey) {
		e.stopPropagation();
		new Variable(alphabet.next(), e.clientX, e.clientY);
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


var a= new Variable(alphabet.next(), 100, 200);
//var b = new Variable(alphabet.next(), 200, 200);
//b.toggleWatch();
//b.set("0.04*b*a-.5*b");
//a.set("1.0*a-.2*a*b");


//    public static double a=1.0, b=0.2, p=0.04, c=0.5, Prey0=5, Predator0=2;
//    public static double dt=0.01, tstart=0.0;


a.toggleWatch();

menu.init();
$(".chart")[0].click();
//$("#run").click();

});

});

