import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const PomodoroIndicator = GObject.registerClass(
  class PomodoroIndicator extends PanelMenu.Button {
    _init(extensionPath) {
      super._init(0.5, "Pomodoro Timer");

      this.extensionPath = extensionPath;

      let box = new St.BoxLayout({
        style_class: "pomodoro-panel-box",
        vertical: false,
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.icon = new St.Label({
        text: "🍅",
        style_class: "system-status-icon",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._loadSettings();

      const initialMinutes = Math.floor(this.workDuration / 60);
      const initialSeconds = this.workDuration % 60;
      const initialTimeText = `${initialMinutes.toString().padStart(2, "0")}:${initialSeconds.toString().padStart(2, "0")}`;

      this.timeLabel = new St.Label({
        text: initialTimeText,
        style_class: "pomodoro-timer-label",
        y_align: Clutter.ActorAlign.CENTER,
        visible: false,
      });

      box.add_child(this.icon);
      box.add_child(this.timeLabel);

      this.add_child(box);

      this.timerId = null;
      this.blinkId = null;
      this.isRunning = false;
      this.isPaused = false;

      this.remainingSeconds = this.workDuration;

      this._setupSettingsMonitor();

      this._createMenu();

      this._updateDisplay();
      this._updateTimeVisibility();

      this._saveCurrentState();
    }

    _getDefaultSettings() {
      return {
        totalRounds: 4,
        workDuration: 25 * 60,
        breakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        soundEnabled: true,
        soundFile: "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga",
        indicatorPosition: "right",
        indicatorIndex: 0,
        showTimeAlways: false,
        currentRound: 1,
        isBreakTime: false,
        isLongBreak: false,
      };
    }

    _loadSettings(resetCurrentRound = true) {
      const defaultSettings = this._getDefaultSettings();
      const settingsPath = this.extensionPath + "/settings.json";
      const settingsFile = Gio.File.new_for_path(settingsPath);

      let settings = defaultSettings;

      try {
        if (settingsFile.query_exists(null)) {
          settingsFile.query_info("*", Gio.FileQueryInfoFlags.NONE, null);

          const [success, contents] = settingsFile.load_contents(null);
          if (success) {
            const decoder = new TextDecoder();
            const settingsText = decoder.decode(contents);
            const settingsData = JSON.parse(settingsText);
            settings = { ...defaultSettings, ...settingsData };
          }
        } else {
          this._saveSettingsToFile(defaultSettings);
        }
      } catch (e) {
        try {
          this._saveSettingsToFile(defaultSettings);
        } catch (saveError) {}
      }

      this.totalRounds = settings.totalRounds;
      this.workDuration = settings.workDuration;
      this.breakDuration = settings.breakDuration;
      this.longBreakDuration = settings.longBreakDuration;
      this.soundEnabled = settings.soundEnabled;
      this.soundFile = settings.soundFile;
      this.indicatorPosition = settings.indicatorPosition;
      this.indicatorIndex = settings.indicatorIndex;
      this.showTimeAlways = settings.showTimeAlways;

      if (resetCurrentRound) {
        this.currentRound = 1;
        this.isBreakTime = false;
        this.isLongBreak = false;
        this._clearTimerState();
      } else {
        if (!this._loadTimerState()) {
          this.currentRound = 1;
          this.isBreakTime = false;
          this.isLongBreak = false;
        }
      }
    }

    _saveSettingsToFile(settings) {
      try {
        const settingsPath = this.extensionPath + "/settings.json";
        const settingsFile = Gio.File.new_for_path(settingsPath);
        const contents = JSON.stringify(settings, null, 2);
        settingsFile.replace_contents(
          contents,
          null,
          false,
          Gio.FileCreateFlags.REPLACE_DESTINATION,
          null,
        );
      } catch (e) {
        throw e;
      }
    }

    _saveCurrentState() {
      try {
        const statePath = this.extensionPath + "/timer_state.json";
        const stateFile = Gio.File.new_for_path(statePath);

        const timerState = {
          currentRound: this.currentRound,
          isBreakTime: this.isBreakTime,
          isLongBreak: this.isLongBreak,
          isRunning: this.isRunning,
          isPaused: this.isPaused,
          remainingSeconds: this.remainingSeconds,
        };

        const contents = JSON.stringify(timerState, null, 2);
        stateFile.replace_contents(
          contents,
          null,
          false,
          Gio.FileCreateFlags.REPLACE_DESTINATION,
          null,
        );
      } catch (e) {}
    }

    _loadTimerState() {
      try {
        const statePath = this.extensionPath + "/timer_state.json";
        const stateFile = Gio.File.new_for_path(statePath);

        if (stateFile.query_exists(null)) {
          const [success, contents] = stateFile.load_contents(null);
          if (success) {
            const decoder = new TextDecoder();
            const timerState = JSON.parse(decoder.decode(contents));

            this.currentRound = timerState.currentRound || 1;
            this.isBreakTime = timerState.isBreakTime || false;
            this.isLongBreak = timerState.isLongBreak || false;
            if (timerState.remainingSeconds) {
              this.remainingSeconds = timerState.remainingSeconds;
            }
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    _clearTimerState() {
      try {
        const statePath = this.extensionPath + "/timer_state.json";
        const stateFile = Gio.File.new_for_path(statePath);
        if (stateFile.query_exists(null)) {
          stateFile.delete(null);
        }
      } catch (e) {}
    }

    _setupSettingsMonitor() {
      try {
        const settingsPath = this.extensionPath + "/settings.json";
        const settingsFile = Gio.File.new_for_path(settingsPath);

        this._settingsMonitor = settingsFile.monitor_file(Gio.FileMonitorFlags.NONE, null);
        this._settingsMonitor.connect("changed", () => {
          this._reloadSettings();
        });
      } catch (e) {
        console.log("Failed to set up settings file monitoring:", e);
      }
    }

    _openSettings() {
      try {
        Gio.Subprocess.new(
          ["gnome-extensions", "prefs", "pomodorotimer@markelofaleksei@gmail.com"],
          Gio.SubprocessFlags.NONE,
        );
      } catch (e) {
        console.log("Failed to open settings:", e);
        Main.notify("Pomodoro Timer", "Failed to open settings window");
      }
    }

    _createMenu() {
      let titleItem = new PopupMenu.PopupMenuItem("Pomodoro Timer", {
        reactive: false,
        style_class: "pomodoro-menu-title",
      });
      this.menu.addMenuItem(titleItem);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this.statusItem = new PopupMenu.PopupMenuItem("Ready to work", {
        reactive: false,
        style_class: "pomodoro-status",
      });
      this.menu.addMenuItem(this.statusItem);

      this.progressItem = new PopupMenu.PopupMenuItem(
        `Round: ${this.currentRound}/${this.totalRounds}`,
        {
          reactive: false,
          style_class: "pomodoro-progress",
        },
      );
      this.menu.addMenuItem(this.progressItem);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this.startPauseItem = new PopupMenu.PopupMenuItem("Start");
      this.startPauseItem.connect("activate", () => this._toggleTimer());
      this.menu.addMenuItem(this.startPauseItem);

      this.stopItem = new PopupMenu.PopupMenuItem("Stop");
      this.stopItem.connect("activate", () => this._stopTimer());
      this.menu.addMenuItem(this.stopItem);

      this.resetItem = new PopupMenu.PopupMenuItem("Reset");
      this.resetItem.connect("activate", () => this._resetTimer());
      this.menu.addMenuItem(this.resetItem);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      let settingsItem = new PopupMenu.PopupMenuItem("Settings");
      settingsItem.connect("activate", () => this._openSettings());
      this.menu.addMenuItem(settingsItem);

      this.menu.connect("open-state-changed", (open) => {
        if (open) {
          this._updateMenuStatus();
        }
      });
    }

    _reloadSettings() {
      this._updateDynamicSettings();
    }

    _updateDynamicSettings() {
      try {
        const settingsPath = this.extensionPath + "/settings.json";
        const settingsFile = Gio.File.new_for_path(settingsPath);

        if (settingsFile.query_exists(null)) {
          const [success, contents] = settingsFile.load_contents(null);
          if (success) {
            const decoder = new TextDecoder();
            const settingsData = JSON.parse(decoder.decode(contents));

            const oldPosition = this.indicatorPosition;
            const oldIndex = this.indicatorIndex;

            if (settingsData.totalRounds !== undefined) {
              this.totalRounds = settingsData.totalRounds;
            }
            if (settingsData.workDuration !== undefined) {
              this.workDuration = settingsData.workDuration;
            }
            if (settingsData.breakDuration !== undefined) {
              this.breakDuration = settingsData.breakDuration;
            }
            if (settingsData.longBreakDuration !== undefined) {
              this.longBreakDuration = settingsData.longBreakDuration;
            }
            if (settingsData.soundEnabled !== undefined) {
              this.soundEnabled = settingsData.soundEnabled;
            }
            if (settingsData.soundFile !== undefined) {
              this.soundFile = settingsData.soundFile;
            }
            if (settingsData.indicatorPosition !== undefined) {
              this.indicatorPosition = settingsData.indicatorPosition;
            }
            if (settingsData.indicatorIndex !== undefined) {
              this.indicatorIndex = settingsData.indicatorIndex;
            }
            if (settingsData.showTimeAlways !== undefined) {
              this.showTimeAlways = settingsData.showTimeAlways;
              this._updateTimeVisibility();
            }

            if (oldPosition !== this.indicatorPosition || oldIndex !== this.indicatorIndex) {
              if (global.pomodoroExtension) {
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                  global.pomodoroExtension._moveIndicatorToNewPosition();
                  return GLib.SOURCE_REMOVE;
                });
              }
              return;
            }

            if (!this.isRunning && !this.isPaused) {
              if (this.isBreakTime) {
                this.remainingSeconds = this.isLongBreak
                  ? this.longBreakDuration
                  : this.breakDuration;
              } else {
                this.remainingSeconds = this.workDuration;
              }
              this._updateDisplay();
            }

            this._updateMenuStatus();
          }
        }
      } catch (e) {}
    }

    _loadConfigurationSettings() {
      const defaultSettings = this._getDefaultSettings();
      const settingsPath = this.extensionPath + "/settings.json";
      const settingsFile = Gio.File.new_for_path(settingsPath);

      let settings = defaultSettings;

      try {
        if (settingsFile.query_exists(null)) {
          settingsFile.query_info("*", Gio.FileQueryInfoFlags.NONE, null);

          const [success, contents] = settingsFile.load_contents(null);
          if (success) {
            const decoder = new TextDecoder();
            const settingsText = decoder.decode(contents);
            const settingsData = JSON.parse(settingsText);
            settings = { ...defaultSettings, ...settingsData };
          }
        }
      } catch (e) {}

      this.totalRounds = settings.totalRounds;
      this.workDuration = settings.workDuration;
      this.breakDuration = settings.breakDuration;
      this.longBreakDuration = settings.longBreakDuration;
      this.soundEnabled = settings.soundEnabled;
      this.soundFile = settings.soundFile;
      this.indicatorPosition = settings.indicatorPosition;
      this.indicatorIndex = settings.indicatorIndex;
      this.showTimeAlways = settings.showTimeAlways;
    }

    _toggleTimer() {
      if (this.isRunning && !this.isPaused) {
        this._pauseTimer();
      } else if (this.isPaused) {
        this._resumeTimer();
      } else {
        this._startTimer();
      }
    }

    _startTimer() {
      this.isRunning = true;
      this.isPaused = false;
      this._stopBlinking();

      this._updateTimeVisibility();

      this.timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        if (!this.isRunning || this.isPaused) {
          return GLib.SOURCE_REMOVE;
        }

        this.remainingSeconds--;
        this._updateDisplay();

        if (this.remainingSeconds <= 0) {
          this._onTimerFinished();
          return GLib.SOURCE_REMOVE;
        }
        return GLib.SOURCE_CONTINUE;
      });

      this._updateMenuStatus();
    }

    _pauseTimer() {
      if (this.timerId) {
        GLib.source_remove(this.timerId);
        this.timerId = null;
      }
      this.isPaused = true;

      this._saveCurrentState();

      this._updateTimeVisibility();
      this._updateMenuStatus();
    }

    _resumeTimer() {
      this.isPaused = false;
      this.isRunning = true;
      this.isPaused = false;
      this._stopBlinking();

      this.timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        if (!this.isRunning || this.isPaused) {
          return GLib.SOURCE_REMOVE;
        }

        this.remainingSeconds--;
        this._updateDisplay();

        if (this.remainingSeconds <= 0) {
          this._onTimerFinished();
          return GLib.SOURCE_REMOVE;
        }
        return GLib.SOURCE_CONTINUE;
      });

      this._updateTimeVisibility();
      this._updateMenuStatus();
    }

    _stopTimer() {
      if (this.timerId) {
        GLib.source_remove(this.timerId);
        this.timerId = null;
      }

      this.isRunning = false;
      this.isPaused = false;
      this._stopBlinking();

      if (this.isBreakTime) {
        if (this.isLongBreak) {
          this.remainingSeconds = this.longBreakDuration;
        } else {
          this.remainingSeconds = this.breakDuration;
        }
      } else {
        this.remainingSeconds = this.workDuration;
      }

      this._saveCurrentState();

      this._updateDisplay();
      this._updateTimeVisibility();
      this._updateMenuStatus();
    }

    _resetTimer() {
      if (this.timerId) {
        GLib.source_remove(this.timerId);
        this.timerId = null;
      }

      this.isRunning = false;
      this.isPaused = false;
      this._stopBlinking();

      this.currentRound = 1;
      this.isBreakTime = false;
      this.isLongBreak = false;
      this.remainingSeconds = this.workDuration;

      this._clearTimerState();

      this._updateDisplay();
      this._updateTimeVisibility();
      this._updateMenuStatus();
    }

    _onTimerFinished() {
      this.isRunning = false;
      this.isPaused = false;

      if (this.isBreakTime) {
        if (this.isLongBreak) {
          this._resetTimer();
          this._playSound();
          return;
        } else {
          this.currentRound++;
          this.isBreakTime = false;
          this.isLongBreak = false;
          this.remainingSeconds = this.workDuration;

          this._saveCurrentState();

          this._startBlinking();
        }
      } else {
        this.isBreakTime = true;

        if (this.currentRound >= this.totalRounds) {
          this.isLongBreak = true;
          this.remainingSeconds = this.longBreakDuration;
        } else {
          this.isLongBreak = false;
          this.remainingSeconds = this.breakDuration;
        }

        this._saveCurrentState();

        this._startBlinking();
      }

      this._updateDisplay();
      this._updateMenuStatus();

      this._playSound();
    }

    _playSound() {
      if (!this.soundEnabled) {
        return;
      }

      try {
        GLib.spawn_command_line_async(`paplay "${this.soundFile}"`);
      } catch (e) {
        try {
          GLib.spawn_command_line_async(`aplay "${this.soundFile}"`);
        } catch (e2) {
          try {
            GLib.spawn_command_line_async(`ffplay -nodisp -autoexit "${this.soundFile}"`);
          } catch (e3) {}
        }
      }
    }

    _startBlinking() {
      this._stopBlinking();
      let isVisible = true;

      this.blinkId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        if (isVisible) {
          this.opacity = 100;
        } else {
          this.opacity = 255;
        }
        isVisible = !isVisible;
        return GLib.SOURCE_CONTINUE;
      });
    }

    _stopBlinking() {
      if (this.blinkId) {
        GLib.source_remove(this.blinkId);
        this.blinkId = null;
      }
      this.opacity = 255;
    }

    _updateDisplay() {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      this.timeLabel.text = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (this.isBreakTime) {
        this.icon.text = "☕";
      } else {
        this.icon.text = "🍅";
      }

      this.remove_style_class_name("pomodoro-running");
      this.remove_style_class_name("pomodoro-break");
      this.remove_style_class_name("pomodoro-paused");
      this.remove_style_class_name("pomodoro-state-work");
      this.remove_style_class_name("pomodoro-state-break");
      this.remove_style_class_name("pomodoro-state-paused");

      if (this.isRunning && !this.isPaused) {
        if (this.isBreakTime) {
          this.add_style_class_name("pomodoro-break");
          this.add_style_class_name("pomodoro-state-break");
        } else {
          this.add_style_class_name("pomodoro-running");
          this.add_style_class_name("pomodoro-state-work");
        }
      } else if (this.isPaused) {
        this.add_style_class_name("pomodoro-paused");
        this.add_style_class_name("pomodoro-state-paused");
      } else {
        if (this.isBreakTime) {
          this.add_style_class_name("pomodoro-state-break");
        } else {
        }
      }
    }

    _updateTimeVisibility() {
      if (this.showTimeAlways) {
        this.timeLabel.visible = true;
      } else {
        this.timeLabel.visible = this.isRunning || this.isPaused;
      }
    }

    _updateMenuStatus() {
      if (this.isRunning && !this.isPaused) {
        this.startPauseItem.label.text = "Pause";
        if (this.isBreakTime) {
          if (this.isLongBreak) {
            this.statusItem.label.text = "Long break...";
          } else {
            this.statusItem.label.text = "Short break...";
          }
        } else {
          this.statusItem.label.text = "Working...";
        }
      } else if (this.isPaused) {
        this.startPauseItem.label.text = "Resume";
        this.statusItem.label.text = "Paused";
      } else {
        this.startPauseItem.label.text = "Start";
        if (this.isBreakTime) {
          if (this.isLongBreak) {
            this.statusItem.label.text = "Ready for long break";
          } else {
            this.statusItem.label.text = "Ready for break";
          }
        } else {
          this.statusItem.label.text = "Ready to work";
        }
      }

      if (this.isLongBreak) {
        this.progressItem.label.text = "Long break";
      } else {
        this.progressItem.label.text = `Round: ${this.currentRound}/${this.totalRounds}`;
      }
    }

    destroy() {
      if (this.timerId) {
        GLib.source_remove(this.timerId);
        this.timerId = null;
      }

      if (this.blinkId) {
        GLib.source_remove(this.blinkId);
        this.blinkId = null;
      }

      if (this._settingsMonitor) {
        this._settingsMonitor.cancel();
        this._settingsMonitor = null;
      }

      super.destroy();
    }
  },
);

export default class PomodoroExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
  }

  enable() {
    this._indicator = new PomodoroIndicator(this.path);
    this._addIndicatorToPanel();
    global.pomodoroExtension = this;
  }

  _addIndicatorToPanel() {
    if (!this._indicator) return;
    let position = "right";
    let index = 0;

    try {
      const settingsPath = this.path + "/settings.json";
      const settingsFile = Gio.File.new_for_path(settingsPath);
      if (settingsFile.query_exists(null)) {
        const [success, contents] = settingsFile.load_contents(null);
        if (success) {
          const decoder = new TextDecoder();
          const settingsData = JSON.parse(decoder.decode(contents));
          position = settingsData.indicatorPosition || "right";
          index = settingsData.indicatorIndex !== undefined ? settingsData.indicatorIndex : 0;
        }
      }
    } catch (e) {
      console.log("Failed to load indicator position settings:", e);
    }

    switch (position) {
      case "left":
        Main.panel.addToStatusArea("pomodoro-timer", this._indicator, index, "left");
        break;
      case "center":
        Main.panel.addToStatusArea("pomodoro-timer", this._indicator, index, "center");
        break;
      case "right":
      default:
        Main.panel.addToStatusArea("pomodoro-timer", this._indicator, index, "right");
        break;
    }
  }

  _removeIndicatorFromPanel() {
    if (this._indicator) {
      Main.panel._removeStatusArea("pomodoro-timer");
    }
  }

  disable() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
    global.pomodoroExtension = null;
  }

  _moveIndicatorToNewPosition() {
    if (this._indicator) {
      const currentState = {
        currentRound: this._indicator.currentRound,
        remainingSeconds: this._indicator.remainingSeconds,
        isRunning: this._indicator.isRunning,
        isPaused: this._indicator.isPaused,
        isBreakTime: this._indicator.isBreakTime,
        isLongBreak: this._indicator.isLongBreak,
      };

      this._indicator.destroy();

      this._indicator = new PomodoroIndicator(this.path);

      this._indicator.currentRound = currentState.currentRound;
      this._indicator.remainingSeconds = currentState.remainingSeconds;
      this._indicator.isRunning = currentState.isRunning;
      this._indicator.isPaused = currentState.isPaused;
      this._indicator.isBreakTime = currentState.isBreakTime;
      this._indicator.isLongBreak = currentState.isLongBreak;

      this._addIndicatorToPanel();

      this._indicator._updateDisplay();
      this._indicator._updateMenuStatus();

      if (currentState.isRunning && !currentState.isPaused) {
        this._indicator._startTimer();
      }
    }
  }
}
