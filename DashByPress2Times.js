//=============================================================================
// DashByPress2Times.js
//=============================================================================
/*:
 * @plugindesc enable dash by pressing direction key/button 2 times.
 * @author Sasuke KANNAZUKI
 *
 * @param Dash Valid Switch ID
 * @desc when the switch is ON, this sort of dash is valid. when number is 0, always ON.
 * @default 0
 *
 * @param Release Max Durations
 * @desc release key until the duration, and press key again, it'll be dash.
 * @default 24
 * 
 * @param Hook Max Durations
 * @desc  once release key and press again within this frame, it'll be dash.
 * @default 24
 *
 * @help This plugin does not provide plugin commands.
 * 
 * start walking and release key within "Release Max Durations" frames,
 * and then, press the same key again within "Hook Max Durations" frames,
 * it will be dash. (60frames＝1sec)
 * dash ends when you stopped. dash continues when you change direction.
 */
/*:ja
 * @plugindesc 方向キーを２回連続押すことでダッシュが出来ます
 * @author 神無月サスケ
 *
 * @param Dash Valid Switch ID
 * @desc このスイッチがONの時、有効になります。0を設定すると常に有効です。
 * @default 0
 *
 * @param Release Max Durations
 * @desc このフレーム以内にキーを離した場合、次にキーを押すとダッシュになります。
 * @default 24
 * 
 * @param Hook Max Durations
 * @desc キーを離してからこのフレーム以内にキーを押すとダッシュになります。
 * @default 24
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * 歩き出してからパラメータの「Release Max Durations」フレーム以内にキーを離し、 * その後「Hook Max Durations」フレーム以内に同じ方向キーを押すと
 * ダッシュになります。(60フレーム＝1秒)
 * ダッシュは方向を変えても、立ち止まるまで続きます。
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('DashByPress2Times');
  var dashSwitchID = Number(parameters['Dash Valid Switch ID'] || 0);
  var releaseMaxDuration = Number(parameters['Release Max Durations'] || 24);
  var hookMaxDuration = Number(parameters['Hook Max Durations'] || 24);

  var dPressDashValid = function() {
    return !dashSwitchID || $gameSwitches.value(dashSwitchID);
  };

  //
  // variables settings
  //
  var _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this.initHookVariables();
    this.dashHooked = false;
  };

  Game_Temp.prototype.initHookVariables = function () {
    this.hookedDirection = 0;
    this.hookedDuration = 0;
    this.hookReleaseDuration = 0;
    this.onHookedDashing = false;
  };

  var _Game_Player_isDashing = Game_Player.prototype.isDashing;
  Game_Player.prototype.isDashing = function() {
    return $gameTemp.onHookedDashing || _Game_Player_isDashing.call(this);
  };

  //
  // set hook and dash
  //
  var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
    var wasMoving = this.isMoving();
    var dir = this.getInputDirection();
    _Game_Player_moveByInput.call(this);
    if (dPressDashValid() && !$gameTemp.isDestinationValid()) {
      if (this.isMoving() && !$gameTemp.onHookedDashing) {
        if (!wasMoving && !$gameTemp.dashHooked) { // start moving
          $gameTemp.hookedDirection = this.direction();
          $gameTemp.hookReleaseDuration = releaseMaxDuration;
          $gameTemp.hookedDuration = -1;
          $gameTemp.dashHooked = true;
        } else if (!dir) { // key is released
          if ($gameTemp.hookedDuration === -1) {
            $gameTemp.hookedDuration = hookMaxDuration;
          }
          if ($gameTemp.hookedDuration > 0) {
            if (--$gameTemp.hookedDuration === 0) {
              $gameTemp.initHookVariables();
            }
          }
        } else {
          if ($gameTemp.hookedDuration === -1) { // key is still pressed
            if (--$gameTemp.hookReleaseDuration === 0) {
              $gameTemp.initHookVariables();
            }
          } else if ($gameTemp.hookedDuration > 0) { // key is pressed again
            if (dir === $gameTemp.hookedDirection) {
              $gameTemp.onHookedDashing = true;
              $gameTemp.hookedDuration = 0;
            } else {
              $gameTemp.initHookVariables();
            }
          }
        }
      }
    }
  };

  //
  // stop hook and dash
  //
  var _Game_Player_updateNonmoving = Game_Player.prototype.updateNonmoving;
  Game_Player.prototype.updateNonmoving = function(wasMoving) {
    _Game_Player_updateNonmoving.call(this, wasMoving);
    if (dPressDashValid() && !wasMoving) {
      if ($gameTemp.hookedDuration > 0) {
        $gameTemp.hookedDuration--;
      }
      if ($gameTemp.hookedDuration === 0) {
        $gameTemp.initHookVariables();
        $gameTemp.dashHooked = false;
      }
    }
  };

})();
