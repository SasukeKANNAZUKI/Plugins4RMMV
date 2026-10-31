//=============================================================================
// RecoverAtBuff.js
//=============================================================================
/*:
 * @plugindesc Revover one's HP/MP when MMP/MMP is increased by buff.
 * @author Sasuke KANNAZUKI
 *
 * @param Recover Method
 * @desc 1:Recover to Max / 0:Recover increased value
 * @default 1
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 能力強化で最大HP/MPが増加した際、回復します。
 * @author 神無月サスケ
 *
 * @param Recover Method
 * @desc 1:全回復 / 0:増分だけ回復
 * @default 1
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * 「通常能力値」の割合変更や、「能力値強化」で
 * 最大HP/MPが増加した場合、増えた分の最大HP/MPは、通常、回復しません。
 * このプラグインを導入すると、全回復するようになります。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('RecoverAtBuff');
  var isToMax = !!Number(parameters['Recover Method'] || 1);

  var _Game_BattlerBase_increaseBuff = Game_BattlerBase.prototype.increaseBuff;
  Game_BattlerBase.prototype.increaseBuff = function(paramId) {
    _Game_BattlerBase_increaseBuff.call(this, paramId);
    if (paramId === 0) {
      this._hp = isToMax ? this.mhp : this._hp + Math.ceil(this.mhp / 4);
    } else if (paramId === 1) {
      this._mp = isToMax ?  this.mmp : this._mp + Math.ceil(this.mmp / 4);
    }
  };

  var _Game_Battler_addNewState = Game_Battler.prototype.addNewState;
  Game_Battler.prototype.addNewState = function(stateId) {
    var _oldMhp = this.mhp;
    var _oldMmp = this.mmp;
    _Game_Battler_addNewState.call(this, stateId);
    if (this.mhp > _oldMhp) {
      this._hp = isToMax ? this.mhp : this._hp + (this.mhp - _oldMhp);
    } else if (this.mmp > _oldMmp) {
      this._mp = isToMax ? this.mmp : this._mp + (this.mmp - _oldMmp);
    }
  };
})();
