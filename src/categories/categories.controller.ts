import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './interfaces/category.interface';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createCategory(
    @Body() categoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.createCategory(categoryDto);
  }

  @Get()
  async consultCategories(): Promise<Array<Category>> {
    return await this.categoriesService.consultAllCategories();
  }

  @Get('/:category')
  async consultCategoryById(
    @Param('category') category: string,
  ): Promise<Category> {
    return await this.categoriesService.consultCategoryById(category);
  }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  async updateCategory(
    @Body() categoryDto: UpdateCategoryDto,
    @Param('Category') category: string,
  ): Promise<void> {
    await this.categoriesService.updateCategory(category, categoryDto);
  }

  @Post('/:category/players/:playerId')
  async setPlayerCategory(@Param() params: string[]): Promise<void> {
    return await this.categoriesService.setPlayerCategory(params);
  }
}
