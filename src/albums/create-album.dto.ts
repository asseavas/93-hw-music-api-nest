import { IdExists } from '../global/validators/id-exists.validator';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAlbumDto {
  @IsMongoId()
  @IdExists('artist')
  artist: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  releaseYear: number;
}
