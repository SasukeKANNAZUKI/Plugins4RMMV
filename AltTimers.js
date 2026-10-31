//=============================================================================
// AltTimers.js
//=============================================================================

/*:
 * @plugindesc provide alternative timers
 * @author Sasuke KANNAZUKI
 * 
 * @help
 * - the timers controlled in this plugin is independent from default one.
 * - the timers defined in this plugin is not displayed.
 * - the timers cannot judge by event command 'branch'.
 * - when any working timers expire on battle, abort the battle.
 *
 * Plugin commands：
 * AltTimers <TimerID> start <Second> <Frame> <SwitchID>  # start
 *   <TimerID> >=1, <Second>: >=0,
 *   <Frame>:(60frame=1sec) (omissible),
 *   <SwitchID>: the switch is ON when the timer is out.(omissible)
 * AltTimers <TimerID> switch <SwitchID>  # set/modify the switch id
 *   when the timer is out.
 *   #=> it's invalid if the timer is already timed out.
 * AltTimers <TimerID> stop       # stop
 * AltTimers <TimerID> restart    # restart the stopped timer
 *   #=> not restart if the timer is already timed out.
 * AltTimers <TimerID> increase <Second>   # increase timer limit
 *   #=> to decrease, set negative value.
 *   #=> not increase if the timer is already timed out.
 * AltTimers <TimerID> restSecond <VarID> # set <VarID> rest seconds
 * AltTimers <TimerID> restFrame <VarID>  # set <VarID> rest frames
 * AltTimers <TimerID> isWorking <SwithId> # set <SwitchID> working or not.
 * 
 * ex:
 * AltTimers 1 start 5 30 25 # start timer 1. 5.5sec, switch 25 after expired
 * AltTimers 2 start 5       # start timer 2. 5sec. switch won't change.
 * 
 * - game variable is also available to set number parameter like V20.
 * ex:
 * AltTimers V2 start V5     # start timer whose number is variable ID 2,
 *   the second is variable ID 5.
 * 
 */
/*:ja
 * @plugindesc システムのタイマーとは独立したタイマーを複数設定します
 * @author 神無月サスケ
 * 
 * @help
 * - このプラグインは、システムのタイマーには影響を与えません。
 * - このプラグインで設定されたタイマーは、表示されません。
 * - このプラグインのタイマーは条件分岐のタイマーでは判定できません。
 * - 戦闘中にどれか作動中のタイマーが0になると、強制的に戦闘終了します
 *
 * プラグインコマンド：
 * AltTimers <TimerID> start <Second> <Frame> <SwitchID>  # 開始
 *   <TimerID>:タイマーID(1以上), <Second>:秒(0以上の整数),
 *   <Frame>:フレーム数(60フレーム=1秒) (省略可能),
 *   <SwitchID>:タイマーが0になった時にONにするスイッチ(省略可能)
 * AltTimers <TimerID> switch <SwitchID>  # タイマーが0になった時に
 *   ONにするスイッチを設定/変更
 * AltTimers <TimerID> stop       # 停止
 * AltTimers <TimerID> restart    # 停止中のタイマーを再開
 *   #=> 残り時間が 0 の時は再開しない
 * AltTimers <TimerID> increase <Second>   # タイマーの秒数を増やす
 *   #=> マイナスの値を指定すると、減らすことも出来る。
 *   #=> このコマンドでタイムが0になってもスイッチは ON にならない
 *   #=> 残り時間が 0 の時は増やさない
 * AltTimers <TimerID> restSecond <VarID> # 残り秒数を<VarID>に代入
 * AltTimers <TimerID> restFrame <VarID>  # 残りフレーム数を<VarID>に代入
 *   #=> 60で割ると秒数が、60で余剰を求めると残りフレーム数が分かる
 * AltTimers <TimerID> isWorking <SwithId> # 作動中かを<SwitchID>に代入
 * 
 * 例：
 * AltTimers 1 start 5 30 25 # タイマー1始動。5.5秒。終了後25番のスイッチをONに
 * AltTimers 2 start 5       # タイマー2始動  5秒。スイッチは変化しない
 * 
 * - 上記の数値は変数をパラメータに取ることも出来ます。例えば V20 なら
 *   20番の変数の値になります。
 * 例：
 * AltTimers V2 start V5     # 変数2番のタイマーID を 変数5番の秒数でスタート
 */

(function() {

  //
  // process plugins
  //
  var argToNumber = function(arg) {
    var reg = (/^V([0-9]+)/i).exec(arg);
    if(reg){
      return $gameVariables.value(Number(reg[1])) || 0;
    } else {
      return Number(arg) || 0;
    }
  };

  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'AltTimers') {
      var timer = null;
      var id = argToNumber(args[0]);
      if (id > 0) {
        var timer = $gameSystem.altTimers[id];
        if (!timer) {
          $gameSystem.altTimers[id] = new Game_Timer();
          timer = $gameSystem.altTimers[id];
        }
      }
      if (timer) {
        switch (args[1]) {
        case 'start':
          var sec = argToNumber(args[2]);
          var numFrames = argToNumber(args[3]) || 0;
          timer._fireSwitchOnExpire = argToNumber(args[4]);
          timer.start(sec * 60 + numFrames);
          break;
        case 'switch':
          timer._fireSwitchOnExpire = argToNumber(args[2]);
          break;
        case 'stop':
          timer.stop();
          break;
        case 'restart':
          timer.restart();
          break;
        case 'increase':
          if (timer._frames !== 0) {
            timer._frames = timer._frames + argToNumber(args[2]) * 60;
            timer._frames = Math.max(timer._frames, 0);
          }
          break;
        case 'restSecond':
          var varId = argToNumber(args[2]);
          $gameVariables.setValue(varId, timer.seconds());
          break;
        case 'restFrame':
          var varId = argToNumber(args[2]);
          $gameVariables.setValue(varId, timer.frames());
          break;
        case 'isWorking':
          var switchId = argToNumber(args[2]);
          $gameSwitches.setValue(switchId, timer.isWorking());
          break;
        }
      }
    }
  };

  //
  // setting a timer
  //
  var _Game_Timer_initialize = Game_Timer.prototype.initialize;
  Game_Timer.prototype.initialize = function() {
    _Game_Timer_initialize.call(this);
    this._fireSwitchOnExpire = 0;
  };

  var _Game_Timer_onExpire = Game_Timer.prototype.onExpire;
  Game_Timer.prototype.onExpire = function() {
    if (this._fireSwitchOnExpire) {
      $gameSwitches.setValue(this._fireSwitchOnExpire, true);
    }
    _Game_Timer_onExpire.call(this);
  };

  //
  // extension of a timer
  //
  Game_Timer.prototype.restart = function(count) {
    if (this._frames > 0) {
      this._working = true;
    }
  };

  Game_Timer.prototype.frames = function() {
    return this._frames;
  };

  //
  // control alt timers at Game_System
  //
  var _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this.altTimers = [];
  };

  Game_System.prototype.updateAltTimers = function(active) {
    this.altTimers = this.altTimers || [];
    for (i = 0; i < this.altTimers.length; i++) {
      if (this.altTimers[i]) {
        this.altTimers[i].update(active);
      }
    }
  };

  //
  // update alt timers on scene.
  //
  var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
  Scene_Map.prototype.updateMain = function() {
    $gameSystem.updateAltTimers(this.isActive());
    _Scene_Map_updateMain.call(this);
  };

  var _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    $gameSystem.updateAltTimers(this.isActive());
    _Scene_Battle_update.call(this);
  };

})();
