# Job Apply Pro

A Chrome extension that streamlines your job application process by automating repetitive tasks on LinkedIn. Built with React and TypeScript using WXT (Web Extension Tools).

## Features

### Core Features
- 🚀 One-click job application automation
- 📝 Smart form auto-filling with your saved information
- 🎯 Job title filtering to focus on relevant positions
- 📊 Application history tracking
- 💼 Personal information management
- 🎨 Clean, modern UI with Tailwind CSS

### Detailed Features

#### Job Application Automation
- Automatically fills out job application forms
- Handles multiple-choice questions and text inputs
- Smart detection of form fields
- Supports "Easy Apply" applications on LinkedIn

#### Job Title Filtering
- Filter jobs based on allowed and blocked keywords
- Case-insensitive matching
- Supports partial word matching
- Automatically skips jobs with blocked titles
- Easy management through the filter settings page

#### Application History
- Tracks all submitted job applications
- Shows job titles and application timestamps
- Maintains links to applied job postings
- Stores up to 100 recent applications
- Easy access through the extension

#### Settings Management
- Save and manage personal information
- Customize job title filters
- Configure application preferences
- All settings sync across devices

## User Guide

### Getting Started

1. **Installation**
   - Install the extension from Chrome Web Store
   - Click the extension icon to open settings

2. **Initial Setup**
   - Fill in your personal information
   - Configure job title filters
   - Set your application preferences

### Using the Extension

#### Job Application
1. Navigate to a LinkedIn job posting
2. Click the "Auto Apply" button
3. Review the auto-filled information
4. Submit the application

#### Managing Filters
1. Open extension settings
2. Go to "Filter Settings"
3. Add allowed/blocked keywords
4. Save your changes

#### Viewing History
1. Open extension settings
2. Go to "Application History"
3. View all your past applications
4. Click on job links to revisit postings

## Development

### Prerequisites

- [Bun](https://bun.sh/) package manager
- Chrome browser

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/job-apply-pro.git
cd job-apply-pro
```

2. Install dependencies:
```bash
bun install
```

3. Start development server:
```bash
bun run dev
```

4. Build for production:
```bash
bun run build
```

5. Create distribution zip:
```bash
bun run zip
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `.output/chrome-mv3` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
