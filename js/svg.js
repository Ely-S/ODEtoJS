define(["vendor/svg", "js/vendor/jquery-1.10.2.min.js", "js/vendor/jquery-ui.min.js"], function (argument) {
 	var svg = SVG("workspace").height("2000%").width("2000%"),
 		svgd = $("#workspace svg").draggable({
 			containment: [-1000, -1000, 0, 0],
 			cursor: "pointer"
 		});
 	
 		svgd.on("mouseover", ".variable", function(){
 			svgd.draggable("disable");
 		}).on("mouseout", ".variable", function(){
 			svgd.draggable("enable");
 		});

	return svg;
});