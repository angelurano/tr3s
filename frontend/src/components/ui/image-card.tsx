import { cn } from '@/lib/utils';

type Props = {
  imageUrl: string;
  caption: string;
  className?: string;
};

export default function ImageCard({ imageUrl, caption, className }: Props) {
  return (
    <figure
      className={cn(
        'rounded-base border-border bg-main font-base shadow-shadow w-[250px] overflow-hidden border-2',
        className
      )}
    >
      <img className='aspect-4/3 w-full' src={imageUrl} alt='image' />
      <figcaption className='text-main-foreground border-border border-t-2 p-4'>
        {caption}
      </figcaption>
    </figure>
  );
}
