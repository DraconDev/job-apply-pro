# LinkedIn Job Application Handler

This directory contains modules for handling LinkedIn job applications in a modular, maintainable way.

## Directory Structure

```
linkedin/
├── forms/               # Form handling functionality
│   ├── domUtils.ts     # DOM manipulation utilities for forms
│   └── handlers.ts     # Form input/output handlers
├── jobs/               # Job application process
│   └── autoApply.ts    # Main auto-apply loop implementation
├── navigation/         # Page navigation utilities
│   ├── modals.ts      # Modal dialog handling
│   └── scrolling.ts    # Page scrolling and element waiting
├── state/             # Application state management
│   ├── applicationState.ts  # Auto-apply process state
│   └── jobHistory.ts   # Job application history tracking
├── index.ts           # Main handler entry point
├── types.ts           # Shared type definitions
└── README.md          # This documentation file
```

## Module Responsibilities

### forms/
- **domUtils.ts**: Utilities for finding and interacting with form elements in the DOM
- **handlers.ts**: Functions for saving and filling form inputs, managing form state

### jobs/
- **autoApply.ts**: Core auto-apply implementation with step-by-step application process

### navigation/
- **modals.ts**: Functions for handling LinkedIn's modal dialogs (close, cancel, etc.)
- **scrolling.ts**: Page navigation helpers including infinite scroll and element waiting

### state/
- **applicationState.ts**: Manages the auto-apply process state (running/paused/stopped)
- **jobHistory.ts**: Tracks which jobs have been applied to and filters job listings

## Main Entry Point

The `index.ts` file exports the `LinkedInHandler` implementing the `JobSiteHandler` interface, which provides:
- Job page detection and validation
- Job details extraction from the page
- Auto-apply process initiation

## Using the Handler

```typescript
import LinkedInHandler from '@/src/sites/linkedin';

// Check if we're on a job page
if (LinkedInHandler.isValidJobPage()) {
  // Get job details
  const jobDetails = LinkedInHandler.getJobDetails();
  
  // Start application process
  await LinkedInHandler.applyToJob();
}
