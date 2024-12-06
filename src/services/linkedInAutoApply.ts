import { LinkedInHandler } from '../sites/linkedin/LinkedInHandler';

export const clickEasyApply = (): boolean => {
  const easyApplyButton = document.querySelector('.jobs-apply-button') as HTMLButtonElement;
  if (easyApplyButton && easyApplyButton.textContent?.includes('Easy Apply')) {
    easyApplyButton.click();
    return true;
  }
  return false;
};

export const fillForm = async (): Promise<void> => {
  // Wait for form to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Fill form fields if needed
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (!(input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value) {
      // TODO: Add logic to fill specific fields based on their labels/types
    }
  });

  // Click next/submit button
  const submitButton = document.querySelector('[aria-label="Submit application"]');
  const nextButton = document.querySelector('[aria-label="Continue to next step"]');
  
  if (submitButton) {
    (submitButton as HTMLButtonElement).click();
  } else if (nextButton) {
    (nextButton as HTMLButtonElement).click();
  }
};

export const moveToNextJob = (): void => {
  const nextButton = document.querySelector('[aria-label="Next"]');
  if (nextButton) {
    (nextButton as HTMLButtonElement).click();
  }
};

export class LinkedInAutoApplyService {
  private isAutoApplying: boolean = false;
  private intervalId: number | null = null;

  constructor(private handler: LinkedInHandler) {}

  startAutoApplying(): void {
    this.isAutoApplying = true;
    
    // Try to apply every 5 seconds
    this.intervalId = window.setInterval(async () => {
      if (this.handler.isValidJobPage()) {
        await this.handler.applyToJob();
      } else {
        this.moveToNextJob();
      }
    }, 5000);
  }

  stopAutoApplying(): void {
    this.isAutoApplying = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private moveToNextJob(): void {
    const nextButton = document.querySelector('[aria-label="Next"]');
    if (nextButton) {
      (nextButton as HTMLButtonElement).click();
    }
  }

  isRunning(): boolean {
    return this.isAutoApplying;
  }
}
