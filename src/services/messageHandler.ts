import { LinkedInAutoApplyService } from "./linkedInAutoApply";
import { LinkedInHandler } from "../sites/linkedin/LinkedInHandler";

export class MessageHandler {
  private autoApplyService: LinkedInAutoApplyService;

  constructor() {
    this.autoApplyService = new LinkedInAutoApplyService(new LinkedInHandler());
  }

  handleMessage(message: any) {
    switch (message.type) {
      case "START_AUTO_APPLY":
        this.autoApplyService.startAutoApplying();
        break;
      case "STOP_AUTO_APPLY":
        this.autoApplyService.stopAutoApplying();
        break;
    }
  }
}
