//=============================================================================
// ConfigCharVoice.js
//=============================================================================

/*:
 * @plugindesc Set character voice volume by a variab and option scene
 * @author Sasuke KANNAZUKI
 *
 * @param Option Name
 * @desc the option name that toggle character voice
 * @default Voice SE Volume
 *
 * @param Voice Volume Variable ID
 * @desc variable ID of volume of character voice(0～100%)
 * @default 21
 * 
 * @param Character Voice Prefix
 * @desc the prefix of file name that the SE file is character voice
 * @default Vo_
 *
 * @param Default Voice Volume
 * @desc default volume set at new game(0～100)
 * @default 100
 *
 * @param Play Another System SE
 * @desc when character voice's volume is 0, whether to play system se the name without prefix.(1=yes,0=no)
 * @default 0
 *
 *
 * @help This plugin does not provide plugin commands.
 * 
 * This plugin enables to change the character voice volume, independent from
 * SE volume setting.
 * "character voice" is a SE whose file name has specified prefix (see parameter).
 * To change the play volume, either to control variable or to change option.
 * The variable(specified at parameter) and the option are interlocked.
 * 
 * - Also system voice (ex. load, save se) can set as character voice.
 *  When the character volume's volume is 0, as option, you can play the file
 *  whose name is the same but without prefix.
 *  Note: the file without prefix may be excluded by deployment when you use
 *   the option.
 *
 * Note:
 * The option is not displayed in the title scene.
 */
/*:ja
 * @plugindesc キャラボイスのボリュームを変数やオプションで切替可能にします
 * @author 神無月サスケ
 *
 * @param Option Name
 * @desc キャラボイス音量のオプション名
 * @default キャラボイス音量
 *
 * @param Voice Volume Variable ID
 * @desc キャラボイスのボリューム(0～100)を保存する変数ID
 * @default 21
 * 
 * @param Character Voice Prefix
 * @desc キャラボイスとして設定するファイル名の頭に付ける文字列
 * @default Vo_
 *
 * @param Default Voice Volume
 * @desc ゲーム開始時のデフォルトの音量(0～100)
 * @default 100
 *
 * @param Play Another System SE
 * @desc キャラボイス音量が 0 の時、プレフィックスなしの名前のファイルを演奏するか(1=する,0=しない)
 * @default 0
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * 
 * - このプラグインはキャラボイスのボリュームを、
 *   SE音量とは独立して設定可能にします。
 * -「キャラボイス」とは、ファイル名の頭に特定の文字列(パラメータで設定)が
 *  付いたSEです。
 * - 変数(パラメータで番号を指定)か、オプションで ボリューム が切り替えられ、
 *  これらの設定は連動します。
 * 
 * - システムで使用する音声(ロードやセーブ)もキャラボイスで設定可能です。
 *  この場合、キャラボイスの音量がゼロの時、
 *  プレフィックス（ファイルの頭に付ける文字）の付かない名前のファイルを
 *  演奏することも可能です（オプションにて）。
 *  注意：プレフィックスの付かないファイルは、不要素材削除ツールで
 *  　　　削除される可能性があります。
 *
 * 注意:
 * - キャラボイスのオプションはタイトル画面では表示されません。
 */

(function() {

  //
  // process parameters
  //
  var parameters = PluginManager.parameters('ConfigCharVoice');
  var optionName = parameters['Option Name'] || 'Voice SE Volume';
  var volumeVariableId = Number(parameters['Voice Volume Variable ID'] || 21);
  var charVoiceFilePrefix = parameters['Character Voice Prefix'] || '';
  var defaultVolume = Number(parameters['Default Voice Volume'] || 100);
  var playAnotherSystemSe = !!Number(parameters['Play Another System SE'] || 0);

  //
  // play charater voice
  //
  var charVoiceVolume = function() {
    return $gameVariables.value(volumeVariableId);
  };

  var isCharVoiceFileName = function(name) {
    return name.indexOf(charVoiceFilePrefix) === 0;
  };

  var normalSystemName = function(name) {
    return name.slice(charVoiceFilePrefix.length);
  };

  var _AudioManager_playSe = AudioManager.playSe;
  AudioManager.playSe = function(se) {
    if (se.name && isCharVoiceFileName(se.name)) {
      se.volume = charVoiceVolume();
      if (se.volume === 0) { // for efficiency, don't load SE if it's silent.
        return;
      }
    }
    _AudioManager_playSe.call(this, se);
  };

  //
  // play system character voice
  //
  var _AudioManager_playStaticSe = AudioManager.playStaticSe;
  AudioManager.playStaticSe = function(se) {
    if (se.name && isCharVoiceFileName(se.name)) {
      if (charVoiceVolume() > 0) {
        var se2 = {};
        se2.name = se.name;
        se2.volume = charVoiceVolume();
        se2.pitch = se.pitch;
        se2.pan = se.pan;
        _AudioManager_playSe.call(this, se2); // note: play as normal SE.
        return;
      } else if (playAnotherSystemSe) {
        var se2 = {};
        se2.name = normalSystemName(se.name);
        se2.volume = se.volume;
        se2.pitch = se.pitch;
        se2.pan = se.pan;
        _AudioManager_playStaticSe.call(this, se2);
        return;
      } else {
        return;
      }
    }
    _AudioManager_playStaticSe.call(this, se);
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
      this.addCommand(optionName, 'characterVoiceVolume');
    }
    _Window_Options_makeCommandList.call(this);
  };

  var _Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
  Window_Options.prototype.getConfigValue = function(symbol) { 
    switch (symbol) {
    case 'characterVoiceVolume':
      return $gameVariables.value(volumeVariableId);
    default:
      return _Window_Options_getConfigValue.call(this, symbol);
    }
  };

  var _Window_Options_setConfigValue = Window_Options.prototype.setConfigValue;
  Window_Options.prototype.setConfigValue = function(symbol, volume) {
    switch (symbol) {
    case 'characterVoiceVolume':
      return $gameVariables.setValue(volumeVariableId, volume);
    default:
      return _Window_Options_setConfigValue.call(this, symbol, volume);
    }
  };

  //
  // at new game, initialize option value
  //
  var _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function() {
    _DataManager_setupNewGame.call(this);
    $gameVariables.setValue(volumeVariableId, defaultVolume);
  };

})();
