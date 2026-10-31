//=============================================================================
// ChangeSelectItemWindow.js (ver1.1)
//=============================================================================
/*:
 * @plugindesc Change the various settings of item selecting window.
 * @author Sasuke KANNAZUKI
 *
 * @param Switch ID
 * @desc this plugin's setting is valid only when the switch is ON.
 * @default 67
 *
 * @param Max Columns
 * @desc the number of the max columns. System setting is 2.
 * @default 1
 *
 * @param Visible Rows
 * @desc the number of visible rows. System setting is 4.
 * @default 8
 *
 * @param X position
 * @desc windows x position. if you use default, set -1.
 * @default -1
 *
 * @param Y position
 * @desc windows y position. if you use default, set -1.
 * @default -1
 *
 * @param Width
 * @desc windows width. if you use default, set -1.
 * @default -1
 *
 * @help
 * Plugin Command：
 * Change properties set in the parameters.
 * ChangeSelectItemWindow rows 6    // change rows to 6
 * ChangeSelectItemWindow cols 2    // change columns to 2
 * ChangeSelectItemWindow x 200     // change x to 200.
 * ChangeSelectItemWindow x -1      // set x to default value
 * ChangeSelectItemWindow y 150     // change y to 150.
 * ChangeSelectItemWindow y -1      // set y to default value
 * ChangeSelectItemWindow width 320 // change width to 320.
 * ChangeSelectItemWindow width -1  // set width to default value
 * ChangeSelectItemWindow reset     // reset all to parameter setting
 *
 * above settings are valid only when specified switch is on.
 *
 */
/*:ja
 * @plugindesc 『アイテム選択の処理』のウィンドウの設定を変更します。
 * @author 神無月サスケ
 *
 * @param Switch ID
 * @desc このIDのスイッチがONの時だけ、設定が働きます。
 * @default 67
 *
 * @param Max Columns
 * @desc 表示する列数です。通常のシステムでは2列です。
 * @default 1
 *
 * @param Visible Rows
 * @desc 表示する行数です。通常のシステムでは4行です。
 * @default 8
 *
 * @param X position
 * @desc ウィンドウの左上のX座標です。指定しない場合 -1 にしてください。
 * @default -1
 *
 * @param Y position
 * @desc ウィンドウの左上のY座標です。指定しない場合 -1 にしてください。
 * @default -1
 *
 * @param Width
 * @desc ウィンドウの幅です。指定しない場合 -1 にしてください。
 * @default -1
 *
 * @help
 * プラグインコマンド：
 * 途中でパラメータの値を変更する時に呼び出します。
 * ChangeSelectItemWindow rows 6    // 行数を 6 に変更
 * ChangeSelectItemWindow cols 2    // 列数を 2 に変更
 * ChangeSelectItemWindow x 200     // X座標を 200 に変更
 * ChangeSelectItemWindow x -1      // X座標をデフォルトに
 * ChangeSelectItemWindow y 150     // Y座標を 150 に変更
 * ChangeSelectItemWindow y -1      // Y座標をデフォルトに
 * ChangeSelectItemWindow width 320 // 幅を 320 に変更
 * ChangeSelectItemWindow width -1  // 幅をデフォルトに
 * ChangeSelectItemWindow reset     // 全てをパラメータの設定に戻す
 *
 * いずれも、指定されたスイッチが ON の時だけ有効です。
 */
(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('ChangeSelectItemWindow');
  var switchID = Number(parameters['Switch ID'] || 67);
  var _cols = Number(parameters['Max Columns'] || 1);
  var _rows = Number(parameters['Visible Rows'] || 8);
  var _wx = Number(parameters['X position'] || -1);
  var _wy = Number(parameters['Y position'] || -1);
  var _width = Number(parameters['Width'] || -1);

  //
  // process plugin commands
  //
  var _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    this._colsItemSelWnd = null;
    this._rowsItemSelWnd = null
    this._wxItemSelWnd = null;
    this._wyItemSelWnd = null;
    this._widthItemSelWnd = null;
  };

  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'ChangeSelectItemWindow') {
      var value = Number(args[1]);
      if (isNaN(value)) {
        value = null;
      }
      switch (args[0]) {
      case 'rows':
        $gameSystem._rowsItemSelWnd = value;
        break;
      case 'cols':
        $gameSystem._colsItemSelWnd = value;
        break;
      case 'x':
        $gameSystem._wxItemSelWnd = value;
        break;
      case 'y':
        $gameSystem._wyItemSelWnd = value;
        break;
      case 'width':
        $gameSystem._widthItemSelWnd = value;
        break;
      case 'reset':
        $gameSystem._rowsItemSelWnd = null;
        $gameSystem._colsItemSelWnd = null;
        $gameSystem._wxItemSelWnd = null;
        $gameSystem._wyItemSelWnd = null;
        $gameSystem._widthItemSelWnd = null;
        break;
      }
    }
  };

  //
  // variable manipulate routine
  //
  var cols = function () {
    var v = $gameSystem._colsItemSelWnd;
    return v == null ? _cols : v;
  };

  var rows = function () {
    var v = $gameSystem._rowsItemSelWnd;
    return v == null ? _rows : v;
  };

  var wx = function () {
    var v = $gameSystem._wxItemSelWnd;
    return v == null ? _wx : v;
  };

  var wy = function () {
    var v = $gameSystem._wyItemSelWnd;
    return v == null ? _wy : v;
  };

  var width = function () {
    var v = $gameSystem._widthItemSelWnd;
    return v == null ? _width : v;
  };

  //
  // main routine
  //
  var _Window_EventItem_maxCols = Window_EventItem.prototype.maxCols;
  Window_EventItem.prototype.maxCols = function() {
    if($gameSwitches.value(switchID)){
      return cols();
    } else {
      return _Window_EventItem_maxCols.call(this);
    }
  };

  var _Window_EventItem_numVisibleRows = 
    Window_EventItem.prototype.numVisibleRows;
  Window_EventItem.prototype.numVisibleRows = function() {
    if($gameSwitches.value(switchID)){
      return rows();
    } else {
      return _Window_EventItem_numVisibleRows.call(this);
    }
  };

  var _Window_EventItem_start = Window_EventItem.prototype.start;
  Window_EventItem.prototype.start = function() {
    this.height = this.windowHeight();
    this.width = Graphics.boxWidth;
    if ($gameSwitches.value(switchID)) {
      if (width() >= 0) {
        this.width = width();
      }
    }
    _Window_EventItem_start.call(this);
  };

  var _Window_EventItem_updatePlacement = 
   Window_EventItem.prototype.updatePlacement;
  Window_EventItem.prototype.updatePlacement = function() {
    this.x = 0;
    _Window_EventItem_updatePlacement.call(this);
    if ($gameSwitches.value(switchID)) {
      if (wx() >= 0) {
        this.x = wx();
      }
      if (wy() >= 0) {
        this.y = wy();
      }
    }
  };

})();
