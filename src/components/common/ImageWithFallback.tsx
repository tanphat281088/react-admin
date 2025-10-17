import { Image } from 'antd';

export default function ImageWithFallback({
  src, alt, width = 64, height = 64,
}: {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const fallback = 'https://via.placeholder.com/64?text=IMG';
  return (
    <Image
      width={width}
      height={height}
      src={src || fallback}
      alt={alt}
      fallback={fallback}
      style={{ objectFit: 'cover', borderRadius: 8 }}
      preview={false}
    />
  );
}
