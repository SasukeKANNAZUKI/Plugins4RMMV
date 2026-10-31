//=============================================================================
// AnimeOverThePicture.js
//=============================================================================

/*:
 * @plugindesc display animation over the picture at map/battle scene
 * @author Sasuke KANNAZUKI
 *
 * @help
 * Plugin Commands:
 * AnimeOverThePicture true     # start to display animation over the picture
 * AnimeOverThePicture false    # display animation normal layer
 * default is false.
 * 
 * Copyright: this plugin is based on Koma's BattleAnimationOverThePictures.js.
 * Thx to Koma.
 */
/*:ja
 * @plugindesc アニメーションをピクチャの上に表示します
 * @author 神無月サスケ
 *
 * @help
 * 戦闘中、マップ双方でアニメーションをピクチャの上に表示します。
 * 
 * プラグインコマンド:
 * AnimeOverThePicture true     # ピクチャの上にアニメを表示するようにします
 * AnimeOverThePicture false    # アニメを本来のレイヤに表示するようにします
 * デフォルトでは false ですので、必要に応じて true にしてください。
 *
 * 謝辞: このプラグインは、こま氏(http://i.gmobb.jp/nekoma/rpg_tkool/)の
 *  BattleAnimationOverThePictures.js をベースに作成されました。
 *  こま氏に謝意を示します。
 */

(function() {

  //
  // init variable
  //
  var displayAnimeOverPicture = false;

  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'AnimeOverThePicture') {
      displayAnimeOverPicture = !!eval(args[0]);
    }
  };

  //
  // move animation sprite to over picture
  //
  Sprite_Base.prototype.latestAnimationSprite = function() {
    return this._animationSprites[this._animationSprites.length - 1];
  };

  var _Sprite_Base_startAnimation =
   Sprite_Base.prototype.startAnimation;
  Sprite_Base.prototype.startAnimation = function(animation, mirror, delay)  {
    _Sprite_Base_startAnimation.call(this, animation, mirror, delay);
    if (displayAnimeOverPicture) {
      var sprite = this.latestAnimationSprite();
      this.parent.removeChild(sprite);
      SceneManager._scene._spriteset._pictureContainer.addChild(sprite);
    }
  };

  var _Sprite_Animation_updatePosition =
   Sprite_Animation.prototype.updatePosition;
  Sprite_Animation.prototype.updatePosition = function() {
    _Sprite_Animation_updatePosition.call(this);
    if (displayAnimeOverPicture) {
      var parent = this._target.parent;
      if (parent instanceof Sprite_Actor) {
        this.x += parent.x;
        this.y += parent.y;
      }
    }
  };
})();
