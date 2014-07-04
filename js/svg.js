define(["vendor/svg", "js/vendor/jquery-1.10.2.min.js"], function (argument) {
 	var svg = SVG("workspace").height("1000%");
	$("#workspace svg").on("mousedown", function(e) {
		e.stopPropagation()
		var x = e.clientX, y = e.clientY,
		svg = $("#workspace svg").css("cursor", "move")[0];
		document.onmousemove = function(e) {
			e.stopPropagation()
			svg.style.bottom = y - e.clientY;
			svg.style.right = x - e.clientX;
		};
		$(document.body).one("mouseup", function(){
			document.onmousemove = null;
			$("#workspace svg").css("cursor", "inherit");
		});
	});
	return svg;
});