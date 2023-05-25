import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
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
    return await this.categoryModel.find().exec();
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
}
