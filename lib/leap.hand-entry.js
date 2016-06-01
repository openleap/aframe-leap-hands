module.exports = function() {
    var activeHandIds;
    activeHandIds = [];
    if (Leap.version.major === 0 && Leap.version.minor < 5) {
      console.warn("The hand entry plugin requires LeapJS 0.5.0 or newer.");
    }
    this.on("deviceStopped", function() {
      for (var i = 0, len = activeHandIds.length; i < len; i++){
      id = activeHandIds[i];
      activeHandIds.splice(i, 1);
      // this gets executed before the current frame is added to the history.
      this.emit('handLost', this.lastConnectionFrame.hand(id))
      i--;
      len--;
    };
    });
    return {
      frame: function(frame) {
        var id, newValidHandIds, _i, _len, _results;
        newValidHandIds = frame.hands.map(function(hand) {
          return hand.id;
        });
        for (var i = 0, len = activeHandIds.length; i < len; i++){
        id = activeHandIds[i];
        if(  newValidHandIds.indexOf(id) == -1){
          activeHandIds.splice(i, 1);
          // this gets executed before the current frame is added to the history.
          this.emit('handLost', this.frame(1).hand(id));
          i--;
          len--;
        }
      };
        _results = [];
        for (_i = 0, _len = newValidHandIds.length; _i < _len; _i++) {
          id = newValidHandIds[_i];
          if (activeHandIds.indexOf(id) === -1) {
            activeHandIds.push(id);
            _results.push(this.emit('handFound', frame.hand(id)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };
  };
  