import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { Challenge, Match } from './interfaces/challenge.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { SetChallengeMatchDto } from './dtos/set-match-challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private readonly logger = new Logger(ChallengeService.name);

  async createChallenge(challengeDto: CreateChallengeDto): Promise<Challenge> {
    const players = await this.playersService.consultAllPlayers();

    challengeDto.players.map((playerDto) => {
      const playerFilter = players.filter((player) => {
        player._id == playerDto._id;
      });

      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `The informed ID ${playerDto._id} is not a player!`,
        );
      }
    });

    const requesterIsPlayerOfTheMatch = await challengeDto.players.filter(
      (player) => player._id == String(challengeDto.requester),
    );

    this.logger.log(`${requesterIsPlayerOfTheMatch}`);

    if (requesterIsPlayerOfTheMatch.length == 0) {
      throw new BadRequestException(
        `The requester must be a player of the match`,
      );
    }

    const playerCategory = await this.categoriesService.consultCategoryById(
      String(challengeDto.requester),
    );

    if (!playerCategory) {
      throw new BadRequestException(
        `The requester need to be registered in a category`,
      );
    }

    const createdChallenge = new this.challengeModel(challengeDto);
    createdChallenge.category = playerCategory.category;
    createdChallenge.dateHourRequest = new Date();

    createdChallenge.status = ChallengeStatus.PENDING;
    this.logger.log(`Challenge created: ${JSON.stringify(createdChallenge)}`);
    return await createdChallenge.save();
  }

  async consultAllChallenges(): Promise<Array<Challenge>> {
    return await this.challengeModel
      .find()
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async consultChallengeOfOnePlayer(_id: any): Promise<Array<Challenge>> {
    const players = await this.playersService.consultAllPlayers();

    const playersFilter = players.filter((player) => player._id == _id);

    if (playersFilter.length == 0) {
      throw new BadRequestException(`The id ${_id} is not a player`);
    }

    return await this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('requester')
      .populate('players')
      .populate('match')
      .exec();
  }

  async updateChallenge(
    _id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<void> {
    const findedChallenge = await this.challengeModel.findById(_id).exec();

    if (!findedChallenge) {
      throw new NotFoundException(`Challenge ${_id} not found`);
    }

    if (updateChallengeDto.status) {
      findedChallenge.dateHourAnswer = new Date();
    }

    findedChallenge.status = updateChallengeDto.status;
    findedChallenge.dateHourChallenge = updateChallengeDto.dateHourChallenge;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: findedChallenge })
      .exec();
  }

  async setChallengeMatch(
    _id: string,
    setChallengeMatchDto: SetChallengeMatchDto,
  ): Promise<void> {
    const findedChallenge = await this.challengeModel.findById(_id).exec();

    if (!findedChallenge) {
      throw new BadRequestException(`Challenge not found`);
    }

    const playerFilter = findedChallenge.players.filter(
      (player) => player._id == String(setChallengeMatchDto.def),
    );

    this.logger.log(`findedChallenge ${findedChallenge}`);
    this.logger.log(`playerFilter: ${playerFilter}`);

    if (playerFilter.length == 0) {
      throw new BadRequestException(
        `The winner player does not make part of the match!`,
      );
    }

    const createdMatch = new this.matchModel(setChallengeMatchDto);

    createdMatch.category = findedChallenge.category;

    createdMatch.players = findedChallenge.players;

    const result = await createdMatch.save();

    findedChallenge.status = ChallengeStatus.ACCOMPLISHED;

    findedChallenge.match = result._id;

    try {
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: findedChallenge })
        .exec();
    } catch (error) {
      await this.matchModel.deleteOne({ _id: result._id }).exec();
      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(_id: string): Promise<void> {
    const findedChallenge = await this.challengeModel.findById(_id).exec();

    if (!findedChallenge) {
      throw new BadRequestException(`Challenge ${_id} not registered`);
    }

    findedChallenge.status = ChallengeStatus.CANCELED;

    await this.challengeModel
      .findOneAndUpdate({ _id }, { $set: findedChallenge })
      .exec();
  }
}
