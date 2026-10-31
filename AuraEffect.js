//=============================================================================
// AuraEffect.js
//=============================================================================

/*:
 * @plugindesc Add aura background effect to battlers
 * @author Sasuke KANNAZUKI (thx to tomoaky)
 * 
 * @param Aura State ID
 * @desc when this state added, aura will be appear
 * @default 10
 * 
 * @help This plugin does not provide plugin commands.
 *
 * copyright: this plugin is based on tomoaky's RGSS3 script material.
 * see "Hikimoki" http://hikimoki.sakura.ne.jp/
 * Thanks to tomoaky.
 */

/*:ja
 * @plugindesc バトラーが特定のステート時にオーラ風エフェクトを表示します
 * @author 神無月サスケ (原案: tomoaky)
 * 
 * @param Aura State ID
 * @desc オーラを表示するステートのIDです。
 * @default 10
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * 著作権表記:
 * このプラグインは、tomoaky氏のRGSS3素材をベースに作成しました。
 * Webサイト：ひきも記 http://hikimoki.sakura.ne.jp/
 * tomoaky氏に謝意を示します。
 */
(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('AuraEffect');
  var auraStateID = Number(parameters['Aura State ID'] || 10);

  //
  // aura state judge routine
  //
  Game_Battler.prototype.isAuraState = function() {
    return this.isStateAffected(auraStateID);
  };

  Sprite_Battler.prototype.isAuraState = function() {
    if (this._battler) {
      return this._battler.isAuraState();
    } else {
      return false;
    }
  };

  //
  // aura sprite initialization
  //
  _Sprite_Battler_initialize = Sprite_Battler.prototype.initialize;
  Sprite_Battler.prototype.initialize = function(battler) {
    _Sprite_Battler_initialize.call(this, battler);
    this.initAuraSprite();
  };

  Sprite_Battler.prototype.initAuraSprite = function() {
    this.auraSprite = new Sprite_Base();
    this.auraSprite.anchor.x = 0.5;
    this.auraSprite.anchor.y = 0.5;
    this.auraSprite.blendMode = Graphics.BLEND_ADD;
    this.auraSprite.visible = false;
    this.auraCount = 0;
  };

  var _Sprite_addChild = Sprite.prototype.addChild;
  Sprite.prototype.addChild = function(child) {
    // add auraSprite behind main sprite.
    if (child instanceof Sprite_Battler) {
      if (child.auraSprite instanceof Sprite) {
        this.addChildAt(child.auraSprite, this.children.length);
      }
    }
    return _Sprite_addChild.call(this, child);
  };

  //
  // set position
  //
  var _Sprite_Actor_updatePosition = Sprite_Actor.prototype.updatePosition;
  Sprite_Actor.prototype.updatePosition = function() {
    _Sprite_Actor_updatePosition.call(this);
    var s = this._mainSprite;
    if (s.bitmap) {
      this.auraSprite.x = this.x - s.width * (s.anchor.x - 0.5);
      this.auraSprite.y = this.y - s.height * (s.anchor.y - 0.5);
    }
  };

  var _Sprite_Enemy_updatePosition = Sprite_Enemy.prototype.updatePosition;
  Sprite_Enemy.prototype.updatePosition = function() {
    _Sprite_Enemy_updatePosition.call(this);
    if (this.bitmap) {
      this.auraSprite.x = this.x - this.width * (this.anchor.x - 0.5);
      this.auraSprite.y = this.y - this.height * (this.anchor.y - 0.5);
    }
  };

  //
  // set bitmap
  //
  var _Sprite_Actor_updateBitmap = Sprite_Actor.prototype.updateBitmap;
  Sprite_Actor.prototype.updateBitmap = function() {
    var name = this._battlerName;
    _Sprite_Actor_updateBitmap.call(this);
    if (name !== this._battlerName) {
      this.auraSprite.bitmap = this._mainSprite.bitmap;
    }
  };

  var _Sprite_Enemy_updateBitmap = Sprite_Enemy.prototype.updateBitmap;
  Sprite_Enemy.prototype.updateBitmap = function() {
    var name = this._battlerName;
    var hue = this._battlerHue;
    _Sprite_Enemy_updateBitmap.call(this);
    if(name !== this._battlerName || hue !== this.hue) {
      this.auraSprite.bitmap = this.bitmap;
    }
  };

  //
  // set bitmap frame
  //
  var _Sprite_Actor_updateFrame = Sprite_Actor.prototype.updateFrame;
  Sprite_Actor.prototype.updateFrame = function() {
    _Sprite_Actor_updateFrame.call(this);
    var bitmap = this._mainSprite.bitmap;
    if (bitmap) {
      var f = this._mainSprite._frame;
      this.auraSprite.setFrame(f.x, f.y, f.width, f.height);
    }
  };

  var _Sprite_Enemy_updateFrame = Sprite_Enemy.prototype.updateFrame;
  Sprite_Enemy.prototype.updateFrame = function() {
    _Sprite_Enemy_updateFrame.call(this);
    var f = this._frame;
    this.auraSprite.setFrame(f.x, f.y, f.width, f.height);
  };

  //
  // set visibility
  //
  var _Sprite_Actor_updateVisibility = Sprite_Actor.prototype.updateVisibility;
  Sprite_Actor.prototype.updateVisibility = function() {
    _Sprite_Actor_updateVisibility.call(this);
    if (this.isAuraState()) {
      this.auraSprite.visible = this._mainSprite.visible;
    } else {
      this.auraSprite.visible = false;
    }
  };

  var _Sprite_Enemy_updateVisibility = Sprite_Enemy.prototype.updateVisibility;
  Sprite_Enemy.prototype.updateVisibility = function() {
    _Sprite_Enemy_updateVisibility.call(this);
    if (this.isAuraState()) {
      this.auraSprite.visible = this.visible;
    } else {
      this.auraSprite.visible = false;
    }
  };

  //
  // main configuration
  //
  var _Sprite_Actor_update = Sprite_Actor.prototype.update;
  Sprite_Actor.prototype.update = function() {
    _Sprite_Actor_update.call(this);
    if (this._actor) {
      this.updateAuraSprite();
    }
  };

  var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function() {
    _Sprite_Enemy_update.call(this);
    if(this._enemy) {
      this.updateAuraSprite();
    }
  };

  Sprite_Battler.prototype.updateAuraSprite = function() {
    if (this.isAuraState()) {
      this.auraSprite.opacity = this.opacity * 0.75;
      this.auraCount = (this.auraCount + 1) % 180;
      var scale = Math.sin(Math.PI * this.auraCount / 90) * 0.05 + 1.1;
      this.auraSprite.scale.set(scale, scale);
    }
  };

})();
