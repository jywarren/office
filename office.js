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
  beats:      16,
  sequence:   [],
  playing: false,

  play: function() {
    if (this.playing) {
      this.playing = false;
      this.beat = 1;
    } else {
      this.playing = true;
      this.beat = 1;
      this.run();
    }
  },

  run: function() {
    if (this.playing) this.timeout = setTimeout(this.run.bind(this),1000*60/(this.bpm*2));

    $('.grid .btn').removeClass('playing');

    if (this.playing) {

      var sequenced = this.sequence[this.beat-1]
      for (var i = 0; i < sequenced.length; i++) {
        this.sounds[sequenced[i]].play();
      }
      var btn = this.grid[this.beat-1]
      btn.addClass('playing');
      var turnoff = function() { 
        btn.removeClass('playing');
      }
      setTimeout(turnoff, 50);
  
      this.beat += 1;
      if (this.beat > this.beats) this.beat = 1;
    }
  },

  initialize: function() {
    this.recording = false;
    this.voice = false;

    // build sequence
    for (var i = 0; i < this.beats; i++) {
      this.sequence.push([]);
    }
    $('.play').click(function(){ office.play.apply(office); });

    this.programMultiple([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'closedHat');
    this.programMultiple([1,5,9,13],'kick');
    this.programMultiple([3,7,11,15],'snare');

    $('.bpm').click(this.nextBpm.bind(this));
    $('.record').click(this.record.bind(this));

    this.setup();
  },

  program: function(i,note) {
    console.log(note,'at',i);
    this.sequence[i].push(note);
  },

  programMultiple: function(a,note) {
    console.log(note,'at',a.join(','));
    for (var i = 0; i < a.length; i++) {
      this.sequence[a[i]-1].push(note);
    }
  },

  // build the layout
  setup: function() {
    this.grid = [];
    for (var y = 0; y < this.size; y++) {
      $('.grid').append('<p></p>');
      for (var x = 0; x < this.size; x++) {
        var index = y*this.size+x;
        var icon = 'fa-circle-thin'
        var el = '<a class="btn btn-lg btn-inverse btn-'+index+'"><i class="fa '+icon+'"></i></a>'

        $('.grid p:last').append(el)
        this.grid.push($('.grid p:last .btn:last'));
        el = $('.btn-'+index)
        $(el).attr('index',index);

        var key = Object.keys(this.sounds)[index];
        var sound = this.sounds[key];
        if (sound) {
          $(el).attr('sound',key);
          sound.onend = function() {
            // turn off LED
            $(el).addClass('playing');
          }
          // won't have 'this' scope in click handler
          var that = this;
          var onClick = function() {
            // turn on LED
            $(this).removeClass('playing');
            that.sounds[$(this).attr('sound')].play();
          }
          $('.btn-'+index).click(onClick);
        }
      }
    }
  },

  nextBpm: function() {
    if      (this.bpm == 80)  this.bpm = 100;
    else if (this.bpm == 100) this.bpm = 120;
    else                      this.bpm =  80;
    console.log(this.bpm);
  },

  record: function() {
    if (this.recording) {
      $('.record').removeClass('red');
      this.voice = false;
      // restore original click handlers for buttons; just playing




    } else {
      $('.record').addClass('red');
      if (this.voice == false) {
        // choose a voice
        var blinkChoice = function() {
          $('.grid .btn').toggleClass('red');
        }
        this.choiceInterval = setInterval(blinkChoice,250);
        var that = this, onClick = function() {
          clearInterval(that.choiceInterval);
          $('.grid .btn').removeClass('red');
          that.voice = $(this).attr('sound');
          $('.grid .btn').off('click');
          // each button programs its position with this.voice
          var onClick = function() {
            var i = parseInt($(this).attr('index'));
            that.program.bind(that,i,that.voice)();
          }
          $('.grid .btn').click(onClick);
        }
        // clear other listeners
        $('.grid .btn').off('click');
        $('.grid .btn').click(onClick);
      }
    }
  },

  sounds: {
    'kick': new Howl({
      urls: ['audio/CYCdh_AcouKick-01.mp3'],
    }),
    'snare': new Howl({
      urls: ['audio/CYCdh_LudFlamA-01.mp3'],
    }),
    'closedHat': new Howl({
      urls: ['audio/KHats Clsd-08.mp3'],
    }),
    'openHat': new Howl({
      urls: ['audio/KHats Open-04.mp3'],
    })
  }

});

