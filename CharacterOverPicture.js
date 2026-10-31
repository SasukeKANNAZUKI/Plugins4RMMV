//=============================================================================
// CharacterOverPicture.js
//=============================================================================
/*:
 * @plugindesc display character over the picture
 * @author Sasuke KANNAZUKI
 *
 * @help plugin commands:
 * when set/unset player alone, following notation is also valid:
 * PlayerOverPicture set     # display player over the picture
 * PlayerOverPicture unset   # reset the setting
 *
 * note:
 * - when display character over the picture,
 *  character is over the all tiles and weathers and so on.
 * - player and followers' setting remains forever. when event is finisied,
 *  be sure to unset.
 * - events setting are reset when event command 'Transfer Player' is performed
 * (even if the destination is the same map).
 * - display priority among the same priority events are different from normal:
 *  in the case, later registerd event is higher priority
 */
/*:ja
 * @plugindesc キャラクターをピクチャの上に表示します
 * @author 神無月サスケ
 *
 * @help
 * プレイヤー、フォロワー（隊列歩行キャラ）、イベントを
 * ピクチャの上に置いたり、元に戻したりできます。
 * 
 * プラグインコマンド：
 * CharacterOverPicture <set|unset> <operand>
 * <set|unset> set:ピクチャの上に表示開始 unset:通常表示に戻す
 * <operand> 数値:イベントID, player:プレイヤー players:隊列全員
 * followers:プレイヤー以外の隊列
 * 例：
 * CharacterOverPicture set 5        # イベントID 5番をピクチャの上に表示
 * CharacterOverPicture unset 5      # イベントID 5番を通常の表示に戻す
 * CharacterOverPicture set 5-10     # イベントID 5-10番をまとめて上に表示
 * CharacterOverPicture set player   # プレイヤーをピクチャの上に表示
 * CharacterOverPicture set players  # 隊列全員をピクチャの上に表示
 * CharacterOverPicture unset followers  # プレイヤー以外の隊列を通常表示
 * プレイヤーのみを指定する場合、以下の指定も可能です：
 * PlayerOverPicture set     # ピクチャの上に表示開始
 * PlayerOverPicture unset   # 通常の表示に戻す
 *
 * 注意:
 * - ピクチャの上に表示されている時は、タイルや天候の上に表示されます
 * - 通行判定などは変わりません。
 * - プレイヤーやフォロワーの設定はずっと持続するので、
 *  イベント終了後などに忘れずに unset を行ってください。
 * - イベントの設定はマップの切り替え(同マップの場所移動含む)が行われると
 *  リセットされます
 * - 同じプライオリティのイベントの場合、通常の表示順序(イベントID)と異なり、
 *  後から登録した方が上に表示されます。
 * - (要検討)エンカウントに突入するとき、上位に表示されたイベントは
 *  消えずにエフェクトがかかります。
 */

(function() {
  //
  // process plugin command
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'PlayerOverPicture') {
      if (args[0] === 'set') {
        setUpperPlayerSprite(true, false);
      } else if (args[0] === 'unset') {
        setUpperPlayerSprite(false, false);
      }
    } else if (command === 'CharacterOverPicture') {
      // find args0
      var flag;
      if (args[0] === 'set') {
        flag = true;
      } else if (args[0] === 'unset') {
        flag = false;
      }
      // process args1
      if (flag === true || flag === false) {
        if (args[1] === 'player') {
          setUpperPlayerSprite(flag, false);
        } else if (args[1] === 'players') {
          setUpperPlayerSprite(flag, true);
        } else if (args[1] === 'followers') {
          setUpperFollowerSprite(flag);
        } else {
          var reg = (/^([0-9]+)\-([0-9]+)/i).exec(args[1]);
          if (reg) {
            for (var i = Number(reg[1]); i <= Number(reg[2]); i++) {
              setUpperEventSprite(i, flag);
            }
          } else {
            var num = Number(args[1]);
            if (num) {
              setUpperEventSprite(num, flag);
            }
          }
        }
      }
    }
  };

  //
  // process plugin commands
  //
  function setUpperEventSprite(eventId, flag) {
    var event = $gameMap.event(eventId);
    if (event && !!event.displayUpper !== flag) {
      event.displayUpper = flag;
      var spriteset = SceneManager._scene._spriteset;
      if (flag) { // add
        var sprite = new Sprite_UpperCharacter(event);
        spriteset._upperEventSprites[eventId] = sprite;
        spriteset._upperEventLayer.addChild(sprite);
      } else {  // remove
        var sprite = spriteset._upperEventSprites[eventId];
        spriteset._upperEventLayer.removeChild(sprite);
        spriteset._upperEventSprites[eventId] = null;
      }
    }
  }

  function setUpperPlayerSprite(flag, setFollower) {
    $gamePlayer.displayUpper = flag;
    if(setFollower) {
      setUpperFollowerSprite(flag);
    } else {
      SceneManager._scene._spriteset.modifyPlayerSpritesCreated();
    }
  }

  function setUpperFollowerSprite(flag) {
    $gamePlayer.followers().forEach(function(follower) {
      follower.displayUpper = flag;
    }, this);
    SceneManager._scene._spriteset.modifyPlayerSpritesCreated();
  }

  //
  // add setting to Game_Character
  //
  var _Game_Character_initMembers = Game_Character.prototype.initMembers;
  Game_Character.prototype.initMembers = function() {
    _Game_Character_initMembers.call(this);
    this.displayUpper = false;
  };

  //
  // add setting to sprite set
  //
  var _Spriteset_Map_createScreenSprites =
   Spriteset_Map.prototype.createScreenSprites;
  Spriteset_Map.prototype.createScreenSprites = function() {
    this.createUpperCharacterLayers();
    this.createUpperCharacters();
    _Spriteset_Map_createScreenSprites.call(this);
  };

  Spriteset_Map.prototype.createUpperCharacterLayers = function() {
    this._upperEventLayer = new UpperCharacterLayerSprite();
    this._upperEventLayer.setFrame(0, 0, Graphics.width, Graphics.height);
    this.addChild(this._upperEventLayer);
    this._upperPlayersLayer = new UpperCharacterLayerSprite();
    this._upperPlayersLayer.setFrame(0, 0, Graphics.width, Graphics.height);
    this.addChild(this._upperPlayersLayer);
  };

  Spriteset_Map.prototype.createUpperCharacters = function() {
    this._createNeededUpperEventSprites();
    this._createNeededUpperPlayerSprites();
  };

  Spriteset_Map.prototype._createNeededUpperEventSprites = function() {
    this._upperEventSprites = [];
    $gameMap.events().forEach(function(event) {
      if (event.displayUpper) {
        var sprite = new Sprite_UpperCharacter(event);
        this._upperEventSprites[event.eventId()] = sprite;
        this._upperEventLayer.addChild(sprite);
      }
    }, this);
  };

  Spriteset_Map.prototype._createNeededUpperPlayerSprites = function() {
    this._upperPlayerSpritesCreated = false;
    if(this.needToCreateUpperPlayerSprites()) {
      this._createAllUpperPlayerSprites();
    }
  };

  Spriteset_Map.prototype.needToCreateUpperPlayerSprites = function() {
    var anyFollower = false;
    $gamePlayer.followers().forEach(function(follower) {
      if (follower.displayUpper) {
        anyFollower = true;
      }
    }, this);
    if (anyFollower) {
      return true;
    }
    if ($gamePlayer.displayUpper) {
      return true;
    }
    return false;
  };

  Spriteset_Map.prototype._createAllUpperPlayerSprites = function() {
    $gamePlayer.followers().reverseEach(function(follower) {
      this._upperPlayersLayer.addChild(new Sprite_UpperCharacter(follower));
    }, this);
      this._upperPlayersLayer.addChild(new Sprite_UpperCharacter($gamePlayer));
    this._upperPlayerSpritesCreated = true;
  };

  Spriteset_Map.prototype._destroyUpperPlayerSprites = function() {
    this._upperPlayersLayer.removeChildren();
    this._upperPlayerSpritesCreated = false;
  };

  Spriteset_Map.prototype.modifyPlayerSpritesCreated = function() {
    var newState = this.needToCreateUpperPlayerSprites();
    if (newState !== this._upperPlayerSpritesCreated) {
      if (newState) {
        this._createAllUpperPlayerSprites();
      } else {
        this._destroyUpperPlayerSprites();
      }
    } else if (newState) {  // bug fix: force modify sprite condition
        this._destroyUpperPlayerSprites();
        this._createAllUpperPlayerSprites();
    }
  };

  //
  // define original sprite layer for upper sprite
  // this is the plain sprite that appends sorting z-axis routine of Tilemap.
  //
  function UpperCharacterLayerSprite() {
    this.initialize.apply(this, arguments);
  }
  UpperCharacterLayerSprite.prototype = Object.create(Sprite.prototype);
  UpperCharacterLayerSprite.prototype.constructor = UpperCharacterLayerSprite;

  UpperCharacterLayerSprite.prototype.updateTransform = function() {
    Sprite.prototype.updateTransform.call(this);
    this._sortChildren();
  };

  UpperCharacterLayerSprite.prototype._sortChildren = function() {
    this.children.sort(this._compareChildOrder.bind(this));
  };

  UpperCharacterLayerSprite.prototype._compareChildOrder = function(a, b) {
    if (a.z !== b.z) {
        return a.z - b.z;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
  };

  //
  // setting character sprite
  //
  var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
  Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._displayUpper = false;
  };

  var _Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
  Sprite_Character.prototype.updateBitmap = function() {
    if (this._character && this._character.displayUpper) {
      if (!this._displayUpper) {
        this._displayUpper = true;
        this.loadEmptyBitmap();
      }
    } else {
      _Sprite_Character_updateBitmap.call(this);
      this._displayUpper = false;
    }
  };

  Sprite_Character.prototype.loadEmptyBitmap = function() {
    this._tileId = 0;
    this._characterName = '';
    this._characterIndex = 0;
    this.bitmap = ImageManager.loadEmptyBitmap();
  };

  //
  // define new upper sprite setting
  //
  function Sprite_UpperCharacter() {
    this.initialize.apply(this, arguments);
  }
  Sprite_UpperCharacter.prototype = Object.create(Sprite_Character.prototype);
  Sprite_UpperCharacter.prototype.constructor = Sprite_UpperCharacter;

  Sprite_UpperCharacter.prototype.updateBitmap = function() {
    if (this._character && this._character.displayUpper) {
      _Sprite_Character_updateBitmap.call(this);
      this._displayUpper = true;
    } else {
      if (this._displayUpper) {
        this._displayUpper = false;
      }
      if (!this.bitmap) {
        this.loadEmptyBitmap();
      }
    }
  };

})();
