# 🍅 PomodoroTimer for GNOME Shell

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GNOME Shell](https://img.shields.io/badge/GNOME%20Shell-45%2B-blue.svg)](https://www.gnome.org/)
[![Version](https://img.shields.io/badge/Version-1.0-green.svg)](https://github.com/abshka/PomodoroTimer/releases)

A modern, feature-rich Pomodoro Timer extension for GNOME Shell with persistent state, dynamic settings, and comprehensive timer controls.

> **Perfect for productivity enthusiasts using the Pomodoro Technique!**

## ✨ Features

### Core Features

- **🔄 Smart Session System** - Customizable rounds (1-10) with proper cycle logic
- **⏰ Flexible Timing** - Work/break durations from 5-60 minutes
- **🎯 Three Control Modes** - Pause (temporary), Stop (restart period), Reset (full restart)
- **💾 Persistent State** - Survives GNOME Shell restarts and crashes
- **⚡ Dynamic Settings** - Change preferences without interrupting running timer
- **🔊 Audio Notifications** - Custom sound files with test playback
- **🎨 Visual Feedback** - Indicator blinking and status icons (🍅 work, ☕ break)
- **📍 Flexible Positioning** - Customizable panel position and time display

### Advanced Features

- **State Management** - Timer state and settings stored independently
- **Zero Interruption** - Modify settings while timer runs without state loss
- **Smart Controls** - Different stop behaviors for different scenarios
- **Cross-Session Persistence** - Resume exactly where you left off
- **Accessibility** - Works with/without time display, full indicator blinking

## 🚀 Installation

### Method 1: From GitHub Repository (Recommended)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/abshka/PomodoroTimer.git
   cd PomodoroTimer
   ```

2. **Install the extension:**

   ```bash
   # Create extensions directory if it doesn't exist
   mkdir -p ~/.local/share/gnome-shell/extensions/

   # Copy extension files
   cp -r . ~/.local/share/gnome-shell/extensions/pomodorotimer@markelofaleksei@gmail.com/
   ```

3. **Restart GNOME Shell:**
   - **X11**: `Alt + F2`, type `r` and press Enter
   - **Wayland**: Log out and log back in

4. **Enable the extension:**
   ```bash
   gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com
   ```

### Method 2: Download ZIP

1. **Download:** [Latest Release](https://github.com/abshka/PomodoroTimer/releases/latest)
2. **Extract** to `~/.local/share/gnome-shell/extensions/pomodorotimer@markelofaleksei@gmail.com/`
3. **Restart GNOME Shell** (see above)
4. **Enable extension** (see above)

### Method 3: One-liner Installation

```bash
git clone https://github.com/abshka/PomodoroTimer.git ~/.local/share/gnome-shell/extensions/pomodorotimer@markelofaleksei@gmail.com && gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com
```

Then restart GNOME Shell.

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

### Timer Controls Logic

- **▶ Start/|| Pause** - Start and temporary pause (saves exact time)
- **◼ Stop** - Return to beginning of current period (work/break), preserving session
- **↻ Reset** - Complete reset to first session and work state

### State Management

- **Persistent state** - Timer state survives GNOME Shell restarts
- **Dynamic settings** - Change settings without interrupting running timer
- **Separate storage** - Timer state and user settings stored independently

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

## 🛠️ Development

### Local Development Setup

1. **Clone and link for development:**

   ```bash
   git clone https://github.com/abshka/PomodoroTimer.git
   cd PomodoroTimer

   # Link to extensions directory for development
   ln -sf "$PWD" ~/.local/share/gnome-shell/extensions/pomodorotimer@markelofaleksei@gmail.com
   ```

2. **Enable development mode:**

   ```bash
   # Enable extension
   gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com

   # Monitor logs for debugging
   journalctl /usr/bin/gnome-shell -f | grep -i pomodoro
   ```

3. **After making changes:**
   ```bash
   # Restart extension
   gnome-extensions disable pomodorotimer@markelofaleksei@gmail.com
   gnome-extensions enable pomodorotimer@markelofaleksei@gmail.com
   ```

### File Structure

```
pomodorotimer@markelofaleksei@gmail.com/
├── extension.js          # Main extension logic
├── prefs.js              # Settings UI
├── metadata.json         # Extension metadata
├── stylesheet.css        # Visual styles
├── settings.json         # Default user settings
├── schemas/              # GSettings schemas
│   └── org.gnome.shell.extensions.pomodorotimer.gschema.xml
└── README.md            # Documentation
```

### Testing

- Test all timer states: work, short break, long break
- Test pause/stop/reset functionality
- Test settings changes during timer operation
- Test GNOME Shell restart persistence
- Test on different GNOME Shell versions

## 🤝 Contributing

All improvements are welcome! To contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on your system
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Test on multiple GNOME Shell versions if possible
- Update documentation for new features
- Add comments for complex logic

## 📞 Support

If you encounter issues:

1. Check GNOME Shell logs
2. Make sure your version is compatible
3. Create an issue on GitHub describing the problem
