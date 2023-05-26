import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlayersService {
  // without database often use arrays.
  // private players: Player[] = [];

  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  async createPlayer(PlayerDto: CreatePlayerDto): Promise<Player> {
    const { email } = PlayerDto;

    // const findedPlayer = this.players.find((player) => player.email === email);

    const findedPlayer = await this.playerModel.findOne({ email }).exec();

    if (findedPlayer) {
      throw new BadRequestException(
        `Player with email: ${email} already exists`,
      );
    }
    const createdPlayer = new this.playerModel(PlayerDto);
    return await createdPlayer.save();
  }

  async updatePlayer(_id: string, PlayerDto: CreatePlayerDto): Promise<void> {
    // const findedPlayer = this.players.find((player) => player.email === email);

    const findedPlayer = await this.playerModel.findOne({ _id }).exec();

    if (!findedPlayer) {
      throw new NotFoundException(`Player with id: ${_id} not found`);
    }
    await this.playerModel
      .findOneAndUpdate({ _id }, { $set: PlayerDto })
      .exec();
  }

  async consultAllPlayers(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }

  async consultPlayerById(_id: string): Promise<Player> {
    const findedPlayer = await this.playerModel.findOne({ _id }).exec();
    if (!findedPlayer) {
      throw new NotFoundException(`Player with id: ${_id} not found`);
    } else {
      return findedPlayer;
    }
  }

  async deletePlayerById(_id: string): Promise<any> {
    return await this.playerModel.findOneAndDelete({ _id }).exec();

    // without database
    // const findedPlayer = this.players.find((player) => player.email === email);

    // this.players = this.players.filter(
    //   (player) => player.email !== findedPlayer.email,
    // );
  }

  // private async create(PlayerDto: CreatePlayerDto): Promise<Player> {
  //   const createdPlayer = new this.playerModel(PlayerDto);
  //   return await createdPlayer.save();
  // With database
  // without database.
  // const { name, email, phoneNumber } = PlayerDto;
  // const player: Player = {
  //   _id: uuidv4(),
  //   name,
  //   email,
  //   phoneNumber,
  //   ranking: 'A',
  //   rankingPosition: 20,
  //   urlPlayerPhoto: 'https://github.com/raphaelpettinato.png',
  // };
  // this.logger.log(`createPlayerDto: ${JSON.stringify(player)}`);
  // this.players.push(player);
  // }

  // private async update(PlayerDto: CreatePlayerDto): Promise<Player> {
  //   return await this.playerModel
  //   .findOneAndUpdate({ email: PlayerDto }, { $set: PlayerDto })
  //   .exec();
  // without database
  // functions returns void
  // (findedPlayer: Player, PlayerDto: CreatePlayerDto)
  // const { name } = PlayerDto;
  // findedPlayer.name = name;
  // }
}
