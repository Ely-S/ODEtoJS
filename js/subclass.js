define(function(){
  return function(o, o2) {
    	var o1 = Object.create(o.prototype), i;
      for (i in o2) {
        o1[i] = (typeof o2[i] === "object") ? (
          (o1[i] && o1[i].constructor == o2[i].constructor) ?
          Subclass(o1[i], o2[i]) : Subclass(o2[i].constructor(), o2[i])) : o2[i];
      }
      return o1;
  }
});
