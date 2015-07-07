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
  mode: 'play', // 'sequence', 'record'
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
      // first store existing button state, so blinking works
      // or, skip buttons which are blinking
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
    this.voice = false;
    this.sequence = [];

    // build sequence
    for (var i = 0; i < this.beats; i++) {
      this.sequence.push([]);
    }
    $('.play').click(function(){ office.play.apply(office); });

    this.programMultiple([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'closedHat');
    this.programMultiple([1,5,9,13],'kick');
    this.programMultiple([3,7,11,15],'snare');

    $('.bpm').click(this.nextBpm.bind(this));
    $('.sequence').click(this.author.bind(this));

    this.setup();
  },

  program: function(i,note) {
    console.log(note,'at',i);
    this.sequence[i].push(note);
  },

  unProgram: function(i,voice) {
    for (var j = 0; j < this.sequence[i].length; j++) {
      if (this.sequence[i][j] == voice) {
        console.log('remove',voice,'from',i);
        this.sequence[i].splice(j,1);
      }
    }
  },

  programMultiple: function(a,note) {
    console.log(note,'at',a.join(','));
    for (var i = 0; i < a.length; i++) {
      this.sequence[a[i]-1].push(note);
    }
  },

  exists: function(i,voice) {
    var exists = false;
    for (var j = 0; j < this.sequence[i].length; j++) {
      if (this.sequence[i][j] == voice) exists = true;
    }
    return exists;
  },

  display: function(voice) {
    for (var i = 0; i < this.sequence.length; i++) {
      if (this.exists(i,voice)) $('.btn-'+i).addClass('playing');
      else $('.btn-'+i).removeClass('playing');
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
            $(el).removeClass('playing');
          }
        }
      }
    }
    this.setButtonMode();
  },

  setButtonMode: function() {
    // won't have 'this' scope in click handler
    var that = this;
    if (this.mode == 'play') {
      $('.grid .btn').removeClass('playing');
      var onClick = function() {
        // turn on LED
        $(this).addClass('playing');
        that.sounds[$(this).attr('sound')].play();
      }
    } else if (this.mode == 'sequence') {
      this.display();
      var onClick = function() {
        // turn on LED
        $(this).toggleClass('playing');
      }
      
    }
    $('.grid .btn').click(onClick);
  },

  nextBpm: function() {
    if      (this.bpm == 80)  this.bpm = 100;
    else if (this.bpm == 100) this.bpm = 120;
    else                      this.bpm =  80;
    console.log(this.bpm);
  },

  author: function() {
    if (this.mode == 'sequence') {
      $('.sequence').removeClass('red');
      this.mode = 'play';
      this.voice = false;
      // restore original click handlers for buttons; just playing
      this.setButtonMode();
    } else {
      $('.sequence').addClass('red');
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
          // show which buttons are already active
          for (var i = 0; i < that.grid.length; i++) {
            if (that.exists.apply(that,[i,that.voice])) that.grid[i].addClass('playing');
            else that.grid[i].removeClass('playing');
          }
          // each button programs its position with this.voice
          var onClick = function() {
            var i = parseInt($(this).attr('index'));
            $(this).toggleClass('playing');
            // could a closure here be cleaner?
            if (that.exists.apply(that,[i,that.voice])) that.unProgram.apply(that,[i,that.voice]);
            else that.program.apply(that,[i,that.voice]);
          }
          $('.grid .btn').click(onClick);
          that.mode = 'sequence';
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

