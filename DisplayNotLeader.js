//=============================================================================
// DisplayNotLeader.js
//=============================================================================
/*:
 * @plugindesc On map scene, it'll not display leader actor.
 * @author Sasuke KANNAZUKI
 *
 * @help
 * [Summary]
 * Do not display leader actor on map.
 *
 * [Plugin Commands]
 * DisplayNotLeader on     // function this plugin(default)
 * DisplayNotLeader off     // suspend to function this plugin
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 先頭のアクターをマップ上で表示しません。
 * @author 神無月サスケ
 *
 * @help
 *
 * ■プラグインコマンド
 * DisplayNotLeader on     // プラグインの機能を有効にします(デフォルト)
 * DisplayNotLeader off    // プラグインの機能を一時的に無効化します
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'DisplayNotLeader') {
      switch (args[0]) {
      case 'on':
      case 'ON':
        $gameParty.displayNotLeader = false;
      break;
      case 'off':
      case 'OFF':
        $gameParty.displayNotLeader = true;
      break;
      }
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
    }
  };

  var _Game_Party_initialize = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function () {
    _Game_Party_initialize.call(this);
    this.displayNotLeader = false;
  };

  Game_Party.prototype.leader = function() {
    var val = this.displayNotLeader ? 0 : 1;
    return this.battleMembers()[val];
  };

  Game_Follower.prototype.actor = function() {
    var val = $gameParty.displayNotLeader ? 0 : 1;
    return $gameParty.battleMembers()[this._memberIndex + val];
  };

})();
