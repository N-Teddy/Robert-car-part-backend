import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadImageDto, UploadMultipleImagesDto } from '../../dto/request/upload.dto';
import { UploadedImageResponseDto, MultipleUploadResponseDto } from '../../dto/response/upload.dto';
import { Express } from 'express';

@ApiTags('Upload')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: ['USER-PROFILE', 'VEHICLE', 'PART', 'QR-CODE', 'CATEGORY'],
        },
        entityId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadedImageResponseDto,
  })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
    @Req() req: any,
  ): Promise<UploadedImageResponseDto> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      return await this.uploadService.uploadSingleImage(
        file,
        uploadDto.entityType,
        uploadDto.entityId,
        req.user.id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        entityType: {
          type: 'string',
          enum: ['USER-PROFILE', 'VEHICLE', 'PART', 'QR-CODE', 'CATEGORY'],
        },
        entityId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    type: MultipleUploadResponseDto,
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadMultipleImagesDto,
    @Req() req: any,
  ): Promise<MultipleUploadResponseDto> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      return await this.uploadService.uploadMultipleImages(
        files,
        uploadDto.entityType,
        uploadDto.entityId,
        req.user.id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiResponse({
    status: 200,
    description: 'Image retrieved successfully',
    type: UploadedImageResponseDto,
  })
  async getImage(@Param('id') id: string): Promise<UploadedImageResponseDto> {
    try {
      return await this.uploadService.getImageById(id);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image by ID' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  async deleteImage(@Param('id') id: string): Promise<void> {
    try {
      await this.uploadService.deleteImage(id);
    } catch (error) {
      throw error;
    }
  }
}
