//=============================================================================
// ToggleCharVoice.js
//=============================================================================

/*:
 * @plugindesc Toggle character voice on/off by a switch and option scene
 * @author Sasuke KANNAZUKI
 *
 * @param Option Name
 * @desc the option name that toggle character voice
 * @default Play Voice
 *
 * @param Voice Play Switch ID
 * @desc play character voice if and only if the switch is ON.
 * @default 21
 * 
 * @param Character Voice Prefix
 * @desc the prefix of file name that the SE file is character voice
 * @default Vo_
 *
 * @help This plugin does not provide plugin commands.
 * 
 * This plugin enables to toggle on/off the character voice play.
 * "character voice" is a SE whose file name has specified prefix (see parameter).
 * To toggle the play state, either to control switch or to change option.
 * The switch(specified at parameter) and the option are interlocked.
 * 
 * Note:
 * The option is not displayed in the title scene.
 * The option default is OFF(false). If you want to play as default,
 * be sure to specified switch ON at start of the game.
 */
/*:ja
 * @plugindesc キャラボイスのON/OFFをスイッチやオプションで切替可能にします
 * @author 神無月サスケ
 *
 * @param Option Name
 * @desc キャラボイス切替のオプション名
 * @default キャラボイス
 *
 * @param Voice Play Switch ID
 * @desc キャラボイスをONにするスイッチID
 * @default 21
 * 
 * @param Character Voice Prefix
 * @desc キャラボイスとして設定するファイル名の頭に付ける文字列
 * @default Vo_
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * 
 * - このプラグインはキャラボイスのON/OFFを切り替え可能にします。
 * -「キャラボイス」とは、ファイル名の頭に特定の文字列(パラメータで設定)が
 *  付いたSEです。
 * - スイッチ(パラメータで番号を指定)か、オプションで ON/OFF が切り替えられ、
 *  これらの設定は連動します。
 * 
 * 注意:
 * - キャラボイスのオプションはタイトル画面では表示されません。
 * - キャラボイスのデフォルトは OFF(false) です。デフォルトで ON にしたい場合、
 *  ゲーム開始時に特定のスイッチを ON にするのを忘れないでください。
 */

(function() {

  //
  // process parameters
  //
  var parameters = PluginManager.parameters('ToggleCharVoice');
  var optionName = parameters['Option Name'] || 'Play Voice';
  var playSwitchId = Number(parameters['Voice Play Switch ID'] || 21);
  var charVoiceFilePrefix = parameters['Character Voice Prefix'] || '';

  //
  // play charater voice
  //
  var canPlayCharVoice = function(){
    return $gameSwitches.value(playSwitchId);
  };

  var isCharVoiceFileName = function(name){
    return name.indexOf(charVoiceFilePrefix) === 0;
  };

  var _AudioManager_playSe = AudioManager.playSe;
  AudioManager.playSe = function(se) {
    if (se.name && isCharVoiceFileName(se.name)) {
      if (!canPlayCharVoice()) {
        return;
      }
    }
    _AudioManager_playSe.call(this, se);
  };

  //
  // set play options (interlock with switch)
  //
  var doesDisplaySpecialOptions = function() {
    return !SceneManager.isPreviousScene(Scene_Title);
  };

  var _Window_Options_makeCommandList =
   Window_Options.prototype.makeCommandList;
  Window_Options.prototype.makeCommandList = function() {
    if (doesDisplaySpecialOptions()) {
      this.addCommand(optionName, 'characterVoice');
    }
    _Window_Options_makeCommandList.call(this);
  };

  var _Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
  Window_Options.prototype.getConfigValue = function(symbol) { 
    switch (symbol) {
    case 'characterVoice':
      return $gameSwitches.value(playSwitchId);
    default:
      return _Window_Options_getConfigValue.call(this, symbol);
    }
  };

  var _Window_Options_setConfigValue = Window_Options.prototype.setConfigValue;
  Window_Options.prototype.setConfigValue = function(symbol, volume) {
    switch (symbol) {
    case 'characterVoice':
      return $gameSwitches.setValue(playSwitchId, volume);
    default:
      return _Window_Options_setConfigValue.call(this, symbol, volume);
    }
  };

})();
