import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class PomodoroPreferences extends ExtensionPreferences {
  constructor(metadata) {
    super(metadata);
    this._settings = {
      totalRounds: 4,
      workDuration: 1500,
      breakDuration: 300,
      longBreakDuration: 900,
      soundEnabled: true,
      soundFile: "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga",
      indicatorPosition: "right",
      indicatorIndex: 0,
      showTimeAlways: false,
    };
    this._loadSettings();
  }

  _loadSettings() {
    try {
      const settingsPath = this.path + "/settings.json";
      const settingsFile = Gio.File.new_for_path(settingsPath);
      if (settingsFile.query_exists(null)) {
        const [success, contents] = settingsFile.load_contents(null);
        if (success) {
          const decoder = new TextDecoder();
          const settingsData = JSON.parse(decoder.decode(contents));
          this._settings.totalRounds =
            settingsData.totalRounds !== undefined
              ? settingsData.totalRounds
              : this._settings.totalRounds;
          this._settings.workDuration =
            settingsData.workDuration !== undefined
              ? settingsData.workDuration
              : this._settings.workDuration;
          this._settings.breakDuration =
            settingsData.breakDuration !== undefined
              ? settingsData.breakDuration
              : this._settings.breakDuration;
          this._settings.longBreakDuration =
            settingsData.longBreakDuration !== undefined
              ? settingsData.longBreakDuration
              : this._settings.longBreakDuration;
          this._settings.soundEnabled =
            settingsData.soundEnabled !== undefined
              ? settingsData.soundEnabled
              : this._settings.soundEnabled;
          this._settings.soundFile =
            settingsData.soundFile !== undefined
              ? settingsData.soundFile
              : this._settings.soundFile;
          this._settings.indicatorPosition =
            settingsData.indicatorPosition !== undefined
              ? settingsData.indicatorPosition
              : this._settings.indicatorPosition;
          this._settings.indicatorIndex =
            settingsData.indicatorIndex !== undefined
              ? settingsData.indicatorIndex
              : this._settings.indicatorIndex;
          this._settings.showTimeAlways =
            settingsData.showTimeAlways !== undefined
              ? settingsData.showTimeAlways
              : this._settings.showTimeAlways;
        }
      }
    } catch (e) {
      console.log("Failed to load settings:", e);
    }
  }

  _saveSettings() {
    try {
      const settingsPath = this.path + "/settings.json";
      const settingsFile = Gio.File.new_for_path(settingsPath);
      const contents = JSON.stringify(this._settings, null, 2);
      settingsFile.replace_contents(
        contents,
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,
        null,
      );
    } catch (e) {
      console.log("Failed to save settings:", e);
    }
  }

  fillPreferencesWindow(window) {
    window.set_title("Pomodoro Timer Settings");
    window.set_default_size(600, 600);

    const page = new Adw.PreferencesPage({
      title: "Timer Settings",
      icon_name: "preferences-system-symbolic",
    });
    window.add(page);

    const timingGroup = new Adw.PreferencesGroup({
      title: "Time Settings",
      description: "Set the duration of work sessions and breaks",
    });
    page.add(timingGroup);

    const roundsRow = new Adw.ActionRow({
      title: "Number of Rounds",
      subtitle: "Number of work sessions",
    });

    const roundsAdjustment = new Gtk.Adjustment({
      lower: 1,
      upper: 10,
      step_increment: 1,
      page_increment: 1,
      value: this._settings.totalRounds,
    });

    const roundsSpinButton = new Gtk.SpinButton({
      adjustment: roundsAdjustment,
      numeric: true,
      valign: Gtk.Align.CENTER,
    });

    roundsSpinButton.connect("value-changed", () => {
      this._settings.totalRounds = roundsSpinButton.get_value_as_int();
      this._saveSettings();
    });

    roundsRow.add_suffix(roundsSpinButton);
    timingGroup.add(roundsRow);

    const workTimeRow = new Adw.ActionRow({
      title: "Work Time",
      subtitle: "Duration of work sessions in minutes",
    });

    const workTimeAdjustment = new Gtk.Adjustment({
      lower: 1,
      upper: 60,
      step_increment: 1,
      page_increment: 5,
      value: this._settings.workDuration / 60,
    });

    const workTimeSpinButton = new Gtk.SpinButton({
      adjustment: workTimeAdjustment,
      numeric: true,
      valign: Gtk.Align.CENTER,
    });

    workTimeSpinButton.connect("value-changed", () => {
      this._settings.workDuration = workTimeSpinButton.get_value_as_int() * 60;
      this._saveSettings();
    });

    const workTimeBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 0,
    });
    workTimeBox.append(workTimeSpinButton);

    workTimeRow.add_suffix(workTimeBox);
    timingGroup.add(workTimeRow);

    const breakTimeRow = new Adw.ActionRow({
      title: "Short Break",
      subtitle: "Duration of short breaks in minutes",
    });

    const breakTimeAdjustment = new Gtk.Adjustment({
      lower: 1,
      upper: 30,
      step_increment: 1,
      page_increment: 5,
      value: this._settings.breakDuration / 60,
    });

    const breakTimeSpinButton = new Gtk.SpinButton({
      adjustment: breakTimeAdjustment,
      numeric: true,
      valign: Gtk.Align.CENTER,
    });

    breakTimeSpinButton.connect("value-changed", () => {
      this._settings.breakDuration = breakTimeSpinButton.get_value_as_int() * 60;
      this._saveSettings();
    });

    const breakTimeBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 0,
    });
    breakTimeBox.append(breakTimeSpinButton);

    breakTimeRow.add_suffix(breakTimeBox);
    timingGroup.add(breakTimeRow);

    const longBreakTimeRow = new Adw.ActionRow({
      title: "Long Break",
      subtitle: "Duration of the long break after all rounds are completed",
    });

    const longBreakTimeAdjustment = new Gtk.Adjustment({
      lower: 10,
      upper: 60,
      step_increment: 1,
      page_increment: 5,
      value: this._settings.longBreakDuration / 60,
    });

    const longBreakTimeSpinButton = new Gtk.SpinButton({
      adjustment: longBreakTimeAdjustment,
      numeric: true,
      valign: Gtk.Align.CENTER,
    });

    longBreakTimeSpinButton.connect("value-changed", () => {
      this._settings.longBreakDuration = longBreakTimeSpinButton.get_value_as_int() * 60;
      this._saveSettings();
    });

    const longBreakTimeBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 0,
    });
    longBreakTimeBox.append(longBreakTimeSpinButton);

    longBreakTimeRow.add_suffix(longBreakTimeBox);
    timingGroup.add(longBreakTimeRow);

    const soundGroup = new Adw.PreferencesGroup({
      title: "Sound Settings",
      description: "Manage sound notifications",
    });
    page.add(soundGroup);

    const soundEnabledRow = new Adw.ActionRow({
      title: "Enable Sound",
      subtitle: "Play sound notifications at the end of sessions",
    });

    const soundSwitch = new Gtk.Switch({
      active: this._settings.soundEnabled,
      valign: Gtk.Align.CENTER,
    });

    soundSwitch.connect("notify::active", () => {
      this._settings.soundEnabled = soundSwitch.get_active();
      this._saveSettings();
      soundFileRow.set_sensitive(this._settings.soundEnabled);
    });

    soundEnabledRow.add_suffix(soundSwitch);
    soundGroup.add(soundEnabledRow);

    const soundFileRow = new Adw.ActionRow({
      title: "Sound File",
      subtitle: this._settings.soundFile,
      sensitive: this._settings.soundEnabled,
    });

    const soundFileButton = new Gtk.Button({
      label: "Choose",
      valign: Gtk.Align.CENTER,
    });

    soundFileButton.connect("clicked", () => {
      const dialog = new Gtk.FileChooserDialog({
        title: "Choose a sound file",
        transient_for: window,
        modal: true,
        action: Gtk.FileChooserAction.OPEN,
      });

      dialog.add_button("Cancel", Gtk.ResponseType.CANCEL);
      dialog.add_button("Choose", Gtk.ResponseType.ACCEPT);

      const audioFilter = new Gtk.FileFilter();
      audioFilter.set_name("Audio files");
      audioFilter.add_mime_type("audio/*");
      audioFilter.add_pattern("*.wav");
      audioFilter.add_pattern("*.mp3");
      audioFilter.add_pattern("*.ogg");
      audioFilter.add_pattern("*.oga");
      audioFilter.add_pattern("*.flac");
      dialog.add_filter(audioFilter);

      const allFilter = new Gtk.FileFilter();
      allFilter.set_name("All files");
      allFilter.add_pattern("*");
      dialog.add_filter(allFilter);

      dialog.connect("response", (dialog, response) => {
        if (response === Gtk.ResponseType.ACCEPT) {
          const file = dialog.get_file();
          if (file) {
            const path = file.get_path();
            this._settings.soundFile = path;
            soundFileRow.set_subtitle(path);
            this._saveSettings();
          }
        }
        dialog.close();
      });

      dialog.show();
    });

    const testSoundButton = new Gtk.Button({
      label: "Test",
      valign: Gtk.Align.CENTER,
    });

    testSoundButton.connect("clicked", () => {
      if (this._settings.soundEnabled && this._settings.soundFile) {
        try {
          GLib.spawn_command_line_async(`paplay "${this._settings.soundFile}"`);
        } catch (e) {
          try {
            GLib.spawn_command_line_async(`aplay "${this._settings.soundFile}"`);
          } catch (e2) {
            console.log("Failed to play sound:", e, e2);
          }
        }
      }
    });

    const soundButtonBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 6,
    });
    soundButtonBox.append(testSoundButton);
    soundButtonBox.append(soundFileButton);

    soundFileRow.add_suffix(soundButtonBox);
    soundGroup.add(soundFileRow);

    const resetSoundRow = new Adw.ActionRow({
      title: "Reset Sound",
      subtitle: "Restore the default sound file",
    });

    const resetSoundButton = new Gtk.Button({
      label: "Reset",
      valign: Gtk.Align.CENTER,
    });

    resetSoundButton.connect("clicked", () => {
      this._settings.soundFile = "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga";
      soundFileRow.set_subtitle(this._settings.soundFile);
      this._saveSettings();
    });

    resetSoundRow.add_suffix(resetSoundButton);
    soundGroup.add(resetSoundRow);

    const positionGroup = new Adw.PreferencesGroup({
      title: "Indicator Position",
      description: "Configure indicator placement on the panel",
    });
    page.add(positionGroup);

    const panelBoxModel = new Gtk.StringList({
      strings: ["Left", "Center", "Right"],
    });

    const panelBoxRow = new Adw.ComboRow({
      title: "Panel Side",
      subtitle: "Choose the panel area for the indicator",
      model: panelBoxModel,
      selected: this._getPositionIndex(this._settings.indicatorPosition),
    });

    panelBoxRow.connect("notify::selected", () => {
      const positions = ["left", "center", "right"];
      this._settings.indicatorPosition = positions[panelBoxRow.selected];
      this._saveSettings();
    });

    positionGroup.add(panelBoxRow);

    const panelPriorityRow = new Adw.SpinRow({
      title: "Panel Order",
      subtitle: "Negative values - more to the left, positive - more to the right",
      adjustment: new Gtk.Adjustment({
        lower: -1000,
        upper: 1000,
        step_increment: 1,
        page_increment: 10,
        value: this._settings.indicatorIndex,
      }),
    });

    panelPriorityRow.connect("notify::value", () => {
      this._settings.indicatorIndex = Math.round(panelPriorityRow.value);
      this._saveSettings();
    });

    positionGroup.add(panelPriorityRow);

    const timeDisplayRow = new Adw.ActionRow({
      title: "Time Display",
      subtitle: "Show time always or only when the timer is running",
    });

    const timeDisplaySwitch = new Gtk.Switch({
      active: this._settings.showTimeAlways,
      valign: Gtk.Align.CENTER,
    });

    timeDisplaySwitch.connect("notify::active", () => {
      this._settings.showTimeAlways = timeDisplaySwitch.get_active();
      this._saveSettings();
    });

    timeDisplayRow.add_suffix(timeDisplaySwitch);
    positionGroup.add(timeDisplayRow);

    const infoGroup = new Adw.PreferencesGroup({
      title: "About Pomodoro Technique",
      description: "Information about the productivity method",
    });
    page.add(infoGroup);

    const techniqueRow = new Adw.ActionRow({
      title: "How It Works",
      subtitle: "25 minutes work → 5 minutes break → after 4 rounds a long break of 15-30 minutes",
    });
    infoGroup.add(techniqueRow);

    const benefitsRow = new Adw.ActionRow({
      title: "Benefits",
      subtitle: "Improves focus, reduces fatigue, increases work quality",
    });
    infoGroup.add(benefitsRow);

    const resetGroup = new Adw.PreferencesGroup({
      title: "Reset Settings",
      description: "Restore default values",
    });
    page.add(resetGroup);

    const resetButton = new Gtk.Button({
      label: "Reset to Default Values",
      halign: Gtk.Align.CENTER,
      valign: Gtk.Align.CENTER,
      css_classes: ["destructive-action"],
    });

    resetButton.connect("clicked", () => {
      this._settings.totalRounds = 4;
      this._settings.workDuration = 25 * 60;
      this._settings.breakDuration = 5 * 60;
      this._settings.longBreakDuration = 15 * 60;
      this._settings.soundEnabled = true;
      this._settings.soundFile = "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga";
      this._settings.indicatorPosition = "right";
      this._settings.indicatorIndex = 0;
      this._settings.showTimeAlways = false;

      roundsSpinButton.set_value(this._settings.totalRounds);
      workTimeSpinButton.set_value(this._settings.workDuration / 60);
      breakTimeSpinButton.set_value(this._settings.breakDuration / 60);
      longBreakTimeSpinButton.set_value(this._settings.longBreakDuration / 60);
      soundSwitch.set_active(this._settings.soundEnabled);
      soundFileRow.set_subtitle(this._settings.soundFile);
      soundFileRow.set_sensitive(this._settings.soundEnabled);
      panelBoxRow.set_selected(this._getPositionIndex(this._settings.indicatorPosition));
      panelPriorityRow.set_value(this._settings.indicatorIndex);
      timeDisplaySwitch.set_active(this._settings.showTimeAlways);

      this._saveSettings();
    });

    const resetRow = new Adw.ActionRow({
      title: "Restore Settings",
      subtitle: "Reset all values to standard Pomodoro settings",
    });
    resetRow.add_suffix(resetButton);
    resetGroup.add(resetRow);
  }

  _getPositionIndex(position) {
    const positions = ["left", "center", "right"];
    return Math.max(0, positions.indexOf(position));
  }
}
