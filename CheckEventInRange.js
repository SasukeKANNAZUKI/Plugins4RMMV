//=============================================================================
// CheckEventInRange.js
//=============================================================================

/*:
 * @plugindesc provides judgement functions if the event is in specified range
 * @author Sasuke KANNAZUKI
 *
 * @help This plugin does not provide plugin commands.
 *
 * following scripts assumes the use of the script in condition branch.
 * parameters in brackets are omissible.
 *
 * *** In Range
 * this.isEventInRange(<TargetEvent>, <X1>, <Y1>[, <X2>, <Y2>, <MapId>]);
 *  check if the <TargetEvent>'s (x,y) is in (<X1>,<Y1>)-(<X2>,<Y2>).
 *  if (<X2>,<Y2>) is omitted, check it the same as (<X1>,<Y1>).
 *  if <MapId> is specified and doesn't match to current map id, return false.
 *
 * **event notation such as <TargetEvent>, <OriginEvent>
 * - immidiate value (ex. 5, 10) or string (ex. '5', '10')
 * - value of the variable id (ex. 'V5', 'V10')
 * - 't' or 'this': the event that running interpreter
 * - 'p' or 'player': the player
 * - event name (ex. 'Aooni', 'Hiroshi')
 *
 * **<MapId> notation
 * - immidiate value (ex. 5, 10) or string (ex. '5', '10')
 * - value of the variable id (ex. 'V5', 'V10')
 * - map name (ex. 'Basement', 'Cave 1F')
 * - the array that each value is the notation above.(ex. [50, 'V51', 'land'])
 *
 * **coordination notation such as <X1> <X2>
 * - immidiate value (ex. 5, 10) or string (ex. '5', '10')
 * - value of the variable id (ex. 'V5', 'V10')
 * - value of the variable whose name is the string (ex. 'X distance')
 *  in this case, you can get the variable's value, not ID!!
 *
 * *** In the rectangle of 2 events
 * this.isEventBetween(<TargetEvent>, <Event1>[, <Event2>, <MapId>]);
 *  check if the TargetEvent's (x,y) is in the rectangle that 2 point is
 *  <Event1> and <Event2>'s coordination.
 *  if <Event2> is omitted, check it the same as <Event1>.
 *
 * *** In the recrangle considering to another event's condition
 * this.isEventInRelative(<TargetEvent>, <OriginEvent>, <X1>, <Y1>[,
 *  <X2>, <Y2>, <Rotate>, <MapId>]);
 *  check if the <TargetEvent> is in the area of (<X1>,<Y1>-(<X2>,<Y2>) whose
 *  origin is <OriginEvent>.
 *  - if (<X1>,<Y1>-(<X2>,<Y2>) is (-1,1,  1,3), search if <TargetEvent> is at
 *   <OriginEvent>'s under 3 tiles and from left 1 to right 1 tiles.
 *  - if the <Rotate> is true (or omitted), the coordinates above are rotated
 *   according to the <OriginEvent>'s direction.
 *
 * *** Check the events in straight line
 * this.isEventOnStraightLine(<TargetEvent>, <OriginEvent>[, <CompOp>, <Step>,
 *  <MapId>]);
 *  Check if <TargetEvent> and <OriginEvent> are at the straight line and
 *  in the range of specified steps according to the <TargetEvent>'s direction.
 *
 * **<CompOp> notation
 * either of following: '==', '!=', '>', '>=', '<=', '<'.
 * default value is '=='.
 *
 * **<Step> notation
 * the same as 'coordination notation' explained at above.
 * the default value is 1.
 *
 ****NOTE***
 * This plugin doesn't assume the use of looping map.
 */

/*:ja
 * @plugindesc イベントが特定の範囲内にいるかどうかを判定する関数集
 * @author 神無月サスケ
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * 下記のスクリプトコマンドは、イベントコマンド「条件分岐」の「スクリプト」での
 * 使用を想定しています。
 * 
 * 以下、[]で括ったパラメータは省略可能です。
 *
 * ■マップの範囲内
 * this.isEventInRange(<イベントT>, <X1>, <Y1>[, <X2>, <Y2>, <マップID>]);
 *  <イベントT>(T=Target)のマップ座標が、(<X1>,<Y1>)-(<X2>,<Y2>)に位置するか
 *  判定します。
 *  - <X2>,<Y2> は省略可能で、その場合は(<X1>,<Y1>)と同一座標か判定します。
 *  - <マップID>を(以下の書式で)指定した場合、現在のマップIDと異なる場合は
 *   位置判定を行わずに false を返します。（以下の関数も同様です）
 *
 * ◆イベントID記法
 * <TargetEvent> や <OriginEvent> のように、イベントIDを指定する場合は、
 * 以下の書式が使用可能です。
 * - 即値 (例: 5, 10) または数値を表す文字列 (例: '5', '10')
 * - 頭にVを付けたIDの変数の値 (例: 'V5', 'V10')
 * - 't' または 'this': インタプリタを起動中のイベント
 * - 'p' または 'player': プレイヤー
 * - イベント名 (ex. '青鬼', 'ひろし')
 *
 * ◆<マップID> の記法
 * - 即値 (例: 5, 10) または数値を表す文字列 (例: '5', '10')
 * - 頭にVを付けたIDの変数の値 (例: 'V5', 'V10')
 * - マップ名 (例: '図書室', '台所')
 * - 上記の記法で構成された配列 (例: [50, 'V51', '外観'])
 *
 * ◆座標記法
 * <X1> <X2> のように座標を指定する場合は、以下の書式が使用可能です。
 * - 即値 (例: 5, 10) または数値を表す文字列 (例: '5', '10')
 * - 頭にVを付けたIDの変数の値 (例: 'V5', 'V10')
 * - 変数名で指定した変数の値 (例: 'X座標距離')
 *  この場合、変数IDではなく変数の値に置き換えられます。
 *
 * ■特定のイベントを端点とする長方形内
 * this.isEventBetween(<イベントT>, <イベント1>[, <イベント2>, <マップID>]);
 *  <イベントT>が、<イベント1>と<イベント2>で囲まれた長方形の中にあるか判定。
 *  <イベント2>を省略した場合、<イベント1>と同座標か判定。
 *
 * ■特定のイベントを起点とした範囲内
 * this.isEventInRelative(<イベントT>, <イベントO>, <X1>, <Y1>[, <X2>, <Y2>,
 *  <回転>, <マップID>]);
 *  <イベントT>が、<イベントO>(O=Origin)を原点として、(<X1>,<Y1>-(<X2>,<Y2>)の
 *  範囲内にあるかどうかを判定します。
 *  - 例えば (<X1>,<Y1>-(<X2>,<Y2>) が (-1,1)-(1,3) の場合、<イベント0>の
 *   下3マス×幅3マス内に<イベントT>がいないか探索。
 *  - <回転> が true の場合、<イベントO> の向きに応じて範囲が回転する。
 *   省略時は true。
 *
 * ■同一直線状の指定の歩数の範囲内にいるか判定
 * this.isEventOnStraightLine(<イベントT>, <イベントO>[, <比較演算子>, <歩数>,
 *  <マップID>]);
 *  <イベントO>の向きを考慮した前後方向の直線上の、なおかつ<比較演算子>と
 *  <歩数>で指定した範囲内に<イベントT>が存在するか判定します。
 *
 * ◆<比較演算子> の書式
 * 次が指定可能です: '==', '!=', '>', '>=', '<=', '<'.
 * 省略時は '==' になります。
 * '==' : <イベントT>が<イベントO>の<歩数>歩前のところにいる
 * '!=' : <イベントT>が<イベントO>の<歩数>歩のところにいない
 * '>=' : <イベントT>が<イベントO>から<歩数>歩のところか、それより前にいる
 * '>'  : <イベントT>が<イベントO>から<歩数>歩よりも前にいる
 * '<=' : <イベントT>が<イベントO>から<歩数>歩のところか、それより後ろにいる
 * '<'  : <イベントT>が<イベントO>から<歩数>歩よりも後ろにいる 
 *
 * ◆<歩数> 記法
 * 上記の「座標記法」と全く同じ書式が使えます。
 * <歩数>省略時は1になります。
 *
 * ■注意
 * このプラグインはループするマップを考慮していません。
 */

(function() {

  //
  // process parameters 1 : notation processing routine
  //
  var getNumberFromParam = function (notation) {
    var reg;
    if (reg = (/^(V?)((\-)?[0-9]+)/i).exec(String(notation))) {
      return reg[1] ? $gameVariables.value(+reg[2]) : +reg[2];
    }
    return 0;
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

  var getValueFromParam = function (varIdNotation) {
    varIdNotation = String(varIdNotation);
    var res;
    if (res = getNumberFromParam(varIdNotation)) {
      return res;
    } else {
      res = getVariableIdWhoseNameIs(varIdNotation);
      return $gameVariables.value(res);
    }
  };

  var getEventWhoseNameIs = function (name) {
    var arr = $gameMap.events().filter(function (event) {
      return event.event().name === name;
    });
    return arr[0];
  };

  var getEventFromParam = function (param, thisId) {
    param = String(param);
    var res;
    if (res = getNumberFromParam(param)) {
      return $gameMap.event(res);
    } else if ((/^p(?:layer)?$/i).test(param)) {
      return $gamePlayer;
    } else if ((/^t(?:his)?$/i).test(param)) {
      return thisId > 0 ? $gameMap.event(thisId) : $gamePlayer;
    } else {
      return getEventWhoseNameIs(param);
    }
  };

  var getMapIdWhoseNameIs = function (name) {
    var info;
    for (var i = 1; i < $dataMapInfos.length; i++) {
      if ((info = $dataMapInfos[i]) && (info.name === name)) {
        return i;
      }
    }
    return 0;
  };

  var getMapIdFromParam = function (param, thisId) {
    param = String(param);
    var res;
    if (res = getNumberFromParam(param)) {
      return res;
    } else if (/^t(his)?$/.test(param)) {
      return thisId || $gameMap.mapId();
    } else {
      return getMapIdWhoseNameIs(param);
    }
  };

  var isMapIdMet = function(mapIdNotation, thisId) {
    if (mapIdNotation == null) { // default setting : always OK
      return true;
    }
    thisId = thisId || $gameMap.mapId();
    if (mapIdNotation instanceof Array) {
      return mapIdNotation.some(function (n) {
        return getMapIdFromParam(n) === thisId;
      });
    } else {
      return getMapIdFromParam(mapIdNotation) === thisId;
    }
  };

  //
  // process parameters 2 : axis rotation
  //
  var rotatedX = function (dir, dx, dy) {
    switch (dir) {
    case 2:
      return dx;
    case 4:
      return -dy;
    case 6:
      return dy;
    case 8:
      return -dx;
    }
    return 0;
  };

  var rotatedY = function (dir, dx, dy) {
    switch (dir) {
    case 2:
      return dy;
    case 4:
      return dx;
    case 6:
      return -dx;
    case 8:
      return -dy;
    }
    return 0;
  };

  var rotatedXWithParam = function (dir, dxNote, dyNote) {
    return rotatedX(dir, getValueFromParam(dxNote), getValueFromParam(dyNote));
  };

  var rotatedYWithParam = function (dir, dxNote, dyNote) {
    return rotatedY(dir, getValueFromParam(dxNote), getValueFromParam(dyNote));
  };

  //
  // process parameters 3: get variable range
  //
  var getRangeByOperation = function (compOp, value, max, min) {
    var negate = false;
    switch (compOp) {
    case '==':
      max = min = value;
      break;
    case '!=':
      max = min = value;
      negate = true;
      break;
    case '>=':
      min = value;
      break;
    case '>':
      min = value + 1;
      break;
    case '<=':
      max = value;
      break;
    case '<':
      max = value - 1;
      break;
    default:  // in the case parameter is omitted, do the same as '=='.
      max = min = value;
      break;
    }
    return {min:min, max:max, negate:negate};
  };

  //
  // range finding routine
  //
  Number.prototype.isInRange = function (r1, r2) {
    return Math.min(r1, r2) <= this && this <= Math.max(r1, r2); 
  };

  Number.prototype.isInVarRange = function (r1, r2) {
    r1 = getValueFromParam(r1);
    r2 = getValueFromParam(r2);
    return this.isInRange(r1, r2);
  };

  Game_CharacterBase.prototype.isInXyRange = function (x1, y1, x2, y2) {
    return this.x.isInRange(x1, x2) && this.y.isInRange(y1, y2);
  };

  Game_CharacterBase.prototype.isInXyVarRange = function (x1, y1, x2, y2) {
    return this.x.isInVarRange(x1, x2) && this.y.isInVarRange(y1, y2);
  };

  //
  // event ID manipulation
  // a character except event (ex. player), put -1 as eventId.
  //
  Game_CharacterBase.prototype.eventId = function () {
    return -1;
  };

  //
  // functions called from condition branch in interpreter
  // note: any parameters may be the special notation that need to process.
  //
  Game_CharacterBase.prototype.isEventInRange =
  Game_Interpreter.prototype.isEventInRange = function (evT, x1, y1, x2, y2,
   mapId) {
    if (!isMapIdMet(mapId)) {
      return false;
    }
    evT = getEventFromParam(evT, this.eventId());
    x2 = x2 == null ? x1 : x2;
    y2 = y2 == null ? y1 : y2;
    return evT ? evT.isInXyVarRange(x1, y1, x2, y2) : false;
  };


  Game_CharacterBase.prototype.isEventBetween =
  Game_Interpreter.prototype.isEventBetween = function (evT, ev1, ev2, mapId) {
    if (!isMapIdMet(mapId)) {
      return false;
    }
    evT = getEventFromParam(evT, this.eventId());
    ev1 = getEventFromParam(ev1, this.eventId());
    ev2 = getEventFromParam(ev2, this.eventId()) || ev1;
    return evT && ev1 ? evT.isInXyRange(ev1.x, ev1.y, ev2.x, ev2.y) : false;
  };

  Game_CharacterBase.prototype.isEventInRelative =
  Game_Interpreter.prototype.isEventInRelative = function (evT, evO, x1, y1,
   x2, y2, rotate, mapId) {
    evT = getEventFromParam(evT, this.eventId());
    evO = getEventFromParam(evO, this.eventId());
    if (!isMapIdMet(mapId) || !evT || !evO) {
      return false;
    }
    x2 = x2 == null ? x1 : x2;
    y2 = y2 == null ? y1 : y2;
    if (rotate || rotate == null) { // note: rotate's default value is true.
      var o = {x1:x1, y1:y1, x2:x2, y2:y2};
      x1 = rotatedXWithParam(evO.direction(), o.x1, o.y1);
      y1 = rotatedYWithParam(evO.direction(), o.x1, o.y1);
      x2 = rotatedXWithParam(evO.direction(), o.x2, o.y2);
      y2 = rotatedYWithParam(evO.direction(), o.x2, o.y2);
    }
    return evT.isInXyRange(evO.x + x1, evO.y + y1, evO.x + x2, evO.y + y2);
  };

  Game_CharacterBase.prototype.isEventOnStraightLine =
  Game_Interpreter.prototype.isEventOnStraightLine = function (evT, evO,
   compOp, step, mapId) {
    if (!isMapIdMet(mapId)) {
      return false;
    }
    step = step != null ? getValueFromParam(step) : 1;
    var range = getRangeByOperation(compOp, step, 9999, -9999);
    return !!(range.negate ^ this.isEventInRelative(evT, evO, 0, range.min, 0,
     range.max, true, mapId));
  };

})();
