//=============================================================================
// DashByDoubleClick.js
//=============================================================================
/*:
 * @plugindesc Player dashes to position when the position is double clicked.
 * @author Sasuke KANNAZUKI
 *
 * @param Dash Valid Switch ID
 * @desc when the switch is ON, this sort of dash is valid. when number is 0, always ON.
 * @default 0
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * This plugin is useful only when dash disabled.
 * Click movement is always done as dash when dash able map(in the case,
 * this plugin is no use).
 * This plugin enables dash at dash disabled map,
 * by double clicking.
 */
/*:ja 
 * @plugindesc 場所をダブルクリックするとダッシュしてその場所に移動します
 * @author 神無月サスケ
 *
 * @param Dash Valid Switch ID
 * @desc このスイッチがONの時、有効になります。0を設定すると常に有効です。
 * @default 0
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * このプラグインは、ダッシュ禁止の状態や地形で効果を発揮します。
 * 通常のマップでは常にクリック移動はダッシュで行われますが、
 * このプラグインを導入してダブルクリックすると、そのような状態でも
 * ダッシュが可能になります。
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('DashByDoubleClick');
  var dispSwitchID = Number(parameters['Dash Valid Switch ID'] || 0);

  //
  // count steps
  //
  var dClickDuration = 24;

  var dClickDashValid = function() {
    return !dispSwitchID || $gameSwitches.value(dispSwitchID);
  };

  var _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this._doubleClickDuration = 0;
    this._dashToDestination = false;
  };

  Game_Temp.prototype.setupDoubleClickDuration = function () {
    this._doubleClickDuration = dClickDuration;
    this._dashToDestination = false;
  };

  var _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
  Game_Temp.prototype.setDestination = function(x, y) {
    _Game_Temp_setDestination.call(this, x, y);
    this.setupDoubleClickDuration();
  };

  var _Game_Temp_clearDestination = Game_Temp.prototype.clearDestination;
  Game_Temp.prototype.clearDestination = function() {
    _Game_Temp_clearDestination.call(this);
    this._doubleClickDuration = 0;
  };

  //
  // check if dash valid
  //
  var _Game_Player_isDashing = Game_Player.prototype.isDashing;
  Game_Player.prototype.isDashing = function() {
    return $gameTemp._dashToDestination || _Game_Player_isDashing.call(this);
  };

  var checkTouchThePoint = function() {
    if (dClickDuration - $gameTemp._doubleClickDuration >= 1 &&
     $gameTemp._doubleClickDuration > 0) {
      if (TouchInput.isPressed()) {
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        return $gameTemp._destinationX === x && $gameTemp._destinationY === y;
      }
    }
    return false;
  };

  var _Game_Player_updateDashing = Game_Player.prototype.updateDashing;
  Game_Player.prototype.updateDashing = function() {
    if (dClickDashValid()) {
      if ($gameTemp.isDestinationValid() && 
        $gameTemp._doubleClickDuration > 0) {
        if ($gameTemp._dashToDestination || checkTouchThePoint()) {
          $gameTemp._dashToDestination = true;
        }
        $gameTemp._doubleClickDuration--;
      }
      if (!this.isMoving()) {
        if (!$gameTemp.isDestinationValid()) {
          $gameTemp._dashToDestination = false;
        }
        $gameTemp._doubleClickDuration = 0;
      }
    }
     _Game_Player_updateDashing.call(this);
  };

})();
