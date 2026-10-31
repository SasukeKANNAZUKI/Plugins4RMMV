//=============================================================================
// ChangeWindow.js
//=============================================================================

/*:
 * @plugindesc change title command window to horizontal picture
 * @author Sasuke KANNAZUKI
 * *
 * @help This plugin does not provide plugin commands.
 * 
 * put Title_02.png at img/system/ .
 *
 * @param Image Width
 * @desc Image width.
 * @default 960
 *
 * @param Image Height
 * @desc Image Height
 * default 96
 *
 * @param Y Position
 * @desc Y position of the image
 * default 480
 */
(function() {

  //
  // process parameters
  //
  var parameters = PluginManager.parameters('ChangeTitleWindow');
  var imageWidth = Number(parameters['Image Width'] || 960);
  var imageHeight = Number(parameters['Image Height'] || 96);
  var yPos = parameters['Y Position'] || 480;

  //
  // load system/Title_02.png
  //
  var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
  Scene_Boot.loadSystemImages = function() {
    _Scene_Boot_loadSystemImages.call(this);
    ImageManager.loadSystem('Title_02');
  };

  //
  // manipulate window for picture
  //
  Window_TitleCommand.prototype.windowWidth = function() {
    return Graphics.width + this.standardPadding() * 2;
  };

  Window_TitleCommand.prototype.windowHeight = function() {
    return 96 + this.standardPadding() * 2;
  };

  Window_TitleCommand.prototype.standardBackOpacity = function() {
    return 255;
  };

  var _Window_TitleCommand_createContents = 
    Window_TitleCommand.prototype.createContents;
  Window_TitleCommand.prototype.createContents = function() {
    _Window_TitleCommand_createContents.call(this);
  };

  var _Window_TitleCommand_refresh = Window_TitleCommand.prototype.refresh;
  Window_TitleCommand.prototype.refresh = function() {
    _Window_TitleCommand_refresh.call(this);
    var bitmap = ImageManager.loadSystem('Title_02');
    this.contents.blt(bitmap, 0, 0, imageWidth, imageHeight, 0, 0);
    this.opacity = 0;
  };

  Window_TitleCommand.prototype.maxCols = function() {
    return 3;
  };

  Window_TitleCommand.prototype.maxItems = function() {
    return 3;
  };

  Window_TitleCommand.prototype.spacing = function() {
    return 0;
  };

  Window_TitleCommand.prototype.itemWidth = function() {
    return Math.floor(Graphics.width / 3);
  };

  Window_TitleCommand.prototype.itemHeight = function() {
    return 96;
  };

  Window_TitleCommand.prototype.addCommand = function(name, symbol, enabled, ext) {
    Window_Command.prototype.addCommand.call(this, '', symbol, enabled, ext);
  };

  //
  // configure for picture
  //
  Window_TitleCommand.prototype.updatePlacement = function() {
    this.x = -this.standardPadding();
    this.y = yPos - this.standardPadding();
  };

})();
