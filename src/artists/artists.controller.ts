import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { Roles } from '../permit/roles.decorator';
import { PermitGuard } from '../permit/permit.guard';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getALl() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.artistModel.find({ _id: id });
    if (!artist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }
    return artist;
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './public/images' }))
  async create(
    @Body() artistDto: CreateArtistDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.artistModel.create({
      name: artistDto.name,
      image: file ? 'images/' + file.filename : null,
      information: artistDto.information,
    });
  }

  @UseGuards(TokenAuthGuard, PermitGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedArtist = await this.artistModel.findByIdAndDelete(id);

    if (!deletedArtist) {
      throw new NotFoundException(`Artist with id ${id} not found`);
    }

    return 'Artist deleted successfully';
  }
}
