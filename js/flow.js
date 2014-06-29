define(["svg"], function(SVG, SVGModel) {
	"use strict";
	var Flow = function(name, from, to) {
		var fm = from.model,
			tm = to.model,
			line = SVG.line(from.x()+fm.width/2 , from.y()+fm.height/2 , to.x() + tm.width/2, to.y()+tm.height/2 ).stroke({width: 5});
		this.g = SVG.group();
		this.g.model = this;
		this.g.add(line);
		fm.connect(this);
		tm.connect(this);
		this.other = function(a) {
			return a === fm ? tm : fm;
		};
		this.move = function(){
			line.plot(from.x()+fm.width/2, from.y()+fm.height/2, to.x()+tm.width/2, to.y()+tm.height/2);
		};
	};

	Flow.prototype.delete = function(){
		this.g.remove();
	};

	Flow.waiting = function(from) {
		var g,
			x1 = from.instance.x() + from.instance.model.width/2,
			y1 = from.instance.y() + from.instance.model.height/2,
			temp = SVG.line(x1, y1, x1+1, y1+1).stroke({width: 5});
		document.body.onmousemove = function(e){
			temp.plot(x1, y1, e.clientX-10, e.clientY-10);
		};
		g = $("g").on("click", function(e){
			g.off("click");
			e.stopPropagation();
			temp.remove();
			temp = undefined;
			document.body.onmousemove = null;
			if (this !== from) {
				new Flow("Flow", from.instance, this.instance);
				Flow.fl = false;
			}
		});
	};

	return Flow;
});