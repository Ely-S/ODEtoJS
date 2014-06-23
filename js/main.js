require("js/vendor/jquery-1.10.2.min.js svg variable flow system graphs views".split(" "),
function($, SVG, Variable, Flow, Sys, Graphs){
"use strict";

jQuery(function($){

var alphabet = {
	index: 97,
	next: function(){
		return String.fromCharCode(this.index++);
	}
};

$("#btn-stock").click(function(){
	$("#workspace").one("click", function(e){
		var s = new Variable(alphabet.next(), e.clientX, e.clientY);
	});
});

$("#btn-flow").click(function(){
	$("g").one("click", function(e){
		var from = this;			
		$("g").on("click", function(e){
			e.stopPropagation();
			if (this !== from) {
				new Flow("Flow", from.instance, this.instance);
				$("g").off("click");
			}
		});
	});
});

$("#btn-run").click(Sys.run.bind(Sys));

 new Variable(alphabet.next(), 100, 200);
 new Variable(alphabet.next(), 200, 200);

$("#run").click(Sys.run.bind(Sys));

var selected = false;
$("#workspace").on("click", "rect", function(){
	if (selected) {
		selected.classList.remove("selected");
	}
	selected = this;
	selected.classList.add("selected");
});

var timeout, out = false;
$(".output").hover(function(){
	clearTimeout(timeout);
	if (!out) {
		$("#output").animate({width: "95%"}, 'fast');
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

//graphs.new();

});

});

