import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { PlayersService } from './players.service';
import { Player } from './interfaces/player.interface';
import { ValidationPipeParameters } from 'src/common/pipes/validation-parameters.pipe';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(@Body() PlayerDto: CreatePlayerDto): Promise<Player> {
    return await this.playersService.createPlayer(PlayerDto);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() PlayerDto: CreatePlayerDto,
    @Param('_id', ValidationPipeParameters) _id: string,
  ): Promise<void> {
    await this.playersService.updatePlayer(_id, PlayerDto);
  }

  @Get()
  async consultAllPlayers(): Promise<Player[]> {
    return await this.playersService.consultAllPlayers();
  }

  @Get('/:_id')
  async consultPlayerById(@Param('_id') _id: string): Promise<Player> {
    return await this.playersService.consultPlayerById(_id);
  }

  @Delete('/:_id')
  async deletePlayer(
    @Param('_id', ValidationPipeParameters) _id: string,
  ): Promise<void> {
    this.playersService.deletePlayerById(_id);
  }
}
