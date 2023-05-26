import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { Challenge } from './interfaces/challenge.interface';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { SetChallengeMatchDto } from './dtos/set-match-challenge.dto';

@Controller('api/v1/challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  private readonly logger = new Logger(ChallengeController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(
    @Body() challengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    this.logger.log(`createChallengeDto: ${JSON.stringify(challengeDto)}`);
    return await this.challengeService.createChallenge(challengeDto);
  }

  @Get()
  async consultChallenges(
    @Query('playerId') _id: string,
  ): Promise<Array<Challenge>> {
    return _id
      ? await this.challengeService.consultChallengeOfOnePlayer(_id)
      : await this.challengeService.consultAllChallenges();
  }

  @Put('/:challenge')
  async updateChallenge(
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    await this.challengeService.updateChallenge(_id, updateChallengeDto);
  }

  @Post('/:challenge/match/')
  async setChallengeMatch(
    @Body(ValidationPipe) setChallengeMatchDto: SetChallengeMatchDto,
    @Param('challenge') _id: string,
  ): Promise<void> {
    return await this.challengeService.setChallengeMatch(
      _id,
      setChallengeMatchDto,
    );
  }

  @Delete('/:id')
  async deleteChallenge(@Param('_id') _id: string): Promise<void> {
    await this.challengeService.deleteChallenge(_id);
  }
}
