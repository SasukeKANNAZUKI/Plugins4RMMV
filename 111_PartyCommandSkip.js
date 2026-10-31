//=============================================================================
// PartyCommandSkip.js
//=============================================================================
// 2017 Aug 16 : fix bugs by Sasuke KANNNAZUKI


/*:
 * @plugindesc 戦闘の戦う・逃げるを飛ばして戦闘へ
 * @author １１１（改変：神無月サスケ）
 *
 * @desc 戦闘の戦う・逃げるを飛ばして戦闘へ
 *
 * @param SwitchNumber
 * @default 111
 *
 * @help
 * Parametersの番号のスイッチがONだった時、
 * 戦闘に入る時の「戦う・逃げる」メニューを飛ばして
 * そのまま戦闘へ。
 *
 * [神無月サスケ追記]
 * アクターコマンドの際にキャンセルを行うと「戦う・逃げる」が表示されるように
 * 仕様拡張
 * 
 */
(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('111_PartyCommandSkip');
  var switchNumber = Number(parameters['SwitchNumber'] || '111');

  //
  // add new class variable
  //
  var _Scene_Battle_initialize = Scene_Battle.prototype.initialize;
  Scene_Battle.prototype.initialize = function() {
    _Scene_Battle_initialize.call(this);
    this.hasAlreadyInputStart = false;
  };


  var _Scene_Battle_changeInputWindow =
   Scene_Battle.prototype.changeInputWindow;
  Scene_Battle.prototype.changeInputWindow = function() {
    if (!this.hasAlreadyInputStart) {
      if (BattleManager.isInputting() && $gameSwitches.value(switchNumber)) {
        BattleManager._actorIndex = 0;
        this.startActorCommandSelection();
        this.hasAlreadyInputStart = true;
        return;
      }
    }
    _Scene_Battle_changeInputWindow.call(this);
  };

  var _Scene_Battle_endCommandSelection =
   Scene_Battle.prototype.endCommandSelection;
  Scene_Battle.prototype.endCommandSelection = function() {
    _Scene_Battle_endCommandSelection.call(this);
    this.hasAlreadyInputStart = false;
  };

})();