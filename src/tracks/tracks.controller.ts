import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { CreateTrackDto } from './create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  async getAll(
    @Query('albumId') albumId: string,
    @Query('artistId') artistId: string,
  ) {
    let query = {};

    if (albumId) {
      query = { album: albumId };
    } else if (artistId) {
      const albums = await this.albumModel
        .find({ artist: artistId })
        .select('_id');
      const albumIds = albums.map((album) => album._id);
      query = { album: { $in: albumIds } };
    }

    return await this.trackModel.find(query);
  }

  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    const tracksInAlbum = await this.trackModel.countDocuments({
      album: trackDto.album,
    });

    return await this.trackModel.create({
      album: trackDto.album,
      title: trackDto.title,
      duration: trackDto.duration,
      number: tracksInAlbum + 1,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedTrack = await this.trackModel.findByIdAndDelete(id);

    if (!deletedTrack) {
      throw new NotFoundException(`Track with id ${id} not found`);
    }

    return 'Track deleted successfully';
  }
}
