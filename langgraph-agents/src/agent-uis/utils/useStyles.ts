import { useRef, useLayoutEffect } from 'react';

export const useStyles = (styleId: string, cssContent: string) => {
  const divRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (divRef.current && !divRef.current.querySelector(`#${styleId}`)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = cssContent;
      divRef.current.appendChild(style);
    }
  }, [styleId, cssContent]);

  return divRef;
};

export const TRIP_DESTINATION_STYLES = `
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
  @import url('https://mdbcdn.b-cdn.net/wp-content/themes/mdbootstrap4/docs-app/css/dist/mdb5/standard/core.min.css');
  
  /* Carousel styles for chat interface */
  #destinationsCarousel {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      width: 100%;
      position: relative;
  }
  #destinationsCarousel .carousel-item {
      position: relative;
      padding: 10px;
      max-height: 300px;
      overflow: hidden;
  }
  #destinationsCarousel .carousel-item .d-flex {
      gap: 16px;
      overflow-x: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
  }
  #destinationsCarousel .d-flex::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
  }
  #destinationsCarousel .destination-card {
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      width: 180px;
      min-height: 240px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
  }
  #destinationsCarousel .destination-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  #destinationsCarousel .carousel-item img {
      border-radius: 8px;
      width: 100%;
      height: 120px;
      object-fit: cover;
      flex-shrink: 0;
  }
  #destinationsCarousel .destination-info {
      padding: 5px 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
  }
  #destinationsCarousel .destination-info h6 {
      margin: 0;
      font-weight: 600;
      color: #333;
      font-size: 1rem;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  }
  #destinationsCarousel .destination-info p {
      margin: 0;
      line-height: 1.1;
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
  }
  /* Custom scroll arrows */
  .scroll-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      max-height: 180px;
  }
  .scroll-arrow:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transform: translateY(-50%) scale(1.1);
  }
  .scroll-left {
      left: 8px;
  }
  .scroll-right {
      right: 8px;
  }

  .scroll-arrow i {
      color: #333;
      font-size: 14px;
  }
`;
