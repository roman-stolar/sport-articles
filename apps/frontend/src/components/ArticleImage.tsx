'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Box, Typography, CircularProgress, Skeleton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

interface ArticleImageProps {
  src: string | null | undefined;
  alt: string;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export function ArticleImage({
  src,
  alt,
  height = 200,
  fill,
  priority,
}: ArticleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || imageError) {
    return (
      <Box
        sx={{
          height: fill ? '100%' : height,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        <Typography variant="caption" color="text.secondary">
          No image
        </Typography>
      </Box>
    );
  }

  if (fill) {
    return (
      <Box sx={{ position: 'relative', height: '100%', bgcolor: 'grey.200' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          style={{ 
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
          sizes="100vw"
          priority={priority}
          onError={() => setImageError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height, bgcolor: 'grey.200' }}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ 
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </Box>
  );
}
