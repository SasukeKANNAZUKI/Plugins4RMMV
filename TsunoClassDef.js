//=============================================================================
// TsunoClassDef.js
//=============================================================================
/*:
 * @plugindesc Tsuno's Class Definition Test(WIP)
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc 尾角つのさん考案のクラス定義ルーチン(制作中)
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {

  // 注：これだけでは動かない
  ClassName = function(_super) {

    // クラスの作成
    function _class() {
      this.initialize.apply(this, arguments);
    }

    // クラスの継承
    _class.prototype = Object.create(_super.prototype);
    _class.prototype.constructor = _class;

    var _def = _class.prototype;
    var _superDef = _super.prototype;

    // クラスの初期化
    _class.prototype.initialize = function () {
    _super.prototype.initialize.call(this);
    // その後いろいろ
    // ～～～;
   };

    // 関数A
    _class.prototype.functionA = function() {
      // 何かする
      // ～～～;
    };

    //～～～;

    return _class;
  }(SuperClass);
})();
