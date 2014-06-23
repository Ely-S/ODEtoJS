define(["svg"], function(SVG, SVGModel) {
	"use strict";
	var Flow = function(name, from, to) {
		var fm = from.model,
			tm = to.model,
			line = SVG.line(from.x(), from.y(), to.x(), to.y()).stroke({width: 5});
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
	return Flow;
});