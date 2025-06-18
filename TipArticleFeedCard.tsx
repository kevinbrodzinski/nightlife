
import React from 'react';
import type { TipArticleFeedData } from '../../types';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';

interface TipArticleFeedCardProps {
  itemData: TipArticleFeedData;
}

export const TipArticleFeedCard: React.FC<TipArticleFeedCardProps> = ({ itemData }) => {
  const handleReadMore = () => {
    if (itemData.readMoreLink && itemData.readMoreLink !== '#') {
      window.open(itemData.readMoreLink, '_blank');
    } else {
      // Placeholder action, e.g., open a modal in the future
      alert(`Read more about: ${itemData.title} (Placeholder)`);
    }
  };

  return (
    <article className={`bg-slate-800 rounded-xl shadow-xl overflow-hidden group transition-all hover:shadow-2xl ${itemData.imageUrl ? 'flex flex-col sm:flex-row' : ''}`}>
      {itemData.imageUrl && (
        <div className="sm:w-1/3 h-40 sm:h-auto flex-shrink-0">
          <img 
            src={itemData.imageUrl} 
            alt={itemData.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
            <h3 className="text-lg font-bold text-sky-400 mb-1.5">{itemData.title}</h3>
            <p className="text-slate-300 text-sm mb-3 leading-relaxed line-clamp-3 sm:line-clamp-none">{itemData.snippet}</p>
        </div>
        <button
          onClick={handleReadMore}
          className="inline-flex items-center text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors group/cta mt-2 self-start"
        >
          Read More
          <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover/cta:translate-x-1" />
        </button>
      </div>
    </article>
  );
};
