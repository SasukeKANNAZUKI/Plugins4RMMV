//=============================================================================
// JumpingMove.js
//=============================================================================
/*:
 * @plugindesc move by jumping several steps
 * @author Sasuke KANNAZUKI
 *
 * @param switch ID
 * @desc this function is valid only when the switch is ON. If be 0, always valid.
 * @default 0
 * 
 * @param steps
 * @desc jumping steps with one move
 * @default 2
 * 
 * @param preWait
 * @desc wait frames before jumping
 * @default 10
 * 
 * @param postWait
 * @desc wait frames after jumping
 * @default 10
 *
 * @help This plugin does not provide plugin commands.
 * ***Note***: destination is not reset even if open the menu or
 * invoke an event.
 */
/*:ja
 * @plugindesc 方向キーやタッチ入力での移動をジャンプに切り替えます。
 * @author 神無月サスケ
 *
 * @param switch ID
 * @desc 機能をON/OFFするスイッチのIDです。0を指定すると常にONになります。
 * @default 0
 * 
 * @param steps
 * @desc 一回のジャンプで進む歩数です。
 * @default 2
 * 
 * @param preWait
 * @desc ジャンプ前の溜めのフレーム数です。
 * @default 10
 * 
 * @param postWait
 * @desc ジャンプ後の停止フレーム数です。
 * @default 10
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * 注意:
 * - 行き先は、場所移動や方向キー入力ではリセットされますが、
 * メニューを開いたり、イベントを起動したりしてもリセットされません。
 *
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('JumpingMove');
  var jumpSwitchID = Number(parameters['switch ID'] || 0);
  var jumpSteps = Number(parameters['steps'] || 2);
  var preWait = Number(parameters['preWait'] || 10);
  var postWait = Number(parameters['postWait'] || 10);

  var jumpValid = function() {
    return !jumpSwitchID || $gameSwitches.value(jumpSwitchID);
  };

  //
  // local variables
  //
  var jumpMoving = false;

  //
  // determine steps
  //
  Game_Player.prototype._stepsToX = function(x, d, steps) {
    var sgn = d === 6 ? 1 : d === 4 ? -1 : 0;
    return sgn * steps;
  };

  Game_Player.prototype._stepsToY = function(y, d, steps) {
    var sgn = d === 2 ? 1 : d === 8 ? -1 : 0;
    return sgn * steps;
  };

  //
  // judge collision
  //
  Game_Map.prototype.checkPassageForAnyDirection = function(x, y) {
    var flags = this.tilesetFlags();
    var tiles = this.allTiles(x, y);
    var passableFlag = 0;
    for (var i = 0; i < tiles.length; i++) {
      var flag = flags[tiles[i]];
      if ((flag & 0x10) !== 0) {  // [*] No effect on passage
        continue;
      }
      passableFlag |= (flag & 0x0f);
    }
    return passableFlag !== 0x0f;
  };

  Game_Player.prototype.canLandWithJump = function(x, y) {
    var x2 = $gameMap.roundX(x);
    var y2 = $gameMap.roundY(y);
    if (!$gameMap.isValid(x2, y2)) {
      return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
      return true;
    }
    if (!$gameMap.checkPassageForAnyDirection(x2, y2)) {
      return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
      return false;
    }
    return true;
  };

  Game_Player.prototype._stepsToXWithCollision = function(x, y, steps) {
    var sgn = steps >= 0 ? 1 : -1;
    while (steps !== 0) {
      if (this.canLandWithJump(x + steps, y)) {
        return steps;
      }
      steps -= sgn;
    }
    return 0;
  };

  Game_Player.prototype._stepsToYWithCollision = function(x, y, steps) {
    var sgn = steps >= 0 ? 1 : -1;
    while (steps !== 0) {
      if (this.canLandWithJump(x, y + steps)) {
        return steps;
      }
      steps -= sgn;
    }
    return 0;
  };

  //
  // determine steps to jump on destination is valid
  //
  Game_Player.prototype._stepsToDestination = function(d, steps) {
    var sgnX = d === 6 ? 1 : d === 4 ? -1 : 0;
    var sgnY = d === 2 ? 1 : d === 8 ? -1 : 0;
    var tmpX = this._x;
    var tmpY = this._y;
    var destX = $gameTemp.destinationX();
    var destY = $gameTemp.destinationY();
    if (!this.canLandWithJump(tmpX + steps * sgnX, tmpY + steps * sgnY)) {
      d = -1;
    }
    for (var i = 1; i < steps; i++) {
      this._x = tmpX + i * sgnX;
      this._y = tmpY + i * sgnY;
      if (this.findDirectionTo(destX, destY) !== d) {
        break;
      }
    }
    this._x = tmpX;
    this._y = tmpY;
    if (this.canLandWithJump(tmpX + i * sgnX, tmpY + i * sgnY)) {
      return [i * sgnX, i * sgnY];
    } else {
      return [0, 0];
    }
  };

  //
  // process input for jump, not walk
  //
  var _Game_Player_executeMove = Game_Player.prototype.executeMove;
  Game_Player.prototype.executeMove = function(direction) {
    if (jumpValid()) {
      var dx2, dy2;
      if ($gameTemp.isDestinationValid()) {
        var dxy = this._stepsToDestination(direction, jumpSteps);
        dx2 = dxy[0];
        dy2 = dxy[1];
      } else {
        var dx = this._stepsToX(this._x, direction, jumpSteps);
        var dy = this._stepsToY(this._y, direction, jumpSteps);
        dx2 = this._stepsToXWithCollision(this._x, this._y, dx);
        dy2 = this._stepsToYWithCollision(this._x, this._y, dy);
      }
      var route = {list:[
        {code:Game_Character.ROUTE_WAIT, parameters:[preWait], indent:null},
        {code:Game_Character.ROUTE_JUMP, parameters:[dx2, dy2], indent:null},
        {code:Game_Character.ROUTE_WAIT, parameters:[postWait], indent:null},
        {code:Game_Character.ROUTE_END}],
        repeat:false, skippable:false, wait:true
      };
      $gamePlayer.setDirection(direction);
      $gamePlayer.forceMoveRoute(route);
      $gameMap._interpreter.setWaitMode('route');
      if ($gameTemp.isDestinationValid()){
        jumpMoving = (dx2 !== 0 || dy2 !== 0);
      }
    } else {
      _Game_Player_executeMove.call(this, direction);
    }
  };

  //
  // not reset destination during player is jump moving.
  //
  var _Game_Temp_clearDestination = Game_Temp.prototype.clearDestination;
  Game_Temp.prototype.clearDestination = function() {
    if (jumpMoving) {
      return;
    }
    _Game_Temp_clearDestination.call(this);
  };

  var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
    _Game_Player_moveByInput.call(this);
    if (this.getInputDirection()) {
      jumpMoving = false;
    } else if (jumpMoving && $gameTemp.isDestinationValid()) {
      var x = $gameTemp.destinationX();
      var y = $gameTemp.destinationY();
      if(!this.findDirectionTo(x, y)) {
        jumpMoving = false;
      }
    }
  };

  var _Game_Player_updateNonmoving = Game_Player.prototype.updateNonmoving;
  Game_Player.prototype.updateNonmoving = function(wasMoving) {
    _Game_Player_updateNonmoving.call(this, wasMoving);
    if (this.isTransferring()) {
      jumpMoving = false;
    }
  };

})();
