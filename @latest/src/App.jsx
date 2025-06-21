import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Share, IndianRupee, MoreVertical, Home, Play, Search, User, Plus, Volume2, VolumeX, Maximize, Minimize, Pause } from 'lucide-react';

// Mock data with single video URL
const mockVideos = [
  {
    id: 1,
    videoUrl: "https://res.cloudinary.com/da2wrgabu/video/upload/v1750515943/videoplayback_2_upeiwv.mp4",
    title: "Amazing Startup Journey",
    description: "This is an incredible story about how we built our startup from scratch. The journey was filled with challenges and victories that shaped us.",
    userName: "Rajesh Kumar",
    userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    likes: 200000,
    comments: 1300,
    shares: 456,
    earnings: 2100,
    hashtag: "#StartupIndia",
    episode: "EP 1",
    isPaid: false,
    isFollowing: false
  },
  {
    id: 2,
    videoUrl: "https://res.cloudinary.com/da2wrgabu/video/upload/v1750515942/videoplayback_1_t5xpsc.mp4",
    title: "Tech Innovation Hub",
    description: "Exploring the latest technology trends and innovations that are changing the world. From AI to blockchain, everything covered here.",
    userName: "Harshii",
    userImage: "https://images.unsplash.com/photo-1494790108755-2616b5a4523e?w=100&h=100&fit=crop&crop=face",
    likes: 150000,
    comments: 890,
    shares: 234,
    earnings: 1800,
    hashtag: "#TechInnovation",
    episode: "EP 2",
    isPaid: true,
    isFollowing: true
  },
  {
    id: 3,
    videoUrl: "https://res.cloudinary.com/da2wrgabu/video/upload/v1750515942/videoplayback_eluxj4.mp4",
    title: "Entrepreneurship 101",
    description: "Learn the fundamentals of entrepreneurship and how to build a successful business from the ground up with practical tips.",
    userName: "Bhargav Patel",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    likes: 89000,
    comments: 567,
    shares: 123,
    earnings: 950,
    hashtag: "#Entrepreneur",
    episode: "EP 3",
    isPaid: false,
    isFollowing: false
  }
];

// Video Card Component
const VideoCard = React.memo(({ video, isActive, onFollowToggle, onLikeToggle }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(video.likes);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const handleVideoClick = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
    
    // Show controls temporarily
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => setShowControls(false), 3000);
    setControlsTimeout(timeout);
  }, [isPlaying, controlsTimeout]);

  const handleMuteToggle = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(false);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(true);
      });
    }
  }, []);

  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
    setTimeout(() => {
      if (Math.random() > 0.1) {
        onLikeToggle(video.id, newLikedState);
      } else {
        setIsLiked(!newLikedState);
        setLocalLikes(prev => newLikedState ? prev - 1 : prev + 1);
      }
    }, 500);
  }, [isLiked, video.id, onLikeToggle]);

  const handleFollow = useCallback(() => {
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    onFollowToggle(video.id, newFollowState);
  }, [isFollowing, video.id, onFollowToggle]);

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full  cursor-pointer"
        src={video.videoUrl}
        muted={isMuted}
        loop
        playsInline
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        poster={video.userImage} // Add poster to prevent blank screen
      />
      
      {/* Play/Pause overlay - Fixed to show properly */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-90" fill="white" />
          </div>
        </div>
      )}

      {/* Top controls - Only mute button */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-2">
        <button
          onClick={handleMuteToggle}
          className="p-1.5 sm:p-2 bg-black bg-opacity-50 rounded-full"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          )}
        </button>
      </div>

      {/* Video progress bar */}
      <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 right-16 sm:right-20">
        <div className="flex items-center space-x-2 text-white text-xs">
          <span className="hidden sm:inline">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="hidden sm:inline">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Left side content */}
      <div className="absolute bottom-24 sm:bottom-32 left-2 sm:left-4 right-16 sm:right-20 text-white">
        <div className="mb-1 sm:mb-2">
          <span className="text-yellow-400 font-semibold text-sm sm:text-base">{video.hashtag}</span>
        </div>
        
        <div className="flex items-center mb-1 sm:mb-2">
          <img
            src={video.userImage}
            alt={video.userName}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3"
          />
          <span className="font-semibold mr-2 sm:mr-3 text-sm sm:text-base">{video.userName}</span>
          <button
            onClick={handleFollow}
            className={`px-2 sm:px-4 py-1 rounded-full border text-xs font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-600 border-gray-600 text-white'
                : 'bg-transparent border-white text-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <div className="mb-1 sm:mb-2">
          <span className="font-bold text-sm sm:text-base">{video.title}</span>
          <span className="ml-2 bg-yellow-500 text-black text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">{video.episode}</span>
        </div>

        <p className="text-xs sm:text-sm opacity-90 line-clamp-2 sm:line-clamp-3">
          {video.description}
        </p>
      </div>

      {/* Right side actions */}
      <div className="absolute bottom-24 sm:bottom-32 right-2 sm:right-4 flex flex-col items-center space-y-3 sm:space-y-6">
        <button
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <Heart
            className={`w-6 h-6 sm:w-8 sm:h-8 mb-1 transition-colors ${
              isLiked ? 'text-yellow-400 fill-yellow-400' : 'text-white'
            }`}
          />
          <span className="text-white text-xs">{formatCount(localLikes)}</span>
        </button>

        <button className="flex flex-col items-center">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-1" />
          <span className="text-white text-xs">{formatCount(video.comments)}</span>
        </button>

        <button className="flex flex-col items-center">
          <Share className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-1" />
          <span className="text-white text-xs">{formatCount(video.shares)}</span>
        </button>

        <button className="flex flex-col items-center">
          <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mb-1" />
          <span className="text-white text-xs">₹{formatCount(video.earnings)}</span>
        </button>

        <button className="flex flex-col items-center">
          <MoreVertical className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </button>

        {/* Maximize button moved to bottom of right side */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 bg-black bg-opacity-50 rounded-full"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
});

// Bottom Navigation Component
const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'shorts', icon: Play, label: 'Shorts' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="flex justify-around items-center py-1 sm:py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center p-1 sm:p-2 ${
              activeTab === id ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [videos] = useState(mockVideos); // Only 3 videos as requested
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const containerRef = useRef(null);

  // Handle scroll for video switching
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const windowHeight = window.innerHeight;
    const videoIndex = Math.round(scrollTop / windowHeight);
    
    // Clamp the index between 0 and videos.length - 1
    const clampedIndex = Math.max(0, Math.min(videoIndex, videos.length - 1));
    setCurrentVideoIndex(clampedIndex);
  }, [videos.length]);

  const handleFollowToggle = useCallback((videoId, isFollowing) => {
    // In a real app, this would update the backend
    console.log(`Video ${videoId} follow status: ${isFollowing}`);
  }, []);

  const handleLikeToggle = useCallback((videoId, isLiked) => {
    // In a real app, this would update the backend
    console.log(`Video ${videoId} like status: ${isLiked}`);
  }, []);

  const memoizedVideos = useMemo(() => videos, [videos]);

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {memoizedVideos.map((video, index) => (
          <div key={video.id} className="snap-start">
            <VideoCard
              video={video}
              isActive={index === currentVideoIndex}
              onFollowToggle={handleFollowToggle}
              onLikeToggle={handleLikeToggle}
            />
          </div>
        ))}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default App;