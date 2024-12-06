import { JobDetails, JobSiteHandler } from '../../common/types';

export class LinkedInHandler implements JobSiteHandler {
  name = 'LinkedIn';

  isValidJobPage(): boolean {
    return window.location.href.includes('linkedin.com/jobs/') &&
           !!document.querySelector('.jobs-unified-top-card__job-title');
  }

  getJobDetails(): JobDetails | null {
    if (!this.isValidJobPage()) return null;

    const title = document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim() || '';
    const company = document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim() || '';
    const location = document.querySelector('.jobs-unified-top-card__bullet')?.textContent?.trim();
    
    return {
      title,
      company,
      location,
      url: window.location.href
    };
  }

  async applyToJob(): Promise<boolean> {
    const applyButton = document.querySelector('.jobs-apply-button') as HTMLButtonElement;
    if (!applyButton) return false;

    try {
      applyButton.click();
      // TODO: Handle the application form filling
      return true;
    } catch (error) {
      console.error('Failed to apply:', error);
      return false;
    }
  }
}
