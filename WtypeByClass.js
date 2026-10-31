//=============================================================================
// WtypeByClass.js
//=============================================================================
/*:
 * @plugindesc Change damage ratio of weapon for each class, each weapon type
 * @author Sasuke KANNAZUKI
 *
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [Notation]
 * Write down at note in Class as followin notation.
 * <SkillTypeRatio:1=200%> // weapon wtypeId 1 200% power
 * <SkillTypeRatio:1=200>  // the same of above. % is always omissible
 * <SkillTypeRatio:1=200%, 2=50%> // in addition above, wtypeId 2 50%
 * <SkillTypeRatio:1=200%, 2=50%, 3=150%, 4=75%> // no limit to describe
 *
 * Following notations are also acceptable.
 * <SkillTypeRatio:1 = 200%>  // you can put space around equal
 * <SkillTypeRatio:1=200%;2=50%> // you can use semicolon instead of colon
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 職業ごとに、武器タイプごとに、武器の威力を変更できます。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■書式
 * 職業のメモに以下の書式で書いてください。
 * <SkillTypeRatio:1=200%> // 武器タイプ1の効果を200%にします。
 * <SkillTypeRatio:1=200>  // 同上。% は省略可能
 * <SkillTypeRatio:1=200%, 2=50%> // 上記に加え、武器タイプ2を 50%にします
 * <SkillTypeRatio:1=200%, 2=50%, 3=150%, 4=75%> // このように複数設定可能です
 *
 * なお、区切り文字やスペースはある程度自由です。
 * <SkillTypeRatio:1 = 200%>  // = の間にスペースを挟めます
 * <SkillTypeRatio:1=200%;2=50%> // ,の代わりにセミコロンでも区切れます
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {

  //
  // initial variables
  //
  var _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this.processWtypeNote();
  };

  var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function() {
    _Game_System_onAfterLoad.call(this);
    this.processWtypeNote();
  };

  Game_System.prototype.processWtypeNote = function () {
    this._weaponTypeRatio = [];
    for (var i = 1; i < $dataClasses.length; i++) {
      var arr = this._weaponTypeRatio[i] = [];
      var notation = $dataClasses[i].meta.SkillTypeRatio;
      var reg = /([0-9]+)(?:\s*)=(?:\s*)([0-9]+)(?:%?)/g;
      var match;
      while (match = reg.exec(notation)) {
        // match[1] = wtypeId, match[2] = ratio
        arr[Number(match[1])] = Number(match[2]);
      }
    }
  };

  //
  // change actor's weapon power
  //
  
  Game_Actor.prototype.applyWTypeRatio = function (weapon) {
    var ratio = $gameSystem._weaponTypeRatio[this._classId];
    ratio = ratio != null ? ratio[weapon.wtypeId] : null;
    return ratio != null ? ratio / 100 : 1;
  };

  Game_Actor.prototype.revisedItemParam = function (item, paramId) {
    value = item.params[paramId];
    if (DataManager.isWeapon(item)) {
      value = Math.round(value * this.applyWTypeRatio(item));
    }
    return value;
  };

  // NOTE: over written
  Game_Actor.prototype.paramPlus = function(paramId) {
    var value = Game_Battler.prototype.paramPlus.call(this, paramId);
    var equips = this.equips();
    for (var i = 0; i < equips.length; i++) {
      var item = equips[i];
      if (item) {
        value += this.revisedItemParam(item, paramId);
      }
    }
    return value;
  };

  //
  // change description in shop status
  //
  // NOTE: over written
  Window_ShopStatus.prototype.drawActorParamChange = function(x, y, actor,
   item1) {
    var width = this.contents.width - this.textPadding() - x;
    var paramId = this.paramId();
    // *** changed following 2 lines
    var change = actor.revisedItemParam(this._item, paramId) - 
     (item1 ? actor.revisedItemParam(item1, paramId) : 0);
    this.changeTextColor(this.paramchangeTextColor(change));
    this.drawText((change > 0 ? '+' : '') + change, x, y, width, 'right');
  };

  // NOTE: over written
  Window_ShopStatus.prototype.currentEquippedItem = function(actor, etypeId) {
    var list = [];
    var equips = actor.equips();
    var slots = actor.equipSlots();
    for (var i = 0; i < slots.length; i++) {
        if (slots[i] === etypeId) {
            list.push(equips[i]);
        }
    }
    var paramId = this.paramId();
    var worstParam = Number.MAX_VALUE;
    var worstItem = null;
    for (var j = 0; j < list.length; j++) {
      // *** changed following 2 lines
      if (list[j] && actor.revisedItemParam(list[j], paramId) < worstParam) {
        worstParam = actor.revisedItemParam(list[j], paramId);
        worstItem = list[j];
      }
    }
    return worstItem;
  };
})();
