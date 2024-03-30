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
  


const VideoPlayer = ({videos, title}) => {
    const [currentVideo, setCurrentVideo] = useState(0);
    

    const handlePrevClick = () => {
        setCurrentVideo((prevVideo) => (prevVideo > 0 ? prevVideo - 1 : 0));
    };

    const handleNextClick = () => {
        setCurrentVideo((prevVideo) =>
            prevVideo < videos.length - 1 ? prevVideo + 1 : prevVideo
        );
    };

    const allVideos = videos.map((video, index) => (
			<div className='all-videos' onClick={()=>{setCurrentVideo((prevVideo) =>index)} }>
                <span>{index+1}</span>
				<iframe
					key={index}
					src={video}
					width="128"
					height="96"
					allow="autoplay"
				></iframe>
			</div>
		));

    return (
			<div>
				<h2>
					{title} - {currentVideo + 1}
				</h2>

				<center>
					<iframe
						src={videos[currentVideo]}
						width="640"
						height="480"
						allow="autoplay"
					></iframe>
				</center>
				<div>
					<button onClick={handlePrevClick}>Prev</button>
					<button onClick={handleNextClick}>Next</button>
				</div>
                <Collapse title="All classes" children={allVideos}/>
			</div>
		);
};

export default VideoPlayer;