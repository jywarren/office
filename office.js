jQuery(document).ready(function($) {

  office = new Office();

});

Class = function(methods) {   
  var klass = function() {    
    this.initialize.apply(this, arguments);          
  };  
  
  for (var property in methods) { 
    klass.prototype[property] = methods[property];
  }
        
  if (!klass.prototype.initialize) klass.prototype.initialize = function(){};      
  
  return klass;    
};

Office = Class({
  size:       4,
  sampleRate: 44100,
  bpm:        100,

  initialize: function() {
    // borrowed from jywarren/marktone
/*
    this.dst: new AudioDataDestination(
      this.sampleRate, 
      this.requestSoundData, i);
*/
    this.grid = [];
    this.setup();
  },

  // build the layout
  setup: function() {
    for (var y = 0; y < this.size; y++) {
      this.grid.push($('.grid').append('<p></p>'));
      for (var x = 0; x < this.size; x++) {
        var icon = 'fa-circle-thin'
        var el = '<a class="btn btn-lg btn-inverse btn-'+(x*y)+'"><i class="fa '+icon+'"></i></a>'
        this.grid.push($('.grid p:last').append(el));
      }
    }
  }
});

