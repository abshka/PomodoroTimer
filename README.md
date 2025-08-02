# 🍅 PomodoroTimer for GNOME Shell

A minimalist extension for GNOME Shell implementing the Pomodoro technique to boost productivity.

## ✨ Features

### Core Features

- **Session system** with customizable number of sessions (2-10 sessions)
- **Flexible time settings** for work and breaks
- **Automatic switching** between work and break periods
- **Progress tracking** with display of current session
- **Visual effects** - blinking when sessions end
- **System notifications** with detailed information
- **Customizable sound alerts** with file selection
- **Full sound control** - enable/disable and test playback
- **Intuitive menu** with audio player icons

### Visual Indicators

- 🍅 **Tomato icon** in the status bar for work time
- ☕ **Coffee icon** for break time
- ⏰ **Time display** with monospace font
- ✨ **Blinking** at the end of sessions to attract attention

## 🚀 Installation

1. Copy the extension folder to the GNOME Shell directory:

   ```bash
   cp -r pomodorotimer@markelofaleksei@gmail.com ~/.local/share/gnome-shell/extensions/
   ```

2. Restart GNOME Shell:
   - **X11**: `Alt + F2`, type `r` and press Enter
   - **Wayland**: Log out and log back in

3. Enable the extension:
   ```bash
   gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com
   ```

## 🎯 Usage

### Quick Start

1. Find the 🍅 icon in the top panel
2. Click it to open the menu
3. Select "Start" to begin a session
4. Work until you hear the sound alert!

### Timer Controls

- **Start/Pause**: Start and pause the timer
- **Stop**: Stop the current session
- **Reset**: Full reset to the first session
- **Settings**: Quickly change parameters with one click

### Parameter Settings

The settings window offers the following options:

**Number of sessions**: 1-10 (slider)
**Work time**: 5-60 minutes (slider)
**Short break time**: 1-30 minutes (slider)
**Long break time**: 10-60 minutes (slider)

### Sound Settings

**Enable sound**: Toggle sound notifications on/off
**Select sound file**: Button to choose a custom audio file
**Test sound**: Button to check the selected sound
**Reset to default**: Return to system sound

## 🔧 Features

### Session System

- **Customizable number of sessions** (default is 4)
- **Work time** → **Short break** between sessions
- **Long break** after all sessions are completed
- **Automatic reset** after the whole cycle is finished
- **Correct increment logic**: Sessions are properly increased after each work period
- **Progress display** in format "Round: 2/4"

## 🎨 Customization

### CSS Styles

The `stylesheet.css` file contains all styles for appearance customization:

- Panel colors and fonts
- Animations and transitions
- Menu and notification styles
- Adaptivity for different screen sizes

### Sound Settings

Sound notifications are fully customizable via the interface:

1. **Enable/disable sound**: Use the toggle in settings
2. **Select sound file**: Click "Select" to upload your audio file
3. **Test sound**: "Test" button to check the selected sound
4. **Supported formats**: WAV, MP3, OGG, OGA, FLAC
5. **Reset to default**: "Reset" button to return to system sound

Default sound used: `/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga`

## 🐛 Troubleshooting

### Extension does not load

```bash
# Check GNOME Shell logs
journalctl /usr/bin/gnome-shell -f | grep pomodoro

# Check extension status
gnome-extensions list --enabled | grep pomodoro
```

### Reset settings

```bash
# Disable and enable the extension
gnome-extensions disable pomodorotimer@markelofaleksei@gmail.com
gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com
```

### Sound issues

Make sure PulseAudio is running:

```bash
pulseaudio --check -v
```

## 🔧 Compatibility

- **GNOME Shell**: 45, 46, 47, 48+
- **Operating systems**: Linux (Ubuntu, Fedora, Arch, etc.)
- **Requirements**: GJS, GTK4, Adwaita

## 📝 License

MIT License - use and modify freely for your needs.

## 🤝 Contributing

All improvements are welcome! To contribute:

1. Create a fork of the project
2. Make your changes
3. Test on your system
4. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check GNOME Shell logs
2. Make sure your version is compatible
3. Create an issue on GitHub describing the problem
