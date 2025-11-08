import React from 'react';
import { VideoCategory, Video } from '../types';
import { MOCK_HOME_VIDEOS } from '../constants';
import { PlayIcon } from './Icons';

interface VideoCardProps {
  video: Video;
}
const VideoCard: React.FC<VideoCardProps> = ({ video }) => (
  <div className="flex-shrink-0 w-64 md:w-72 mr-4 group cursor-pointer">
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
        <PlayIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" />
      </div>
      <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
    </div>
    <h4 className="mt-2 font-semibold truncate text-text-primary">{video.title}</h4>
  </div>
);

interface VideoCarouselProps {
  category: VideoCategory;
}
const VideoCarousel: React.FC<VideoCarouselProps> = ({ category }) => (
  <div className="space-y-3">
    <h3 className="text-xl font-bold text-text-primary">{category.title}</h3>
    {/* Fix: Use camelCase 'msOverflowStyle' for CSS property in React style object. */}
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
      {category.videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  </div>
);

export const Home: React.FC = () => {
  const featuredVideo = MOCK_HOME_VIDEOS[0].videos[0];

  return (
    <div className="space-y-8">
      {/* Featured Section */}
      <div className="relative h-64 md:h-80 w-full">
        <img src={featuredVideo.thumbnailUrl.replace('/400/225', '/1200/400')} alt={featuredVideo.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">{featuredVideo.title}</h2>
          <p className="text-text-secondary max-w-lg mt-2">Comece o desafio de 30 dias para fortalecer seu core e definir o abdômen.</p>
          <button className="mt-4 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors flex items-center">
            <PlayIcon className="w-6 h-6 mr-2" />
            Começar Agora
          </button>
        </div>
      </div>
      
      {/* Carousels */}
      <div className="p-4 space-y-8">
        {MOCK_HOME_VIDEOS.map((category, index) => (
          <VideoCarousel key={index} category={category} />
        ))}
      </div>
    </div>
  );
};