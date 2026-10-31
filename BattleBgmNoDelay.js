//=============================================================================
// BattleBgmNoDelay.js
//=============================================================================
/*:
 * @plugindesc Start playing battle bgm at the starting encounter.
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc エンカウント開始と同時に戦闘BGMの再生を開始します。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  var _Scene_Map_updateEncounterEffect =
   Scene_Map.prototype.updateEncounterEffect;
  Scene_Map.prototype.updateEncounterEffect = function() {
    _Scene_Map_updateEncounterEffect.call(this);
    if (this._encounterEffectDuration > 0) {  
      var speed = this.encounterEffectSpeed();
      var n = speed - this._encounterEffectDuration;
      if (n === 2) {
        BattleManager.playBattleBgm();
      }
    }
  };
})();
