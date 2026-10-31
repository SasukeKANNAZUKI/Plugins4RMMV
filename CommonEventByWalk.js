//=============================================================================
// CommonEventByWalk.js
//=============================================================================

/*:
 * @plugindesc Invoke specified common event when player walks except event.
 * @author Sasuke KANNAZUKI
 *
 * @param Common Event Var ID
 * @desc Invoke common event whose ID is the variable's value. If the value is 0, do nothing.
 * @default 92
 *
 * @param Step Interval Var ID
 * @desc call common event staring to move and each the value's step. If the value is 0, invoke only starting to move.
 * @default 0
 *
 * @help This plugin does not provide plugin commands.
 * 
 */
/*:ja
 * @plugindesc 歩き始める直前または特定の歩数毎にコモンイベントを呼び出します。
 * @author 神無月サスケ
 *
 * @param Common Event Var ID
 * @desc この変数の値をIDに持つコモンイベントを呼び出します。値が 0 の時は起動しません。
 * @default 92
 *
 * @param Step Interval Var ID
 * @desc この変数の値の歩数毎にコモンイベントを呼び出します。 値が 0 の場合は、歩き始めた時のみ呼び出します。
 * @default 93
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('CommonEventByWalk');
  var forceCommonEventVarId = Number(parameters['Common Event Var ID'] || 92);
  var stepIntervalVarId = Number(parameters['Step Interval Var ID'] || 93);

  //
  // define scope variables
  //
  var startingSteps = null;

  //
  // functions for judge from parameters
  //
  var doApplyForceCommonEvent = function () {
    return !!$gameVariables.value(forceCommonEventVarId);
  };

  var forceCommonEventConditionMet = function () {
    var interval = $gameVariables.value(stepIntervalVarId);
    return interval > 0 &&  $gameParty.steps() > startingSteps && 
     ($gameParty.steps() - startingSteps + interval) % interval === 0;
  };

  //
  // functions for force common event invocation
  //
  var invokeForceCommonEvent = function () {
    var eventId = $gameVariables.value(forceCommonEventVarId);
    var event = $dataCommonEvents[eventId];
    if (event) {
      var interval = $gameVariables.value(stepIntervalVarId);
      startingSteps = $gameParty.steps();
      $gameMap._interpreter.setup(event.list);
    } else {
      startingSteps = null;
    }
  };

  var isForceCommonEventWorking = function () {
    return doApplyForceCommonEvent() && startingSteps != null;
  };

  var finishForceCommonEvent = function () {
    startingSteps = null;
    $gameTemp.clearDestination();
  };

  //
  // main functions
  //
  var _Game_Player_executeMove = Game_Player.prototype.executeMove;
  Game_Player.prototype.executeMove = function(direction) {
    _Game_Player_executeMove.call(this, direction);
    if (this.isMovementSucceeded()) {
      if (doApplyForceCommonEvent() && !isForceCommonEventWorking()) {
        invokeForceCommonEvent();
       }
    }
  };

  var _Game_Player_updateNonmoving = Game_Player.prototype.updateNonmoving;
  Game_Player.prototype.updateNonmoving = function(wasMoving) {
    _Game_Player_updateNonmoving.call(this, wasMoving);
    if (this.isTransferring()) {
      finishForceCommonEvent();
      return;
    }
    if (!$gameMap.isEventRunning() && isForceCommonEventWorking()) {
      if (wasMoving && forceCommonEventConditionMet()) {
        invokeForceCommonEvent();
      }
      if (!wasMoving) {
        finishForceCommonEvent();
      }
    }
  };

  var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
    _Game_Player_moveByInput.call(this);
    if (!this.isMoving() && this.canMove()) {
      if (isForceCommonEventWorking() && $gameTemp.isDestinationValid()) {
        finishForceCommonEvent();
      }
    }
  };

  var _Game_Temp_clearDestination = Game_Temp.prototype.clearDestination;
  Game_Temp.prototype.clearDestination = function() {
    if (isForceCommonEventWorking()) {
      return;
    }
    _Game_Temp_clearDestination.call(this);
  };

})();
