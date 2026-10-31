//=============================================================================
// ReviceBattleItemNumber.js (Ver1.0.4)
//=============================================================================
// 2017.Jul.06 1.0.0 first release
// 2017.Jul.07 1.0.3 fix several bugs
// 2017.Nov.26 1.0.4 fix bug when the party have no items, it'll invoke error.

/*:
 * @plugindesc In Battle, reduce item number that previous actor choosed
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [Summary]
 * At current system, display item number is fixed on battle.
 * Sometimes this specification invokes problem for example...
 * - 3 actors choose the same item that the party have only 1, 2 actors
 *   can't do anyhing at the turn (the item assumes consume item)
 * - Even if the party has an item that never consume only 1, all actor can
 *   choose it and acutually effective. It's not natural.
 *
 * This plugin solves the problem by reducing that previous actors choose
 * item number. Do not worry the item reduced is only on screen,
 * actually, the items not reduced until the actor uses in the battle.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 戦闘時、先にアクターが使用したアイテム数を減らして表示します。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■概要
 * 従来のシステムでは、アイテムの数は固定表示でした。
 * このため、１個しかないアイテムを２人以上が選択し、使えない人が出てきたり、
 * 使用回数無制限のアイテムをひとつ持っていれば、全員が使うことが出来ました。
 *
 * このプラグインでは、先に入力したアクターが選択したアイテムの分、
 * 数を減らして表示するため、上記のような問題が回避されます。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  //
  // initialization and termination
  //
  var _BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function() {
    _BattleManager_initMembers.call(this);
    this.reservedItem = new Array($dataItems.length);
  };

  var _BattleManager_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function(result) {
    this.reservedItem = null;
    _BattleManager_endBattle.call(this, result);
  };

  var _BattleManager_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function() {
    _BattleManager_startTurn.call(this);
    this.reservedItem = new Array($dataItems.length);
  };

  //
  // reduced the actor choose item number
  //
  Scene_Battle.prototype.reduceDisplayItemNumber = function () {
    var action = BattleManager.inputtingAction();
    if (action && action.isItem()) {
      var item = this._itemWindow.item();
      if (item && DataManager.isItem(item)) {
        var reducedNum = BattleManager.reservedItem[item.id];
        BattleManager.reservedItem[item.id] = reducedNum ? reducedNum + 1 : 1;
      }
    }
  };

  var _Scene_Battle_onSelectAction = Scene_Battle.prototype.onSelectAction;
  Scene_Battle.prototype.onSelectAction = function() {
    var action = BattleManager.inputtingAction();
    if (action && !action.needsSelection()) { // no need to select battler
      this.reduceDisplayItemNumber();
    }
    _Scene_Battle_onSelectAction.call(this);
  };

  var _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
  Scene_Battle.prototype.onActorOk = function() {
    this.reduceDisplayItemNumber();
    _Scene_Battle_onActorOk.call(this);
  };

  var _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
  Scene_Battle.prototype.onEnemyOk = function() {
    this.reduceDisplayItemNumber();
    _Scene_Battle_onEnemyOk.call(this);
  };

  //
  // the case command cancelled
  //
  var cancelItemRequest = function (prevActor, currentActor) {
    if (prevActor !== currentActor && currentActor) {
      var action = currentActor._actions[currentActor._actionInputIndex];
      if (action && action.isItem()) {
        --BattleManager.reservedItem[action.item().id];
      }
    } else if (prevActor){
      var action = prevActor._actions[prevActor._actionInputIndex];
      if (action && action.isItem()) {
        --BattleManager.reservedItem[action.item().id];
      }
    }
  };

  var _Scene_Battle_selectPreviousCommand =
   Scene_Battle.prototype.selectPreviousCommand;
  Scene_Battle.prototype.selectPreviousCommand = function() {
    var prevActor = BattleManager.actor();
    _Scene_Battle_selectPreviousCommand.call(this);
    var currentActor = BattleManager.actor();
    cancelItemRequest(prevActor, currentActor);
  };

  //
  // routine for display window
  //
  var _Window_ItemList_initialize = Window_ItemList.prototype.initialize;
  Window_ItemList.prototype.initialize = function(x, y, width, height) {
    _Window_ItemList_initialize.call(this, x, y, width, height);
  };

  var _Window_ItemList_drawItemNumber =
   Window_ItemList.prototype.drawItemNumber;
  Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
    if ($gameParty.inBattle()) {
      var reservedItem = BattleManager.reservedItem[item.id] || 0;
      $gameParty.loseItem(item, reservedItem);
      _Window_ItemList_drawItemNumber.call(this, item, x, y, width);
      $gameParty.gainItem(item, reservedItem);
    } else {
      _Window_ItemList_drawItemNumber.call(this, item, x, y, width);
    }
  };

  var _Window_ItemList_isEnabled = Window_ItemList.prototype.isEnabled;
  Window_ItemList.prototype.isEnabled = function(item) {
    if ($gameParty.inBattle()) {
      if (item) {
        var reservedItem = BattleManager.reservedItem[item.id] || 0;
        if ($gameParty.numItems(item) - reservedItem === 0) {
          return false;
        }
      }
    }
    return _Window_ItemList_isEnabled.call(this, item);
  };

})();
