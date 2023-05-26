import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async createCategory(categoryDto: CreateCategoryDto): Promise<Category> {
    const { category } = categoryDto;

    const findedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (findedCategory) {
      throw new BadRequestException(`Category: ${category} already exists`);
    }

    const createdCategory = new this.categoryModel(categoryDto);
    return await createdCategory.save();
  }

  async consultAllCategories(): Promise<Array<Category>> {
    return await this.categoryModel.find().populate('players').exec();
  }

  async consultCategoryById(category: string): Promise<Category> {
    const findedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (!findedCategory) {
      throw new NotFoundException(`Category: ${category} does not exists.`);
    }

    return findedCategory;
  }

  async updateCategory(
    category: string,
    categoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const findedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    if (!findedCategory) {
      throw new NotFoundException(
        `Informed category: ${category} does not exist`,
      );
    }

    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: categoryDto })
      .exec();
  }

  async setPlayerCategory(params: string[]): Promise<void> {
    const category = params['category'];
    const playerId = params['playerId'];

    const findedCategory = await this.categoryModel
      .findOne({ category })
      .exec();

    const playerAlreadyOnCategory = await this.categoryModel
      .find({ category })
      .where('players')
      .in(playerId)
      .exec();

    await this.playersService.consultPlayerById(playerId);

    if (!findedCategory) {
      throw new BadRequestException(`category not found`);
    }

    if (playerAlreadyOnCategory.length > 0) {
      throw new BadRequestException(
        `Player ${playerId} already registered on category ${category}`,
      );
    }

    findedCategory.players.push(playerId);
    await this.categoryModel
      .findOneAndUpdate({ category }, { $set: findedCategory })
      .exec();
  }
}
