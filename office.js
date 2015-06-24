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
  bpm:        80,
  beats:      16,
  beat:       1,
  sequence:   [],
  playing: false,

  play: function() {
    if (this.playing) {
      this.playing = false;
      clearInterval(this.interval);
      this.beat = 1;
    } else {
      this.playing = true;
      this.run();
      this.interval = setInterval(this.run.bind(this),1000*60/(this.bpm*4));
    }
  },

  run: function() {
    this.beat += 1;
    if (this.beat > this.beats) this.beat = 1;

    var sequenced = this.sequence[this.beat-1]
    for (var i = 0; i < sequenced.length; i++) {
      this.sounds[sequenced[i]].play();
    }
  },

  initialize: function() {
    // borrowed from jywarren/marktone
/*
    this.dst: new AudioDataDestination(
      this.sampleRate, 
      this.requestSoundData, i);
*/
    this.grid = [];
    // build sequence
    for (var i = 0; i < this.beats; i++) {
      this.sequence.push([]);
    }
    $('.play').click(function(){ office.play.apply(office); });

    this.programMultiple([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'closedHat');
    this.programMultiple([1,4,8,12],'kick');
    this.programMultiple([2,6,10,14],'snare');

    this.setup();
  },

  program: function(i,voice) {
    this.sequence[i].push(voice);
  },

  programMultiple: function(a,voice) {
    for (var i = 0; i < a.length; i++) {
      this.sequence[a[i]-1].push(voice);
    }
  },

  // build the layout
  setup: function() {
    for (var y = 0; y < this.size; y++) {
      this.grid.push($('.grid').append('<p></p>'));
      for (var x = 0; x < this.size; x++) {
        var index = y*this.size+x;
        var icon = 'fa-circle-thin'
        var el = '<a class="btn btn-lg btn-inverse btn-'+index+'"><i class="fa '+icon+'"></i></a>'

        this.grid.push($('.grid p:last').append(el));
        el = $('.btn-'+index)

        var key = Object.keys(this.sounds)[index];
        var sound = this.sounds[key];
        if (sound) {
          $(el).attr('sound',key);
          sound.onend = function() {
            // turn off LED
            $(el).addClass('playing');
          }
          $('.btn-'+index).click(function() {
            // turn on LED
            $(this).removeClass('playing');
            // ugly global scope!
            office.sounds[$(this).attr('sound')].play();
          });
        }
      }
    }
  },

  sounds: {
    'snare': new Howl({
      urls: ['audio/CYCdh_LudFlamA-01.mp3'],
    }),
    'closedHat': new Howl({
      urls: ['audio/KHats Clsd-08.mp3'],
    }),
    'openHat': new Howl({
      urls: ['audio/KHats Open-04.mp3'],
    }),
    'kick': new Howl({
      urls: ['audio/CYCdh_AcouKick-01.mp3'],
    })
  }

});

