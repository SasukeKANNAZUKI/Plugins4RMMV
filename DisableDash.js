//=============================================================================
// DisableDash.js
//=============================================================================
/*:
 * @plugindesc disable dash and related configurations when specified switch ON
 * @author Sasuke KANNAZUKI
 *
 * @param Dash Disable Switch ID
 * @desc this plugin works when the switch id is on. If 0, always on.
 * @default 0
 *
 * @param Display Dash Option At Title
 * @desc Display dash option? (1=yes, 0=no)
 * @default 0
 *
 * @help This plugin does not provide plugin commands.
 * 
 * If you put dash related plugin, put list under this plugin.
 * 
 */
/*:ja
 * @plugindesc 特定のスイッチがONの時、全てのダッシュ関連の項目を禁止/隠します
 * @author 神無月サスケ
 *
 * @param Dash Disable Switch ID
 * @desc このスイッチIDがONの時に機能します。値が 0 の時は常に機能します。
 * @default 0
 *
 * @param Display Dash Option At Title
 * @desc タイトルのオプションで常時ダッシュを表示するか(1=する, 0=しない)
 * @default 0
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * もし、ダッシュ関連のプラグインを入れる場合、リストのこのプラグインの下に
 * 置いてください。
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('DisableDash');
  var noDashSwitchID = Number(parameters['Dash Disable Switch ID'] || 0);
  var _dispAtTitle = !!Number(parameters['Display Dash Option At Title'] || 0);

  var dashDisabledByParam = function() {
    return !noDashSwitchID || $gameSwitches.value(noDashSwitchID);
  };

  var hideDashOptionAtMenu = function() {
    return !SceneManager.isPreviousScene(Scene_Title) && dashDisabledByParam();
  };

  var hideDashOptionAtTitle = function() {
    return SceneManager.isPreviousScene(Scene_Title) && !_dispAtTitle;
  };

  //
  // change menu option
  //
  var _Window_Options_addGeneralOptions =
   Window_Options.prototype.addGeneralOptions;
  Window_Options.prototype.addGeneralOptions = function() {
    if (hideDashOptionAtTitle() || hideDashOptionAtMenu()) {
      // do not display 'always dash'
      this.addCommand(TextManager.commandRemember, 'commandRemember');
    } else {
      _Window_Options_addGeneralOptions.call(this);
    }
  };

  //
  // always disable dash
  //
  var _Game_Map_isDashDisabled = Game_Map.prototype.isDashDisabled;
  Game_Map.prototype.isDashDisabled = function() {
    if (dashDisabledByParam()) {
      return true;
    } else {
      return _Game_Map_isDashDisabled.call(this);
    }
  };

})();
