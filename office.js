jQuery(document).ready(function($) {

  office = new Office();

});

// simple class declaration & inheritance
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
  size:       4, // per side
  bpm:        100,
  lastBeat:   0, // # timestamp of last beat
  beats:      16,
  mode: 'play', // 'sequence', 'record'
  playing: false,

  initialize: function() {
    this.voice = false;
    this.sequence = [];
    this.setBpm(this.bpm);

    this.interval = setInterval(this.timer.bind(this),10);

    // build empty sequence
    for (var i = 0; i < this.beats; i++) {
      this.sequence.push([]);
    }

    // fill sequence
    this.programMultiple([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'closedHat');
    this.programMultiple([1,5,9,13],'kick');
    this.programMultiple([3,7,11,15],'snare');

    // set up actual HTML grid buttons
    this.buildLayout();

    // set up control button listeners
    $('.play').click(function(){ office.togglePlay.apply(office); });
    $('.bpm').click(this.nextBpm.bind(this));
    $('.sequence').click(this.toggleAuthor.bind(this));
  },

  buildLayout: function() {
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

        var key = Object.keys(this.voices)[index];
        var sound = this.voices[key];
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

  // toggle playing the sequence
  togglePlay: function() {
    if (this.playing) {
      $('.play').removeClass('red');
      this.playing = false;
      this.beat = 1;
    } else {
      $('.play').addClass('red');
      this.playing = true;
      this.beat = 1;
      this.run();
    }
  },

  timer: function() {
    if (this.playing && Date.now()-this.lastBeat > this.milliseconds) {
console.log('beat!');
      this.run.bind(this)();
      this.lastBeat = Date.now();
    }
  },

  // actually play the sequence for one beat
  run: function() {
    if (this.playing) {

      var sequenced = this.sequence[this.beat-1]
      for (var i = 0; i < sequenced.length; i++) {
        this.voices[sequenced[i]].play();
      }
      var btn = this.grid[this.beat-1]

      // skip buttons which are blinking
      if (!btn.hasClass('playing')) {
        btn.addClass('playing');
        var turnoff = function() { 
          btn.removeClass('playing');
        }
        setTimeout(turnoff, 50);
      } 
 
      this.beat += 1;
      if (this.beat > this.beats) this.beat = 1;
    }
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

  // does given <voice> exist in slot <i>
  exists: function(i,voice) {
    var exists = false;
    for (var j = 0; j < this.sequence[i].length; j++) {
      if (this.sequence[i][j] == voice) exists = true;
    }
    return exists;
  },

  // show which slots have given <voice> with highlight
  displayVoice: function(voice) {
    for (var i = 0; i < this.sequence.length; i++) {
      if (this.exists(i,this.voice)) $('.btn-'+i).addClass('sequenced');
      else $('.btn-'+i).removeClass('sequenced');
    }
  },

  setButtonMode: function() {
    // won't have 'this' scope in click handler
    var that = this;
    if (this.mode == 'play') {
      $('.grid .btn').removeClass('playing');
      $('.grid .btn').removeClass('sequenced');
      var onClick = function() {
        // turn on LED
        $(this).addClass('playing');
        that.voices[$(this).attr('sound')].play();
      }
    } else if (this.mode == 'sequence') {
      // show when this voice is currently sequenced
      this.displayVoice();
      var onClick = function() {
        // turn on/off LED
        var i = parseInt($(this).attr('index'));
        that.displayVoice.apply(that);
      }
      
    }
    $('.grid .btn').click(onClick);
  },

  setBpm: function(bpm) {
    this.bpm = bpm;
    this.milliseconds = 1000*60/(this.bpm*2); // not sure why *2 but it works
  },

  nextBpm: function() {
    if      (this.bpm == 80)  this.setBpm(100);
    else if (this.bpm == 100) this.setBpm(120);
    else                      this.setBpm(80);
    console.log(this.bpm);
  },

  // toggle authoring mode
  toggleAuthor: function() {
    if (this.mode == 'sequence' || this.mode == 'choose') {
      $('.sequence').removeClass('red');
      $('.sequence').removeClass('sequenced');
      this.mode = 'play';
      this.voice = false;
      // stop blinking
      clearInterval(this.choiceInterval);
      $('.grid .btn').removeClass('red');
      // restore original click handlers for buttons; just playing
      this.setButtonMode();
    } else {
      this.mode = 'choose';
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
          that.displayVoice.apply(that);
          // each button programs its position with this.voice
          var onClick = function() {
            var i = parseInt($(this).attr('index'));
            // could a closure here be cleaner?
            if (that.exists.apply(that,[i,that.voice])) {
              that.unProgram.apply(that,[i,that.voice]);
            } else {
              that.program.apply(that,[i,that.voice]);
            }
            that.setButtonMode.apply(that);
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

  // [should be] 16 voices
  voices: {
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

