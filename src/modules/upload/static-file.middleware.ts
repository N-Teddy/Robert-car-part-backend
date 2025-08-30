import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';

@Injectable()
export class StaticFileMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only handle requests to /uploads/*
    if (req.path.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), req.path);

      // Check if file exists
      if (existsSync(filePath)) {
        const stat = statSync(filePath);

        // Check if it's a file (not directory)
        if (stat.isFile()) {
          // Set appropriate headers
          res.setHeader('Content-Type', this.getMimeType(filePath));
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

          // Stream the file
          const stream = createReadStream(filePath);
          stream.pipe(res);
          return;
        }
      }

      // File not found
      res.status(404).json({ message: 'File not found' });
      return;
    }

    next();
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}