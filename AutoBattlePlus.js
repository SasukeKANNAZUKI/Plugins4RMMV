//=============================================================================
// AutoBattlePlus.js (ver 1.1)
//=============================================================================

/*:
 * @plugindesc add 'auto' and 'repeat' to battle party command
 * @author Sasuke KANNAZUKI (thx to tomoaky)
 * 
 * @param Auto Command Name
 * @desc Command name of Auto
 * @default Auto
 *
 * @param Repeat Command Name
 * @desc Command name of Repeat
 * @default Repeat
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * - Choose "Auto" to all actors determine automatically their actions
 *   at the turn.
 * - Choose "Repeat" to make actors the same action as the previous turn.
 *
 * note:
 * - At "Repeat" mode, when the actor cannot perform the same action
 * (ex. MP has run out), perform normal attack instead.
 * - When choose "Repeat" at first turn, let all actions be normal attack.
 *
 * note2:(added Ver1.1)
 * - As default, the actor's default attack is binded normal attack,
 *  if you want to change the default attack, write down each actor's note:
 *  <defaultSkill:28>
 * in this case, the actos's default attacks's skill id is 28.
 *
 * copyright: this plugin is based on tomoaky's RGSS3 script material.
 * see "Hikimoki" http://hikimoki.sakura.ne.jp/
 * Thanks to tomoaky.
 *
 * This plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc パーティコマンドに「自動戦闘」と「リピート」を追加します
 * @author 神無月サスケ (原案: tomoaky)
 * 
 * @param Auto Command Name
 * @desc 自動戦闘のコマンド名です
 * @default 自動戦闘
 *
 * @param Repeat Command Name
 * @desc リピートのコマンド名です
 * @default リピート
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * - 「自動戦闘」を選ぶと、そのターンの間だけ全アクターが
 *   自動戦闘の状態になります。
 * - 「リピート」を選ぶと、全アクターが前のターンと同じ行動をとります。
 *
 * 注意:
 * - 前のターンと同じ行動がコスト不足などで実行できない場合は
 *   代わりに通常攻撃を行います。
 * - １ターン目にリピートを選択した場合は全アクターの行動が通常攻撃になります。
 * - 前ターン開始時に選択されている行動がリピート対象となります。、
 *   コスト不足などで行動内容が変化した場合、次ターン以降も変化したままです。
 *
 * Ver1.1追加仕様：
 * - 上記のように、リピートではデフォルトの際「通常攻撃」を行います。
 *  仮に別のスキルID の行動をさせたい場合、そのアクターのメモに
 *  <defaultSkill:28>
 *  のように書いてください。この場合、通常攻撃の代わりに28番が採用されます。
 *
 * 著作権表記:
 * このプラグインは、tomoaky氏のRGSS3素材をベースに作成しました。
 * Webサイト：ひきも記 http://hikimoki.sakura.ne.jp/
 * tomoaky氏に謝意を示します。
 *
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('AutoBattlePlus');
  var autoName = parameters['Auto Command Name'] || 'Auto';
  var repeatName = parameters['Repeat Command Name'] || 'Repeat';

  //
  // add commands and handlers
  //
  Window_PartyCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.fight,  'fight');
    this.addCommand(autoName,           'auto');
    this.addCommand(repeatName,         'repeat');
    this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
  };

  var _Scene_Battle_createPartyCommandWindow =
   Scene_Battle.prototype.createPartyCommandWindow;
  Scene_Battle.prototype.createPartyCommandWindow = function() {
    _Scene_Battle_createPartyCommandWindow.call(this);
    this._partyCommandWindow.setHandler('auto', this.commandAuto.bind(this));
    this._partyCommandWindow.setHandler('repeat', this.commandRepeat.bind(this));
  };

  //
  // handler functions
  //
  Scene_Battle.prototype.commandAuto = function() {
    $gameParty.members().forEach(function(actor) {
      if (actor.canMove() && actor._actionState  === 'undecided') {
        actor.makeAutoBattleActions();
      }
    });
    this.endCommandSelection();
    BattleManager.startTurn();
  };

  Scene_Battle.prototype.commandRepeat = function() {
    BattleManager.resumeCommandRecord();
    this.endCommandSelection();
    BattleManager.startTurn();
  };

  //
  // command record cotrol functions
  //
  var _BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function() {
    _BattleManager_initMembers.call(this);
    this.resetCommandRecord();
  };

  var _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function() {
    _BattleManager_startBattle.call(this);
    this.resetCommandRecord();
  };

  var _BattleManager_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function() {
    this.setCommandRecord();
    _BattleManager_startTurn.call(this);
  };

  //
  // record command module
  //
  BattleManager.resetCommandRecord = function() {
    this._commandRecord = [];
  };

  BattleManager.setCommandRecord = function() {
    var actors = $gameParty.members();
    for (var i = 0; i < actors.length; i++) {
      if (actors[i].canMove()) {
        this._commandRecord[i] = actors[i]._actions.clone();
      }
    }
  };

  BattleManager.resumeCommandRecord = function() {
    var actors = $gameParty.members();
    for (var i = 0; i < actors.length; i++) {
      var actor = actors[i];
      if(!actor.canMove()) {
        actor.clearActions();
      }
      if (actor.canMove() && actor._actionState  === 'undecided') {
        var oldAct = this._commandRecord[i] || [];
        for (var j = 0; j < actor.numActions() ; j++) {
          if (oldAct[j] && oldAct[j].isValid()) {
	        actor._actions[j] = oldAct[j];
	      } else {
	        actor._actions[j].setAttack();
	      }
        }
      }
    }
  };

  //
  // set default attack
  //
  var _Game_Action_setAttack = Game_Action.prototype.setAttack;
  Game_Action.prototype.setAttack = function() {
    var defaultId = null;
    if (defaultId = Number(this.actor().meta.defaultSkill)) {
      this.setSkill(defaultId);
    } else {
      _Game_Action_setAttack.call(this);
    }
  };

})();
