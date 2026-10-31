//=============================================================================
// ForceEventMovement.js
//=============================================================================

/*:
 * @plugindesc allow events to self movement wherever in the map.
 * @author Sasuke KANNAZUKI
 * *
 * @help This plugin does not provide plugin commands.
 * 
 * note: this is test program and the function is naive.
 */
/*:ja
 * @plugindesc イベントがマップ内のどこにいても自律移動をさせます
 * @author 神無月サスケ
 * *
 * @help このプラグインにはプラグインコマンドはありません。
 * 注意：テスト用に作ったものなので、機能は最小限です。
 */

(function() {

  var _Game_Event_initMembers = Game_Event.prototype.initMembers;
  Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
    this._chaser = !!this.event().meta.chaser;
  };

  var _Game_Event_isNearTheScreen = Game_Event.prototype.isNearTheScreen;
  Game_Event.prototype.isNearTheScreen = function() {
    if (this._chaser) {
      return true;
    }
    return _Game_Event_isNearTheScreen.call(this);
  };

  var _Game_Event_isNearThePlayer = Game_Event.prototype.isNearThePlayer;
  Game_Event.prototype.isNearThePlayer = function() {
    if (this._chaser) {
      return true;
    }
    return _Game_Event_isNearThePlayer.call(this);
  };

})();
