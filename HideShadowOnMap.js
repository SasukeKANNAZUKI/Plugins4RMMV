//=============================================================================
// HideShadowOnMap.js
//=============================================================================
// release note:
// 0.0.1 2017/Jul/02 α1 : minimum inplementation
// 0.0.2 2017/Jul/03 fixed error invocation when battle starts.
// 0.0.3 2017/Jul/04 add wait and changeMask feature.
// 0.0.4 2017/Jul/06 fix the fatal error that occurs when battle beginning.
/*:
 * @plugindesc Display black rectangles on map (like Dragon Warrior)
 * @author Sasuke KANNAZUKI
 *
 * @help
 * [Summary]
 * Like ancient Dragon Warrior, displays rectangle masks in the town,
 * and player walk to the area, the mask is vanished.
 * The rectangle appears again when player walk away from the area.
 *
 * [At first you have to do]
 * This plugin requires 'InterlockPicture.js' by Sasuke KANNAZUKI.
 * Put the plugin with this plugin.
 *
 * [Plugin Commands]
 * [note 1] Write commands down in 1 line even if the example uses
 *  plural lines.
 * [note 2] parameter name is in <>. parameters in [] are omissible.
 *
 * ***Set The Mask***
 * MapMask Set <maskName> <mapId> <tileRanges>
 * <pictureId> [<maskMode> <fillMode> <option> ]
 *
 * **An Example**
 * MapMask Set Labo6_1M Labo6 [5,5,10,10][11,5,15,15] V10 standby black
 * In the case, each parameter be below.
 * <maskName> : Labo6_1M
 * <mapId> : Labo6        // remember that map name is also acceptable.
 * <tileRanges> : the ranges [5,5,10,10] and [11,5,15,15]
 * <pictureId> : The number of variable number 10 // variable is acceptable.
 * <maskMode> : standby (generate picture in picture id, but not display now)
 * <fillMode> : black
 * <option> : null(omitted)
 *
 * **About options**
 * <maskName> is the unique name of the mask. this parameter is the key,
 *   and others are values.
 * <mapId> is the mapId that displays the mask.
 *   You can set not only mapId number, but also map name, and
 *   the value of variable number 10 as V10.
 * <tileRanges> are the areas of tiling coordinates of the map.
 *   Each area description is [srcX,srcY,destX,destY].
 *   It requires at least 1 area. Never use white space in the neither
 *   array notation nor between each area notation.
 * <pictureId> is the picture id that the mask uses.
 *   You can set not only picture id, but also like V10, the value of
 *   variable number 10.
 * <maskMode> initial mask mode. You must set from below.
 *  - auto : generate picture in picture id, and display whether to
 *    the player in the area or not.
 *  - show (alias:on): generate picture in picture id, and display immidiately.
 *  - standby (alias:make): generate picture in picture id, but not display
 *    immidately, and wait until maskMode changes.
 *  - nomake (alias:off): do not generate picuture, but register the mask
 *    information.
 *  - If you omit this parameter, it is equivalent to set 'auto'.
 * <fillMode> set the rectangle's color or picture.
 *  - black: fill the rect in black.(equiv. to color [0,0,0,255])
 *  - white: fill the rect in white.(equiv. to color [255,255,255,255])
 *  - gray: fill the rect in monochrome. <option> set the brightness.
 *    if you omit <option>, the default value is 128, so color is
 *    [128,128,128,255].
 *  - color: set option array whose length is 4. these value is red, green,
 *    white, alpha channel.
 *    ex.[255,255,0,128] : half transparent yellow.
 *  - pict: set filename as <option>. the file must be in /img/pictures/.
 *    If mask's and picture's size is different, picture is centerized.
 *  - tile:set filename as <option>. the file must be in /img/pictures/.
 *    The plcture displays tiling whose origin is (0,0) to the picture.
 *  [NOTE] If you set either pict or tile, the file might be deleted at
 *    deployment. A way to avoid this, write down requiredAssets in the help.
 *  - if you omit this parameter, it is equivalent to 'black'.
 *
 * ***Change the maskMode***
 * It sets mask whose name is <maskMode> as follows.
 * MapMask auto <maskName> : set mask and display if player is in the range.
 * MapMask standby <maskName> : set mask but not diplay immidiately.
 * MapMask show <maskName> : force to display the mask.
 * MapMask on <maskName> : the same as above.
 * MapMask hide <maskName> : force not to display the mask.
 * MapMask off <maskName>  : the same as above.
 * [NOTE] If all as <maskName>, it changes all masks' maskMode.
 *
 * **Some Examples**
 * MapMask hide Labo6_1
 *   vanish mask Labo6_1
 * MapMask off Labo6_1 Labo6_2
 *   vanish both Labo6_1 and Labo6_2    # remember it enables plural masks.
 * MapMask hide all
 *   vanish all masks in the map
 *
 * ***Set events wait or not during fade in/out.
 * MapMask wait off : do not wait (defalut mode)
 * MapMask wait on  : all events including player stops during fadein/fadeout.
 *
 * ***Set fade in/out
 * MapMask fade speed <fadeFrame>
 * Set the frames (1sec = 60frame) to spend at fadein/fadeout (default=20)
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc FC版ドラクエのようにマップ上に黒い影を作ります。
 * @author 神無月サスケ
 *
 * @help
 *
 * ■概要
 * マスクの領域に入ったら、マスクが消え、そこから離れたら表示される……
 * そんな演出を実現します。
 *
 * ■最初にすべきこと
 * このプラグインの実行には、InterlockPicture.js が必要です。
 * このプラグインと一緒に、リストに加えてください。
 *
 * ■プラグインコマンド
 * ※複数行で記述されているものも１行で書いてください。
 * <>で括られたのがパラメータ名、[]で括られたパラメータは省略可能です。
 *
 * ◆マスクのセット
 * MapMask Set <マスク名> <マップID記法> <マスク範囲リスト配列>
 * <使用ピクチャID> [<マスク状態> <フィルモード> <オプション> ]
 *
 * ◇オプション解説
 * <マスク名>……マスクのキーとなる値。以下全てが値となる。
 * <マップID記法>……マスクを置くマップIDか名前
 *   (V10で「10番の変数IDのマップID」も可)
 * <マスク範囲リスト配列> ……[srcX,srcY,destX,destY]の形式で
 *   １つ以上の配列をスペースで区切らずに並べたもの。
 *   それぞれの値に使用できるのは数値のみ。
 * <使用ピクチャID>……数値の他に、V10(変数10番の値)などの指定も可
 * <マスク状態>……マスクの初期状態となる値。以下の文字列を指定する。
 * ・auto……ピクチャIDにマスク画像生成し、プレイヤーの位置で表示/非表示決定
 * ・showまたはon……ピクチャIDにマスク画像生成のうえ、『即時表示』。
 * ・makeまたはstandby……ピクチャIDにマスク画像を生成するが『非表示で待機』
 * ・nomakeまたはoff……設定は登録するが、ピクチャIDにはマスク画像を生成せず。
 *    （後述の共有状態のときなどに用いる）
 * ・無指定……auto が指定されたのと同様
 * <フィルモード>……塗りつぶす色やピクチャを指定。
 * 一部、<オプション>を参照するものあり。
 * ・black……マスクを黒で塗りつぶす (color [0,0,0,255]と等価)
 * ・white……マスクを白で塗りつぶす (color {255,255,255,255]と等価)
 * ・gray……マスクを灰色で塗りつぶす。
 *     続く<オプション>で明るさ（0-255）を指定できる。
 *     <オプション>無指定時…128 ([128,128,128,255]と等価）
 * ・color……<オプション>にて長さ4の配列を指定する。その値がRGBAとなる。
 *     書式の例：[0,0,0,0]のように、Pixi.Spriteクラスの書式参照。
 *     <オプション>無指定時：blackと等価。
 * ・pict……<オプション>にて<ファイル名>(img/pictures/ フォルダ内)を指定。
 *   ※注意：<ファイル名>は、プラグインヘルプの requiredAssets で
 *     定義しないと、不要素材として弾かれる。
 *   ピクチャとタイルのサイズが異なる時は、中央を合わせて表示
 * ・tile……<オプション>にて<ファイル名>(img/pictures/ フォルダ内)を指定。
 *   ※注意：pictと同様、requiredAssets での表記必須
 *   左上を原点に、指定した<ファイル名>のピクチャをタイル状に並べる。
 * ・無指定……blackと等価。
 *
 * ◇設定例：
 * MapMask Set 研究所6_1M  研究所6 [5,5,10,10][11,5,15,15] V10 standby black
 * ここでパラメータは以下の通りになります。
 * <マスク名>……研究所6_1M
 * <マップID記法>……研究所6
 * <マスク範囲リスト配列>……[5,5,10,10]と[11,5,15,15]を合わせた範囲
 * <使用ピクチャID>……変数10番の値。
 * <マスク初期状態>……ピクチャを作成のうえ、非表示
 * <フィルモード>……黒
 * <オプション>……設定なし
 *
 * ◆<マスク状態>の変更
 * 以下、<マスク名> に all を設定すると、全てのマスクに適用されます。
 *
 * MapMask standby <マスク名> ……指定したマスクの設定をしたうえで非表示待機
 * MapMask show <マスク名> ……指定したマスクを強制常時
 * MapMask on <マスク名> ……同上
 * MapMask hide <マスク名> ……指定したマスクを強制非表示
 * MapMask off <マスク名> ……同上
 * MapMask auto <マスク名> ……指定したマスクを既定の自動表示に戻す。
 *   すなわち、プレイヤーが範囲内にないマスクは現在の設定で全て再表示される
 *
 * ◇設定例
 * MapMask hide 研究所6_1
 *   マスク'研究所6_1'を非表示にする
 * MapMask off 研究所6_1 研究所6_2
 *   マスク'研究所6_1' '研究所6_2' を非表示にする（複数指定表記）
 * MapMask hide all
 *   現在のマップにあるすべてのマスクを非表示にする
 *
 * ◆マスク切り替え時のウェイト有無
 * MapMask wait off ……マスクの開閉でのウエイトをしない（デフォルト）。
 * MapMask wait on  ……マスク開閉の際、マスクのフェードイン・フェードアウトが
 *    済むまで、プレイヤーを含む全てのイベントの進行とボタン操作受付を一時停止
 *
 * ◆フェードイン／フェードアウトについて
 * MapMask fade speed <フェードフレーム数>
 * マスクのフェードフレーム数を設定する(1秒＝60フレーム)。デフォルトは20。
 *
 * ■注意
 * ・<マスク名>を指定しなおすと、以降、その内容で更新されます。
 * ・異なる<マスク名>で、同じ<マップID記法>の同じ<ピクチャID>を指定した場合
 *   衝突が起こりますが、<マスク状態>が「表示」のものが優先表示されます。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  // ------------------------------------------------------------
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'MapMask') {
      switch (args[0]) {
      // main command
      case 'Set':
      case 'set':
        createMask(args);
        break;
      // commands to change display condition
      case 'standby': // ready to display
      case 'show':    // force display
      case 'on':
      case 'hide':    // force stop display
      case 'off':
      case 'auto':    // default(disappear only when player is in the area)
        changeMaskMode(args[0], args.clone().splice(1));
        break;
      case 'wait':
        switch (args[1]) {
        case 'on':
          $gameScreen.waitDuringFade = true;
          break;
        case 'off':   // default
          $gameScreen.waitDuringFade = false;
          break;
        }
        break;
      case 'fade':
        switch (args[1]) {
        case 'speed':
          $gameScreen.pictureFadeDuration = Number(args[2] || 20);
          break;
        }
        // ★★残りは後回し
        break;
      case 'wipemode':
        // ★★★後回し
        break;
      }
    }
  };

  // ------------------------------------------------------------
  // parse principle plugin commands
  //
  var verifyMask = function (mask) {
    if (mask.mapId === 0) {
      return 2;
    }
    for (var i = 0; i < mask.tileRanges.length; i++) {
      var m = mask.tileRanges[i];
      if (m.length !== 4 || m[0] > m[2] || m[1] > m[3]) {
        return 3;
      }
    }
    if (mask.maskMode != null && !['show', 'on', 'make', 'standby', 'nomake',
     'off', 'auto'].contains(mask.maskMode)) {
      return 4;
    }
    if (mask.pictureId === 0) {
      return 5;
    }
    if (mask.fillMode != null && !['black', 'white', 'gray', 'color', 'pict',
     'tile'].contains(mask.fillMode)) {
      return 6;
    }
    if (mask.option) {
      switch (mask.fillMode) {
      case 'gray':
        if (isNaN(mask.option)) {
          return 7;
        }
        break;
      case 'color':
        var opt = mask.option;
        if (opt.length !== 4 || isNaN(opt[0]) || isNaN(opt[1]) ||
         isNaN(opt[2]) || isNaN(opt[3])) {
          return 7;
        }
      }
    } else if (['pict', 'tile'].contains(mask.fillMode)) {
      // the case file name is not set.
      return 7;
    }
    return 0;
  };

  var createMask = function (args) {
    var mask = {};
    mask.maskName = args[1];
    mask.mapId = getMapIdFromParam(args[2]);
    mask.tileRanges = findMaskRangeArrays(args[3]);
    mask.pictureId = getPictureIdFromParam(args[4]);
    mask.maskMode = args[5] || 'auto';
    mask.fillMode = args[6] || 'black';
    mask.option = getOptionFromParam(args[6], args[7], mask);
    if (verifyMask(mask) === 0) {
      changeTheMaskSetting(mask);
    } else {
      console.error("mask notation is wrong. code:", verifyMask(mask));
    }
  };

  var changeMaskMode = function (maskMode, maskNameArr) {
    if (maskNameArr[0] === 'all') {
      var masks = $gameScreen.maskArray;
      for (var i = 0; i < masks.length; i++) {
        masks[i].maskMode = maskMode;
        $gameScreen.shadowChanging.push(masks[i].pictureId);
      }
      return;
    }
    for(var i = 0; i < maskNameArr.length; i++) {
      var maskId = getIndexWhoseMaskNameIs(maskNameArr[i]);
      if (maskId >= 0) {
        var mask = $gameScreen.maskArray[maskId];
        mask.maskMode = maskMode;
        $gameScreen.shadowChanging.push(mask.pictureId);
      }
    }
  };

  // ------------------------------------------------------------
  // parse elemental plugin commands
  //
  var findMaskRangeArrays = function (ranges) {
    var result = [];
    var reg = /\[([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/g;
    while (match = reg.exec(ranges)) {
      result.push([Number(match[1]), Number(match[2]), Number(match[3]),
       Number(match[4])]);
    }
    return result;
  };

  var getVariableIdWhoseNameIs = function (name) {
    var varNames = $dataSystem.variables;
    for (var i = 1; i < varNames.length; i++) {
      if (varNames[i] === name) {
        return i;
      }
    }
    return 0;
  };

  var getVariableIdFromParam = function (varIdNotation) {
    var reg;
    if (reg = (/^(V?)([0-9]+)/i).exec(varIdNotation)) {
      return reg[1] ? $gameVariables.value(+reg[2]) : +reg[2];
    } else {
      return getVariableIdWhoseNameIs(varIdNotation);
    }
  };

  var getMapIdWhoseNameIs = function (name) {
    var mapNames = $dataMapInfos;
    for (var i = 1; i < mapNames.length; i++) {
      if (mapNames[i] && mapNames[i].name === name) {
        return i;
      }
    }
    return 0;
  };

  var getMapIdFromParam = function (mapIdNotation) {
    var reg;
    if (reg = (/^(V?)([0-9]+)/i).exec(mapIdNotation)) {
      return reg[1] ? $gameVariables.value(+reg[2]) : +reg[2];
    } else {
      return getMapIdWhoseNameIs(mapIdNotation);
    }
  };

  var getPictureIdFromParam = function (pictureIdNotation) {
    var reg;
    if (reg = (/^(V?)([0-9]+)/i).exec(pictureIdNotation)) {
      return reg[1] ? $gameVariables.value(+reg[2]) : +reg[2];
    } else {
      return 0;
    }
  };

  var getOptionFromParam = function (fillMode, option, mask) {
    switch (fillMode) {
    case 'gray':
      return option == null ? null : Number(option);
    case 'color':
      var reg;
      if (reg = (/^\[([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/).exec(option)) {
        return [Number(reg[1]),Number(reg[2]),Number(reg[3]),Number(reg[4])];
      } else {
        return [0,0,0,255];
      }
    case 'pict':
    case 'tile':
      // request loading bitmap immidiately the method called.
      preLoadShadowGraphic(option, mask);
      return option;  // the texture file name
    default:
      return null;
    }
  };

  // ------------------------------------------------------------
  // preload tile and pict graphics
  //
  var needsPreLoad = function (mask) {
    return ['pict', 'tile'].contains(mask.fillMode);
  };

  var preLoadShadowGraphic = function (fileName, mask) {
    if (fileName) {
      var bitmap = ImageManager.loadPicture(fileName);
      if (bitmap.width === 0 || bitmap.height === 0) {
        bitmap.shadowPictureMask = mask;
      } else {
        bitmap.shadowPictureMask = null;
      }
    }
  };

  var _Bitmap_onLoad = Bitmap.prototype._onLoad;
  Bitmap.prototype._onLoad = function() {
    _Bitmap_onLoad.call(this);
    if (this.shadowPictureMask) {
      changeTheMaskSetting(this.shadowPictureMask);
    }
  };

  // ------------------------------------------------------------
  //  initialize or loading, set mask information. 
  //
  var _Game_Screen_initialize = Game_Screen.prototype.initialize;
  Game_Screen.prototype.initialize = function() {
    _Game_Screen_initialize.call(this);
    this.initMaskAndPictIdList();
  };

  var _Scene_Load_terminate = Scene_Load.prototype.terminate;
  Scene_Load.prototype.terminate = function() {
    $gameScreen.initMaskAndPictIdList();
    _Scene_Load_terminate.call(this);
  };

  Game_Screen.prototype.initMaskAndPictIdList = function() {
    if (this.maskArray == null) {
      // note: maskArray is the array that each element's format is:
      // { maskName:<マスク名>, mapId:<マップID記法(=notation)>,
      //   tileRanges:<マスク範囲リスト配列(=array of mask tile range)>,
      //   pictureId:<使用ピクチャID>, maskMode:<マスク状態(default:auto)>,
      //   fillMode:<フィルモード>, options:<オプション> }
      this.maskArray = [];
      this.shadowChanging = [];
      this.pictureFadeDuration = 20;  // default value
      this.waitDuringFade = false;
    }
  };

  var _Game_Picture_initialize = Game_Picture.prototype.initialize;
  Game_Picture.prototype.initialize = function () {
    _Game_Picture_initialize.call(this);
    this._appearDuration = 0;
    this,_vanishDuration = 0;
  };

  // ------------------------------------------------------------
  // Add or recreate mask.
  //
  var getIndexWhoseMaskNameIs = function (maskName) {
    var maskArray = $gameScreen.maskArray;
    for (var i = 0; i < maskArray.length; i++) {
      if (maskArray[i].maskName === maskName) {
        return i;
      }
    }
    return -1; // not found
  };

  // ***note***: call when add new mask
  var changeTheMaskSetting = function (mask) {
    adjustMaskPosition(mask);
    $gameScreen.shadowChanging.push(mask.pictureId);
  };

  var shouldDisplayNow = function (mask) {
    if (mask.mapId !== $gameMap.mapId()) {
      return false;
    }
    return ['show', 'on'].contains(mask.maskMode) ||
     (mask.maskMode === 'auto' && !isPlayerinMaskRanges(mask.tileRanges));
  };

  var shouldDisplayImmidiately = function (mask) {
    return ['show', 'on'].contains(mask.maskMode);
  };

  var shouldReadNow = function (mask) {
    return ['show', 'on', 'make', 'standby', 'auto'].contains(mask.maskMode);
  };

  // ------------------------------------------------------------
  // Create Bitmap objects
  //
  var maxPictureSize = function (mask) {
    // note: some pictures have plural shadow areas.
    // this function finds comprehensive size of picture.
    var xSrc = $gameMap.width();
    var ySrc = $gameMap.height();
    var xDest = -1;
    var yDest = -1;
    // fill for each shadow region.
    for(var i = 0; i < mask.tileRanges.length; i++) {
      var range = mask.tileRanges[i];
      if (range) {
        xSrc = Math.min(range[0], xSrc); 
        ySrc = Math.min(range[1], ySrc);
        xDest = Math.max(range[2], xDest);
        yDest = Math.max(range[3], yDest);
      }
    }
    if (xSrc === $gameMap.width() && yDest === -1) {
      return null;  // no region to add
    }
    return [xSrc, ySrc, xDest, yDest];
  };

  var fillModeToColorCssFormat = function (fillMode, option) {
    switch (fillMode) {
    case 'black':
      return '#000000';
    case 'white':
      return '#ffffff';
    case 'gray':
      var b = Number(option) || 128;
      return 'rgba(' + b + ',' + b + ',' + b + ', 1)';
    case 'color':
      if (!option) {
        return '#000000';
      }
      // note: this format be array like [r,g,b,a].
      var alpha = option[3] == null ? 1.0 : option[3] / 256;
      return 'rgba(' + option[0] + ',' + option[1] + ',' + option[2] +
       ',' + alpha + ')';
    case 'pict':
    case 'tile':
      return null;  // not use css format.
    default:
      return '#000000';
    }
  };

  var fillModeToPictureName = function (fillMode, option) {
    switch (fillMode) {
    case 'pict':
    case 'tile':
      return option; // file name in img/pictures/
      break;
    default:
      return null;   // not to display picture
    }
  };

  var makeShadowBitmap = function (mask) {
    // make picture with max size
    var pictSize = maxPictureSize(mask);
    var width = (pictSize[2] - pictSize[0] + 1) * $gameMap.tileWidth();
    var height = (pictSize[3] - pictSize[1] + 1) * $gameMap.tileHeight();
    var bitmap = new Bitmap(width, height);
    // fill shadows' rect
    var cssColor = fillModeToColorCssFormat(mask.fillMode, mask.option);
    var imgFileName = fillModeToPictureName(mask.fillMode, mask.option);
    for(var i = 0; i < mask.tileRanges.length; i++) {
      var range = mask.tileRanges[i];
      if (range) {
        var x = (range[0] - pictSize[0]) * $gameMap.tileWidth();
        var y = (range[1] - pictSize[1]) * $gameMap.tileHeight();
        var width2 = (range[2] - range[0] + 1) * $gameMap.tileWidth();
        var height2 = (range[3] - range[1] + 1) * $gameMap.tileHeight();
        if (cssColor) {
          bitmap.fillRect(x, y, width2, height2, cssColor);
        } else if (imgFileName) {
          var bitmap2 = ImageManager.loadPicture(imgFileName);
          if (bitmap2.width === 0 || bitmap2.height === 0) {
            return 'notReady';
          }
          switch (mask.fillMode) {
          case 'pict': // centering  display
            var dx = (bitmap.width - bitmap2.width) / 2;
            var dy = (bitmap.height - bitmap2.height) / 2;
            bitmap.bltImage(bitmap2, 0, 0, bitmap2.width, bitmap2.height,
             dx + x, dy + y);
            break;
          case 'tile': // tiling bitmap
            for (var j = 0; j < height2; j += bitmap2.height) {
              for (var k = 0; k < width2; k += bitmap2.width) {
                var dx = Math.min(bitmap2.width, (k + width2) - bitmap2.width);
                var dy = Math.min(bitmap2.height, (j + height2) -
                 bitmap2.height);
                bitmap.bltImage(bitmap2, 0, 0, dx, dy, k + x, j + y);
              }
            }
            break;
          default:
            return null;
          }
        }
      } else {
        return null;
      }
    }
    return bitmap;
  };

  // ------------------------------------------------------------
  // Create Sprite objects
  //
  var mapMaskPictures = function (pictureId) {
    var masks = $gameScreen.maskArray;
    var results = [];
    for (var i = 0; i < masks.length; i++) {
      var mask = masks[i];
      if (mask.mapId === $gameMap.mapId() && mask.pictureId === pictureId) {
        results.push(mask);
      }
    }
    return results;
  };

  Sprite_Picture.prototype.isShadowPicture = function () {
    return mapMaskPictures(this._pictureId).length > 0;
  };

  var _Sprite_Picture_initialize = Sprite_Picture.prototype.initialize
  Sprite_Picture.prototype.initialize = function (pictureId) {
    _Sprite_Picture_initialize.call(this, pictureId);
    this.shadowBitmap = null;
  };

  var _Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
  Sprite_Picture.prototype.updateBitmap = function () {
    var displayMasks = mapMaskPictures(this._pictureId);
    if (displayMasks.length > 0) {
      if ($gameScreen.shadowChanging.contains(this._pictureId)) {
        var shouldDisplay = false;
        var shadowBitmap = null;
        for (var i = 0; i < displayMasks.length; i++) {
          shadowBitmap = shouldReadNow(displayMasks[i]) ?
          makeShadowBitmap(displayMasks[i]) : null;
          if (shadowBitmap === 'notReady') {
            return;
          }
          if (shouldDisplayNow(displayMasks[i])) {
            shouldDisplay = true;
            if (shouldDisplayImmidiately(displayMasks[i])) {
              $gameMap.immidiateDisplayShadow = true;
            }
          } else {
            continue;
          }
          if (shadowBitmap) {
            break;
          }
        }
        this.bitmap = shadowBitmap;
       if ($gameMap.immidiateDisplayShadow) {
          this.setImmidiateDisplay(shouldDisplay);
        } else {
          this.setFadeIn(shouldDisplay);
        }
        // delete current request
        var oldArr = $gameScreen.shadowChanging.clone();
        var newArr = [];
        for (i = 0; i < oldArr.length; i++) {
          if (oldArr[i] !== this._pictureId) {
            newArr.push(oldArr[i]);
          }
        }
        $gameScreen.shadowChanging = newArr;
      }
      return;
    }
    _Sprite_Picture_updateBitmap.call(this);
  };

  // ------------------------------------------------------------
  // update Sprite objects
  //
  Sprite_Picture.prototype.setFadeIn = function (shouldDisplay) {
    if (shouldDisplay) { // fade in
      this.picture()._appearDuration = $gameScreen.pictureFadeDuration;
      this.opacity = 0;
      this.visible = true;
    } else { // fade out
      this.picture()._vanishDuration = $gameScreen.pictureFadeDuration;
      this.opacity = 255;
      this.visible = true;
    }
  };

  Game_Picture.prototype.pictureFading = function () {
    return this._appearDuration > 0 || this._vanishDuration > 0;
  };

  Game_Screen.prototype.pictureFading = function () {
    return $gameScreen._pictures.some(function (picture) {
      return picture && picture.pictureFading();
    });
  };

  Sprite_Picture.prototype.setImmidiateDisplay = function (shouldDisplay) {
    if (shouldDisplay) {
      this.visible = true;
      this.opacity = 255;
    } else {
      this.visible = false;
      this.opacity = 0;
    }
  };

  var _Sprite_Picture_updateOther = Sprite_Picture.prototype.updateOther;
  Sprite_Picture.prototype.updateOther = function() {
    // the case the picture not loaded yet.
    if (!this.picture()) {
      return;
    }
    if (this.isShadowPicture()) {
      if (this.picture()._appearDuration > 0) {
        var d = this.picture()._appearDuration;
        this.opacity = (this.opacity * (d - 1) + 255) / d;
        if (--this.picture()._appearDuration === 0) {
          this.opacity = 255;
        }
      }
      if (this.picture()._vanishDuration > 0) {
        var d = this.picture()._vanishDuration;
        this.opacity = (this.opacity * (d - 1)) / d;
        if (--this.picture()._vanishDuration === 0) {
          this.opacity = 0;
          this.visible = false;
        }
      }
      return;
    }
    _Sprite_Picture_updateOther.call(this);
  };

  var _Sprite_Picture_updateOrigin = Sprite_Picture.prototype.updateOrigin;
  Sprite_Picture.prototype.updateOrigin = function() {
    if (this.isShadowPicture()) {
      // always origin is leftup.
      this.anchor.x = 0;
      this.anchor.y = 0;
      return;
    }
    _Sprite_Picture_updateOrigin.call(this);
  };

  var _Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
  Sprite_Picture.prototype.updatePosition = function() {
    if ($gameParty.inBattle() && this.isShadowPicture()) {
      this.x = this.y = 0;
      return;
    }
    _Sprite_Picture_updatePosition.call(this);
};


  var _Sprite_Picture_updateScale = Sprite_Picture.prototype.updateScale;
  Sprite_Picture.prototype.updateScale = function() {
    if (!this.isShadowPicture()) {
      _Sprite_Picture_updateScale.call(this);
    }
  };

  var _Sprite_Picture_updateTone = Sprite_Picture.prototype.updateTone;
  Sprite_Picture.prototype.updateTone = function() {
    if (!this.isShadowPicture()) {
      _Sprite_Picture_updateTone.call(this);
    }
  };

  // ------------------------------------------------------------
  // Set Interlock Position
  //
  var adjustX = function (x) {
    return x + $gameMap.adjustX(0) * $gameMap.tileWidth();
  };

  var adjustY = function (y) {
    return y + $gameMap.adjustY(0) * $gameMap.tileHeight();
  };

  var adjustMaskPosition = function (mask) {
    var picture;
    if (getIndexWhoseMaskNameIs(mask.maskName) >= 0) {
      picture = $gameScreen._pictures[mask.pictureId];
    } else {
      picture = new Game_Picture();
      $gameScreen.maskArray.push(mask);
    }
    $gameScreen._pictures[mask.pictureId] = picture;
    $gameScreen.setPictureInterlock(mask.pictureId, 0);
    picture._x = adjustX(maxPictureSize(mask)[0] * $gameMap.tileWidth());
    picture._y = adjustY(maxPictureSize(mask)[1] * $gameMap.tileHeight());
    $gameScreen.setPictureInterlock(mask.pictureId, 1);
    $gameScreen.shadowChanging.push(mask.pictureId);
  };

  // ------------------------------------------------------------
  // judge routine whether player in the mask area or not.
  //
  var isPlayerInOneMaskRange = function (range) {
    var x = $gamePlayer.x;
    var y = $gamePlayer.y;
    return range[0] <= x && range[1] <= y && x <= range[2] && y <= range[3];
  };

  var isPlayerinMaskRanges = function(ranges) {
    for (var i = 0; i < ranges.length; i++) {
      if (isPlayerInOneMaskRange(ranges[i])) {
        return true;
      }
    }
    return false;
  };


  var maskRangesInPlayer = function () {
    var results = []; // array of $gameScreen.maskArray index.
    var masks = $gameScreen.maskArray;
    for (var id = 0; id < masks.length; id++) {
      if (masks[id].mapId === $gameMap.mapId()) {
        var ranges = masks[id].tileRanges;
        for (var j = 0; j < ranges.length; j++) {
          if (!results.contains(id) && isPlayerInOneMaskRange(ranges[j])) {
            results.push(id);
          }
        }
      }
    }
    return results;
  };

  // ------------------------------------------------------------
  // process at map initialization and refresh
  //
  Game_Map.prototype.setAllMasks = function () {
    var masks = $gameScreen.maskArray;
    for (var i = 0; i < masks.length; i++) {
      adjustMaskPosition(masks[i]);
      var pictureId = masks[i].pictureId;
      if (!$gameScreen.shadowChanging.contains(pictureId)) {
        $gameScreen.shadowChanging.push(pictureId);
      }
      if (needsPreLoad(masks[i])) {
        preLoadShadowGraphic(masks[i].option, masks[i]);
      }
    }
  };

  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup.call(this, mapId);
    this.immidiateDisplayShadow = false;
    $gamePlayer.updatePlayerPositionAndShadow();
  };

  var _Scene_Map_createDisplayObjects =
   Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    _Scene_Map_createDisplayObjects.call(this);
    $gameMap.setAllMasks();
    $gameMap.immidiateDisplayShadow = true;
  };

  var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
    _Spriteset_Map_update.call(this);
    $gameMap.immidiateDisplayShadow = false;
  };

  // ------------------------------------------------------------
  // process at the player moves in the map
  //
  Game_Player.prototype.updatePlayerPositionAndShadow = function () {
    this._shadowPlayerX = this.x;
    this._shadowPlayerY = this.y;
    this._shadowPlayerMapId = $gameMap.mapId();
    this._maskRangeIds = maskRangesInPlayer();
  };

  Game_Player.prototype.playerPositionChanged = function () {
    return this._shadowPlayerX !== this.x ||
     this._shadowPlayerY !== this.y ||
     this._shadowPlayerMapId !== $gameMap.mapId();
  };

  Game_Player.prototype.needsUpdateShadowIds = function () {
    // make difference array
    var newMaskIds = maskRangesInPlayer();
    var oldMaskIds = this._maskRangeIds.clone();
    for (var i = 0; i < oldMaskIds.length; i++) {
      if ((index = newMaskIds.indexOf(oldMaskIds[i])) >= 0) {
        oldMaskIds.splice(i);
        newMaskIds.splice(index);
      }
    }
    return oldMaskIds.concat(newMaskIds);
  };

  Game_Player.prototype.updateShadows = function () {
    if (this.playerPositionChanged()) {
      var shadowIds = this.needsUpdateShadowIds();
      for (var i = 0; i < shadowIds.length; i++) {
        var pictureId = $gameScreen.maskArray[shadowIds[i]].pictureId;
        if (!$gameScreen.shadowChanging.contains(pictureId)) {
          $gameScreen.shadowChanging.push(pictureId);
        }
      }
      this.updatePlayerPositionAndShadow();
    }
  };

  var _Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function (sceneActive) {
    this.updateShadows();
    if (forceFreezeByShadowFade()) {
      return;
    }
    _Game_Player_update.call(this, sceneActive);
  };

  // ------------------------------------------------------------
  // Stop all events' and player's movement while fadein/fadeout
  //
  var forceFreezeByShadowFade = function () {
    return $gameScreen.waitDuringFade && $gameScreen.pictureFading();
  };

  var _Game_Event_update = Game_Event.prototype.update;
  Game_Event.prototype.update = function () {
    if (forceFreezeByShadowFade()) {
      return;
    }
    _Game_Event_update.call(this);
  };
})();
