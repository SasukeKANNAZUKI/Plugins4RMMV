//=============================================================================
// SeparateFollowers.js
//=============================================================================
/*:
 * @plugindesc Separate Followers On Map
 * @author Sasuke KANNAZUKI
 *
 * @param Start Variable ID of Actor IDs
 * @desc Variables to store each follower's actor ID.
 * @default 21
 *
 * @param Change Timing
 * @desc 1:immidiately 0:when once menu scene is called
 * @default 0
 *
 * @help
 *
 * [Summary]
 * This plugin assumes leader talks with each follower.
 * Make event command according to stored variable ids' value.
 *
 * [Plugin Commands]
 * SeparateFollowers on    // function this plugin
 * SeparateFollowers off   // stop to function this plugin (default)
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc フォロワーを隊列からはずし別の場所に表示する機能を提供します。
 * @author 神無月サスケ
 *
 * @param Start Variable ID of Actor IDs
 * @desc アクター達のIDを4人連番で格納する変数の最初のIDです。該当キャラがいない時変数の値は0になります。
 * @default 21
 *
 * @param Change Timing
 * @desc プラグインコマンドが効力を発揮するタイミングです。1:即座に 0:メニューを一度表示して消した時
 * @default 0
 *
 * @help
 *
 * ■概要
 * 宿屋などでアクターが他のフォロワー達と会話をするシーンを想定しています。
 * フォロワーはメニューを開くと表示されます。
 * フォロワーのアクターIDはパラメータの変数IDから3つ連番で保存されますので、
 * それに応じてイベントを作るとよいでしょう。
 *
 * ■プラグインコマンド
 * SeparateFollowers on    // この機能を有効にします。
 * SeparateFollowers off   // この機能を無効にします(デフォルト)
 * 変更は、一旦メニューを閉じて再び開いたときに有効になります。
 * 即更新されませんのでご注意を。
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
  var parameters = PluginManager.parameters('SeparateFollowers');
  var followerVarId = +(parameters['Start Variable ID of Actor IDs'] || 21);
  var immidateChange = !!Number(parameters['Change Timing'] || 0);

  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'SeparateFollowers') {
      switch (args[0]) {
      case 'on':
      case 'ON':
        $gameParty.followerSeparated = true;
      break;
      case 'off':
      case 'OFF':
        $gameParty.followerSeparated = false;
      break;
      }
      if (immidateChange) {
        onMenuClose();
      }
    }
  };

  var _Game_Party_initialize = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function () {
    _Game_Party_initialize.call(this);
    this.followerSeparated = false;
    this.originalFollowerSearated = null;
  };

  var isFollowerVisible = function () {
    return $gamePlayer.followers().isVisible();
  };

  var onMenuClose = function () {
    if ($gameParty.followerSeparated) {
      if ($gameParty.originalFollowerSearated == null) {
        $gameParty.originalFollowerSearated = isFollowerVisible();
      }
      $gamePlayer.hideFollowers();
      for (i = 0; i <= 3; i++) {
        var actor = $gameParty.members()[i];
        $gameVariables.setValue(followerVarId + i, actor ? actor._actorId : 0);
      }
    } else {
      if ($gameParty.originalFollowerSearated) {
        $gamePlayer.showFollowers();
        $gameParty.originalFollowerSearated = null;
      }
    }
    $gamePlayer.refresh();
    $gameMap.requestRefresh();
  };

  _Scene_Menu_terminate = Scene_Menu.prototype.terminate;
  Scene_Menu.prototype.terminate = function() {
    _Scene_Menu_terminate.call(this);
    onMenuClose();
  };

})();
