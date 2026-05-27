import React, { useState } from 'react';
const Collapse = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleCollapse = () => setIsOpen(!isOpen);
  
    return (
      <div className="collapse">
        <button className="collapse-header" onClick={toggleCollapse}>
          {title}
        </button>
        {isOpen && <div className="collapse-content">{children}</div>}
      </div>
    );
  };
  


const VideoPlayer = ({ videos, title }) => {
  const [currentVideo, setCurrentVideo] = useState(0)

  if (!videos || videos.length === 0) {
    return <p>No hay videos disponibles en este curso.</p>
  }

  const normalizedVideos = videos.map((video, index) => {
    if (typeof video === 'string') {
      return {
        id: index,
        title: `Clase ${index + 1}`,
        src: video,
        kind: video.includes('drive.google.com') ? 'drive' : 'video',
        duration: null,
      }
    }

    return {
      id: video.id ?? index,
      title: video.title || `Clase ${index + 1}`,
      src: video.src,
      kind: video.kind || (video.src && video.src.startsWith('blob:') ? 'video' : 'drive'),
      duration: video.duration ?? null,
      note: video.note || null,
    }
  })

  const handlePrevClick = () => {
    setCurrentVideo((prevVideo) => (prevVideo > 0 ? prevVideo - 1 : 0))
  }

  const handleNextClick = () => {
    setCurrentVideo((prevVideo) =>
      prevVideo < normalizedVideos.length - 1 ? prevVideo + 1 : prevVideo
    )
  }

  const activeVideo = normalizedVideos[currentVideo]
  const needsImport = activeVideo.kind === 'video' && !activeVideo.src

  const allVideos = normalizedVideos.map((video, index) => (
    <div
      className="all-videos"
      key={video.id}
      onClick={() => {
        setCurrentVideo(index)
      }}
    >
      <span>{index + 1}</span>
      {video.kind === 'drive' ? (
				<iframe
          src={video.src}
          width="160"
          height="110"
          title={video.title}
					allow="autoplay"
				></iframe>
      ) : video.src ? (
        <video src={video.src} width="160" height="110" preload="metadata"></video>
      ) : (
        <div className="video-placeholder">Sin archivo</div>
      )}
      <div className="video-meta">
        <div className="video-title">{video.title}</div>
        {video.duration ? (
          <div className="video-duration">{video.duration}</div>
        ) : null}
			</div>
    </div>
  ))

  return (
    <div className="player">
      <h2>
        {title} - {currentVideo + 1}
      </h2>
      <p className="player-title">{activeVideo.title}</p>

      <div className="player-frame">
        {needsImport ? (
          <div className="video-placeholder large">Reimporta la carpeta para reproducir.</div>
        ) : activeVideo.kind === 'drive' ? (
					<iframe
              src={activeVideo.src}
              width="720"
              height="420"
              title={activeVideo.title}
						allow="autoplay"
					></iframe>
        ) : (
          <video src={activeVideo.src} width="720" height="420" controls></video>
        )}
      </div>
      {activeVideo.note ? <p className="video-note">{activeVideo.note}</p> : null}
      <div className="player-actions">
        <button onClick={handlePrevClick}>Prev</button>
        <button onClick={handleNextClick}>Next</button>
      </div>
      <Collapse title="All classes" children={allVideos} />
    </div>
  )
}

export default VideoPlayer;