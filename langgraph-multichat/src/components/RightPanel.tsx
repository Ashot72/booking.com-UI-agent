import { useArtifact, ArtifactTitle, useArtifactOpen, ArtifactContent } from '@/components/artifact';

const RightPanel: React.FC = () => {
  const [artifactOpen, closeArtifact] = useArtifactOpen();

  // Only render when an artifact is open, otherwise return null
  if (!artifactOpen) {
    return null;
  }

  return (
    <div 
      className="position-fixed top-0 end-0 h-100 bg-white shadow-lg" 
      style={{ 
        width: '350px', 
        zIndex: 1050,
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        right: '0'
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <ArtifactTitle className="mb-0 text-center flex-grow-1" />                
        <button 
          className="btn-close" 
          onClick={closeArtifact}
        ></button>
      </div>
      <ArtifactContent className="mb-3" />
    </div>
  );
};

export default RightPanel;
