<div align="center">

# 🚀 LinkedIn Auto Apply Pro

A Chrome extension that automates LinkedIn job applications with smart form filling and filtering capabilities. Built with React, TypeScript, and WXT.

[Features](#key-features) • [Technical Stack](#technical-stack) • [Getting Started](#getting-started) • [Usage Guide](#usage-guide) • [Privacy & Security](#privacy--security)

---

</div>

## ✨ Key Features

- 🤖 **Smart Auto Apply**: Automatically applies to LinkedIn jobs with intelligent form detection and filling
- 📝 **Form Memory**: Remembers your previous form inputs for faster applications
- 🎯 **Job Title Filtering**: Customize which job titles to apply for or skip
- 📊 **Application History**: Track all your submitted applications
- ⏯️ **Pause/Resume**: Full control over the automation process
- 🔄 **Cloud Sync**: Your settings and history sync across devices

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript
- **Build Tool**: WXT (Web Extension Tools)
- **Storage**: Chrome Storage Sync API
- **Styling**: Tailwind CSS
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) package manager
- Chrome browser

### Development Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/DraconDev/job-apply-pro.git
cd job-apply-pro
bun install
```

2. Start development server:
```bash
bun run dev
```

3. Load the extension in Chrome:
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `.output/chrome-mv3` directory

## 📖 Usage Guide

1. **Initial Setup**
   - Install the extension
   - Open LinkedIn Jobs
   - Configure your job preferences in extension settings

2. **Auto Apply**
   - Navigate to LinkedIn Jobs
   - Click the extension icon
   - Press "Start Auto Apply"
   - The extension will automatically:
     - Filter jobs based on your preferences
     - Fill application forms
     - Track application history

3. **Managing Applications**
   - Use the history page to track progress
   - Filter jobs by title to focus on relevant positions
   - Pause/Resume anytime during the process

## 🔒 Privacy & Security

- Only requires necessary LinkedIn host permissions
- All data stored securely in Chrome's sync storage
- No external data collection or sharing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

<div align="center">

---

Made with ❤️ by the Job Apply Pro Team

</div>
