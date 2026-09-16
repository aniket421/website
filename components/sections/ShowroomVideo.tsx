'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { AssetImage } from '@/components/ui/AssetImage';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { showroomPoster, showroomVideoSrc } from '@/lib/data/assets';
import { cn } from '@/lib/utils';

export function ShowroomVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  return (
    <Section id="showroom" aria-labelledby="showroom-heading">
      <Container>
        <SectionHeading
          id="showroom-heading"
          eyebrow="Inside Elegance"
          title="Step Inside Our Showroom"
          lede="Two floors of tile, sanitaryware and fittings, displayed in full room settings under the lighting you will actually live with. Walk the aisles before you make the drive."
        />

        <div className="relative mx-auto mt-12 aspect-showroom w-full max-w-[1120px] overflow-hidden rounded-panel border border-line shadow-panel">
          {showroomVideoSrc ? (
            <>
              <video
                ref={videoRef}
                src={showroomVideoSrc}
                poster={showroomPoster.src ?? undefined}
                controls={playing}
                playsInline
                preload="none"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="h-full w-full bg-ink object-cover"
              >
                <track kind="captions" />
              </video>

              <button
                type="button"
                onClick={play}
                hidden={playing}
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-[linear-gradient(to_bottom,rgba(26,26,26,0.1),rgba(26,26,26,0.35))]',
                )}
              >
                <span className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface shadow-panel transition-transform duration-200 ease-subtle hover:scale-105">
                  <Play
                    aria-hidden="true"
                    className="ml-1 h-7 w-7 fill-ink text-ink"
                  />
                </span>
                <span className="sr-only">Play the showroom walkthrough</span>
              </button>
            </>
          ) : (
            /*
             * TODO: supply public/assets/showroom/walkthrough.mp4 (16:8.4, H.264).
             * Until it exists the frame holds the poster alone — a play button
             * with nothing behind it is a dead control, and a dead control is an
             * accessibility failure as well as a broken promise.
             */
            <AssetImage asset={showroomPoster} fill sizes="(max-width: 1120px) 100vw, 1120px" />
          )}
        </div>
      </Container>
    </Section>
  );
}
