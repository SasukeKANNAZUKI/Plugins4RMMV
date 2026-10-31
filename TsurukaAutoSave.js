//=============================================================================
// TsurukaAutoSave.js
//=============================================================================
/*:
 * @plugindesc plugin to solve Tsuruka's auto save problem
 * @author Sasuke KANNAZUKI
 *
 * @param STsound
 * @desc whether to play music or not
 * @default 1
 *
 * @param savingSwitchId
 * @desc switch id to use only for auto save routine.
 * @default 7
 *
 * @help
 * This plugin is experimental. do not import to your project.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 鶴香さんのオートセーブ問題の検証＆解決プラグイン
 * @author 神無月サスケ
 *
 * @param STsound
 * @desc 音声を出すかどうか
 * @default 1
 *
 * @param savingSwitchId
 * @desc オートセーブ用のスイッチID。別の用途に使用しないで下さい。
 * @default 7
 *
 * @help
 *
 * ■プラグインコマンド
 * autosave    # オートセーブが行われます。
 *
 * ■鶴香さんの主張する問題点
 * - これでセーブしたファイルをロードすると開始前にセーブのSEが演奏されてしまう
 *
 * ■検証結果：再現した
 * 原因はどうやら、ロード直後に、セーブする関数が実行されていることのようだ。
 * 解決方法：セーブ用にスイッチをひとつ準備する
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
  var parameters = PluginManager.parameters('TsurukaAutoSave');
  var STsound = Number(parameters['STsound'] || 1);
  var savingSwitchId = Number(parameters['savingSwitchId'] || 7);

  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'autosave') {
      _autoSave();
    }
  };

  //
  // auto save routine
  //
  var _autoSave = function () {
    Scene_File.prototype.onSavefileOk.call(this);
    $gameSystem.onBeforeSave();
    // ★セーブ用スイッチがONの時
    if ($gameSwitches.value(savingSwitchId)) {
      // ロード直後
      $gameSwitches.setValue(savingSwitchId, false);
      return;
    } else {
      // セーブ直前
      $gameSwitches.setValue(savingSwitchId, true);
    }
    if (DataManager.saveGame(DataManager.lastAccessedSavefileId())) {
      // ★デバッグ：セーブ番号の表示
      console.log("save id:",DataManager.lastAccessedSavefileId());
      if(STsound == 1){
        SoundManager.playSave();
      }
    } else {
      if(STsound == 1){
        SoundManager.playBuzzer();
      }
    }
    // セーブ用スイッチの後始末
    $gameSwitches.setValue(savingSwitchId, false);
  };

/* 以下、デバッグ時に使用したルーチン。削除推奨
  //
  // セーブ音を鳴らす際にスタックトレース表示
  //
  var _SoundManager_playSave = SoundManager.playSave;
  SoundManager.playSave = function() {
    // ★分かったこと：ロード後も、上記の _autoSave が呼ばれている！
    console.trace();
    _SoundManager_playSave.call(this);
  };
*/

})();
