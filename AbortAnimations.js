//=============================================================================
// AbortAnimations.js
//=============================================================================

/*:
 * @plugindesc Abort all current animations on map and battle
 * @author Sasuke KANNAZUKI
 * 
 * @help
 * Plugin Command:
 * AbortAnimations             # no parameter (not stop SE)
 * AbortAnimations stopSound   # also stop all SEs playing
 * 
 * note:
 * when stop SE, all SEs including non-related with animation are also stop.
 */
/*:ja
 * @plugindesc 表示中のアニメーションを強制的に終了させます
 * @author 神無月サスケ
 * 
 * @help
 * プラグインコマンド:
 * AbortAnimations             # パラメータなし(SEは終了しません)
 * AbortAnimations stopSound   # アニメと同時にSEも強制終了
 *
 * 注意：
 * - マップ上、戦闘中、いずれでも有効です。
 * - SEを終了する場合、アニメーション以外のSEも同時に終了します。
 */
(function() {

  //
  // judgement variable and functions
  //
  var _forceTerminateAnimation = false;

  var forceTerminateAnimationRequested = function() {
    return _forceTerminateAnimation;
  };

  var clearForceTerminateAnimation = function() {
    _forceTerminateAnimation = false;
  };

  var requestForceTerminateAnimation = function() {
    _forceTerminateAnimation = true;
  };

  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'AbortAnimations') {
      requestForceTerminateAnimation();
      if (args[0] === 'stopSound') {
        AudioManager.stopSe();
      }
    }
  };

  //
  // clear the flag after all animations abortion
  //
  var _Spriteset_Base_update = Spriteset_Base.prototype.update;
  Spriteset_Base.prototype.update = function() {
    _Spriteset_Base_update.call(this);
    clearForceTerminateAnimation();
  };

  //
  // force to remove(=terminate) all displaying animations
  //
  var _Sprite_Base_updateAnimationSprites =
   Sprite_Base.prototype.updateAnimationSprites;
  Sprite_Base.prototype.updateAnimationSprites = function () {
    if (forceTerminateAnimationRequested()) {
      this.forceTerminateAnimation();
    }
    _Sprite_Base_updateAnimationSprites.call(this);
  };

  Sprite_Base.prototype.forceTerminateAnimation = function () {
    if (this._animationSprites.length > 0) {
      var sprites = this._animationSprites;
      for (var i = 0; i < sprites.length; i++) {
         sprites[i].remove();
      }
    }
    this._animationSprites = [];
  };

  Sprite_Character.prototype.forceTerminateAnimation = function () {
    Sprite_Base.prototype.forceTerminateAnimation.call(this);
    this._character.endAnimation();
  };

  //
  // cancel all reserved animations
  //
  var _Sprite_Battler_setupAnimation = Sprite_Battler.prototype.setupAnimation;
  Sprite_Battler.prototype.setupAnimation = function() {
    if (forceTerminateAnimationRequested()) {
      this._battler.clearAnimations();
    }
    _Sprite_Battler_setupAnimation.call(this);
  };

  var _Sprite_Character_setupAnimation =
   Sprite_Character.prototype.setupAnimation
  Sprite_Character.prototype.setupAnimation = function() {
    if (forceTerminateAnimationRequested()) {
      this._character.requestAnimation(0);
    }
    _Sprite_Character_setupAnimation.call(this);
  };

})();
