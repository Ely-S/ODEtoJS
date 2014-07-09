define(["svg"], function(SVG, SVGModel) {
	"use strict";
	var Flow = function(name, from, to) {
		var fm = from.model || from,
			tm = to.model || to,
			line = SVG.line(from.x()+fm.width/2 , from.y()+fm.height/2 , to.x() + tm.width/2, to.y()+tm.height/2 ).stroke({width: 5});
		this.id = [fm.name,tm.name].sort().join("");
		this.g = SVG.group();
		this.g.model = this;
		this.g.add(line);
		this.g.node.classList.add("flow");
		this.g.node.model = this;
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

	Flow.connection = function(from) {
		if (this === Flow) return new Flow.connection(from);
		var g,
			x1 = from.x() + from.model.width/2,
			y1 = from.y() + from.model.height/2,
			temp = SVG.line(x1, y1, x1+1, y1+1).stroke({width: 5});

		$(document.body).on("mousemove", function(e){
			var pos = $("#workspace > svg").position();
			temp.plot(x1, y1, e.clientX-5-pos.left, e.clientY-5-pos.top);
		});

		this.connect = function(to) {
			$(document.body).off("mousemove");
			temp.remove();
			Flow.waiting = false;
			if (to !== from) {
				new Flow("Flow", from, to);
			}
		};
		return Flow.waiting = this;
	};

	return Flow;
});