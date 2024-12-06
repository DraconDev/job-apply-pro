import { defineContentScript } from 'wxt/sandbox';
import { LinkedInAutoApplyService } from '../src/services/linkedInAutoApply';
import { LinkedInHandler } from '../src/sites/linkedin/LinkedInHandler';

const autoApplyService = new LinkedInAutoApplyService(new LinkedInHandler());

export default defineContentScript({
  matches: ['*://*.linkedin.com/jobs/*'],
  main() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'START_AUTO_APPLY') {
        autoApplyService.startAutoApplying();
      } else if (message.type === 'STOP_AUTO_APPLY') {
        autoApplyService.stopAutoApplying();
      }
    });
  }
});
