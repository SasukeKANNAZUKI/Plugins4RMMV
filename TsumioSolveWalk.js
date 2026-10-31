//=============================================================================
// TsumioSolveWalk.js
//=============================================================================

/*:
 * @plugindesc For Tsumio, I'm trying to solve his problem
 * @author Sasuke KANNAZUKI (for Tsumio)
 * *
 * @help This plugin does not provide plugin commands.
 * usage:
 * call following command by event command 'Script'.
 * SceneManager.goto(Scene_Tsumio);
 */

  // --------------------------------------------------------------------------
  // Scene_Tsumio
  // He says this is empty class.
  //
  function Scene_Tsumio() {
    this.initialize.apply(this, arguments);
  }
  Scene_Tsumio.prototype = Object.create(Scene_Base.prototype);
  Scene_Tsumio.prototype.constructor = Scene_Tsumio;

  Scene_Tsumio.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    // ここからキャラの生成
    this.mini_caharacter_ruka = new ActionGame_MiniCharacter("Ruka", 10, 10);
    this.sprite_mini_character_ruka = new Sprite_Character(
     this.mini_caharacter_ruka);
    this.addChild(this.sprite_mini_character_ruka);
  };

  Scene_Tsumio.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    this.mini_caharacter_ruka.update();
  };

  // --------------------------------------------------------------------------
  // ActionGame_MiniCharacter
  //
  function ActionGame_MiniCharacter() {
    this.initialize.apply(this, arguments);
  }
  ActionGame_MiniCharacter.prototype = Object.create(
   Game_CharacterBase.prototype);
  ActionGame_MiniCharacter.prototype.constructor = ActionGame_MiniCharacter;

  ActionGame_MiniCharacter.prototype.initialize = function(character_name,
   x, y) {
    Game_CharacterBase.prototype.initialize.call(this);
    //基本的な設定
    this.setImage(character_name, 0);
    this._originalDirection = 4;
    this._originalPattern = 2;
    this._stepAnime = true;

    //場所と向き初期化
    this.locate(x,y);
    this.setDirection(this._originalDirection);
    this.setPattern(this._originalPattern);

    //移動速度など設定
    this.setMoveSpeed(3);
    this.setMoveFrequency(3);
    this.setStepAnime(this._stepAnime);
  };

