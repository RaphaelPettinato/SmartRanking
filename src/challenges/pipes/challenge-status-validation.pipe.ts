import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [
    ChallengeStatus.ACCEPTED,
    ChallengeStatus.DENIED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: any) {
    const status = value.status.toUpperCase();

    if (!this.isValidStatus(status)) {
      throw new BadRequestException(`${status} is a invalid status`);
    }

    return value;
  }

  private isValidStatus(status: any) {
    const idx = this.allowedStatus.indexOf(status);
    return idx !== -1;
  }
}
