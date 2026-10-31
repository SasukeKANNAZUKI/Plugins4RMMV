  //
  // change specification
  //
  var _TouchInput_onMouseMove = TouchInput._onMouseMove;
  TouchInput._onMouseMove = function(event) {
    _TouchInput_onMouseMove.call(this, event);
    if (!this._mousePressed) {
      var x = Graphics.pageToCanvasX(event.pageX);
      var y = Graphics.pageToCanvasY(event.pageY);
      this._onMove(x, y);
    }
  };

  var _TouchInput_update = TouchInput.update;
  TouchInput.update = function () {
    _TouchInput_update.call(this);
    console.log(TouchInput.x, TouchInput.y);
  };


