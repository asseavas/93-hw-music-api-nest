import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { Roles } from '../permit/roles.decorator';
import { PermitGuard } from '../permit/permit.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  async getALl(@Query('artistId') artistId: string) {
    const query = artistId ? { artist: artistId } : {};
    return await this.albumModel.find(query).sort({ releaseYear: -1 });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const album = await this.albumModel.find({ _id: id });
    if (!album) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }
    return album;
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './public/images' }))
  async create(
    @Body() albumDto: CreateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.albumModel.create({
      artist: albumDto.artist,
      title: albumDto.title,
      releaseYear: albumDto.releaseYear,
      image: file ? 'images/' + file.filename : null,
    });
  }

  @UseGuards(TokenAuthGuard)
  @UseGuards(PermitGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedAlbum = await this.albumModel.findByIdAndDelete(id);

    if (!deletedAlbum) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }

    return 'Album deleted successfully';
  }
}
