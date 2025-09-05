import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ImageEnum } from '../../common/enum/entity.enum';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        entityType: ImageEnum,
        entityId: string,
    ): Promise<{
        url: string;
        publicId: string;
        format: string;
        size: number;
    }> {
        try {
            const fileName = `${entityType}-${entityId}-${Date.now()}`;
            const folder = `${this.configService.get<string>('CLOUDINARY_FOLDER')}/${entityType.toLowerCase()}`;

            const result: UploadApiResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        public_id: fileName,
                        resource_type: 'auto',
                        transformation: [
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' },
                        ],
                    },
                    (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) {
                            reject(error);
                        } else if (result) {
                            resolve(result);
                        }
                    },
                );

                uploadStream.end(file.buffer);
            });

            this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);

            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
            };
        } catch (error) {
            this.logger.error('Failed to upload file to Cloudinary', error);
            throw error;
        }
    }

    async deleteFile(publicId: string): Promise<void> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result === 'ok') {
                this.logger.log(`File deleted from Cloudinary: ${publicId}`);
            } else {
                this.logger.warn(`Failed to delete file from Cloudinary: ${publicId}`);
            }
        } catch (error) {
            this.logger.error('Failed to delete file from Cloudinary', error);
            throw error;
        }
    }
}
