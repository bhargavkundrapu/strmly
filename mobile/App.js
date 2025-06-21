import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { Video } from 'expo-av';
import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data with same structure as web version
const mockVideos = [
  {
    id: 1,
    videoUrl: "https://res.cloudinary.com/da2wrgabu/video/upload/v1750515943/videoplayback_2_upeiwv.mp4",
    title: "Amazing Startup Journey",
    description: "This is an incredible story about how we built trust in life between two people with high emotions.",
    userName: "Rajesh Kumar",
    userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    likes: 200000,
    comments: 1300,
    shares: 456,
    earnings: 2100,
    hashtag: "#Sanam teri kasam",
    episode: "EP 1",
    isPaid: false,
    isFollowing: false
  },
  {
    id: 2,
    videoUrl: "https://res.cloudinary.com/da2wrgabu/video/upload/v1750515942/videoplayback_1_t5xpsc.mp4",
    title: "Tech Innovation Hub",
    description: "Exploring the two different people who are going to trust in their life with high emotions and how they built a startup.",
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
    description: "One of tyhe best motivational movies for tyhe present life situations facing by the students for the family.",
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

// FIXED Progress Bar Component with better duration handling
const ProgressBar = ({ currentTime, duration, onSeek, onFullscreenToggle, isFullscreen, isLoaded }) => {
  const progress = duration > 0 ? currentTime / duration : 0;
  
  const handlePress = (event) => {
    const { locationX } = event.nativeEvent;
    const progressWidth = screenWidth - 120; // Account for time labels and fullscreen button
    const percentage = locationX / progressWidth;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  // FIXED: Better formatTime function
  const formatTime = (time) => {
    // Handle invalid values but allow zero
    if (time == null || isNaN(time) || time < 0) {
      return '0:00';
    }
    
    const totalSeconds = Math.max(0, Math.floor(time));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show loading state if video not loaded yet
  if (!isLoaded) {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>0:00</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>
        </View>
        <Text style={styles.timeText}>--:--</Text>
        <TouchableOpacity style={styles.fullscreenButton} onPress={onFullscreenToggle}>
          <MaterialIcons name="fullscreen" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
      <TouchableOpacity 
        style={styles.progressBarContainer} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
      </TouchableOpacity>
      <Text style={styles.timeText}>{formatTime(duration)}</Text>
      
      <TouchableOpacity 
        style={styles.fullscreenButton}
        onPress={onFullscreenToggle}
      >
        <MaterialIcons 
          name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && isLoaded) {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    } else {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive, isLoaded]);

  const showPlayPauseOverlay = useCallback((isPlayingState) => {
    setShowPlayPause(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPlayPause(false);
    });
  }, [fadeAnim]);

  const handleVideoPress = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
      showPlayPauseOverlay(false);
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
      showPlayPauseOverlay(true);
    }
  }, [isPlaying, showPlayPauseOverlay]);

  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current?.setIsMutedAsync(newMutedState);
  }, [isMuted]);

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

  const handleSeek = useCallback((time) => {
    if (videoRef.current && time >= 0 && time <= duration) {
      videoRef.current?.setPositionAsync(time * 1000);
      setCurrentTime(time);
    }
  }, [duration]);

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (isFullscreen) {
        await videoRef.current?.dismissFullscreenPlayer();
        setIsFullscreen(false);
      } else {
        await videoRef.current?.presentFullscreenPlayer();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Fullscreen toggle failed:', error);
    }
  }, [isFullscreen]);

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity 
        style={styles.videoTouchable} 
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: video.videoUrl }}
            style={styles.video}
            shouldPlay={isActive}
            isLooping
            isMuted={isMuted}
            resizeMode="cover"
            onLoad={(status) => {
              // FIXED: Better duration handling with debug logging
              console.log('Video onLoad status:', status);
              
              if (status.durationMillis) {
                const durationInSeconds = status.durationMillis / 1000;
                console.log('Duration in seconds:', durationInSeconds);
                
                if (durationInSeconds > 0 && !isNaN(durationInSeconds)) {
                  setDuration(durationInSeconds);
                  setIsLoaded(true);
                  console.log('Duration set successfully:', durationInSeconds);
                }
              }
            }}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                // FIXED: Set duration here as fallback if not already set
                if (status.durationMillis && duration === 0) {
                  const durationInSeconds = status.durationMillis / 1000;
                  if (durationInSeconds > 0 && !isNaN(durationInSeconds)) {
                    setDuration(durationInSeconds);
                    setIsLoaded(true);
                    console.log('Duration set from playback status:', durationInSeconds);
                  }
                }
                
                // Update current time
                if (status.positionMillis && !isNaN(status.positionMillis) && status.positionMillis >= 0) {
                  setCurrentTime(status.positionMillis / 1000);
                }
                
                setIsPlaying(status.isPlaying || false);
              }
            }}
            onFullscreenUpdate={(status) => {
              setIsFullscreen(status.fullscreenUpdate === 'PLAYER_DID_PRESENT');
            }}
            onError={(error) => {
              console.log('Video error:', error);
            }}
          />
        </View>

        {showPlayPause && (
          <Animated.View 
            style={[
              styles.playPauseOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.playPauseIcon}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={64} 
                color="white" 
              />
            </View>
          </Animated.View>
        )}

        {!isPlaying && isLoaded && !showPlayPause && (
          <View style={styles.initialPlayOverlay}>
            <View style={styles.initialPlayIcon}>
              <Ionicons name="play" size={48} color="white" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.muteButton} 
          onPress={handleMuteToggle}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrapper}>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onFullscreenToggle={handleFullscreenToggle}
          isFullscreen={isFullscreen}
          isLoaded={isLoaded}
        />
      </View>

      <View style={styles.leftContent}>
        <View style={styles.hashtagContainer}>
          <Text style={styles.hashtag}>{video.hashtag}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Image source={{ uri: video.userImage }} style={styles.userImage} />
          <Text style={styles.userName}>{video.userName}</Text>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton
            ]}
            onPress={handleFollow}
          >
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{video.title}</Text>
          <View style={styles.episodeBadge}>
            <Text style={styles.episodeText}>{video.episode}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {video.description}
        </Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={32} 
            color={isLiked ? "#fbbf24" : "white"} 
          />
          <Text style={styles.actionText}>{formatCount(localLikes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={32} color="white" />
          <Text style={styles.actionText}>{formatCount(video.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={32} color="white" />
          <Text style={styles.actionText}>{formatCount(video.shares)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="attach-money" size={32} color="#22c55e" />
          <Text style={styles.actionText}>₹{formatCount(video.earnings)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Bottom Navigation Component
const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    { id: 'shorts', icon: 'play-outline', activeIcon: 'play', label: 'Shorts' },
    { id: 'add', icon: 'add-outline', activeIcon: 'add', label: 'Add' },
    { id: 'search', icon: 'search-outline', activeIcon: 'search', label: 'Search' },
    { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => setActiveTab(item.id)}
        >
          <Ionicons 
            name={activeTab === item.id ? item.activeIcon : item.icon} 
            size={24} 
            color={activeTab === item.id ? '#fbbf24' : '#6b7280'} 
          />
          <Text style={[
            styles.navLabel,
            { color: activeTab === item.id ? '#fbbf24' : '#6b7280' }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main App Component
const VideoApp = () => {
  const [videos] = useState(mockVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleFollowToggle = useCallback((videoId, isFollowing) => {
    console.log(`Video ${videoId} follow status: ${isFollowing}`);
  }, []);

  const handleLikeToggle = useCallback((videoId, isLiked) => {
    console.log(`Video ${videoId} like status: ${isLiked}`);
  }, []);

  const handleMomentumScrollEnd = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.y / viewSize.height);
    const clampedIndex = Math.max(0, Math.min(pageNum, videos.length - 1));
    setCurrentVideoIndex(clampedIndex);
  }, [videos.length]);

  const memoizedVideos = useMemo(() => videos, [videos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
      >
        {memoizedVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={index === currentVideoIndex}
            onFollowToggle={handleFollowToggle}
            onLikeToggle={handleLikeToggle}
          />
        ))}
      </ScrollView>
      
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'black',
    position: 'relative',
  },
  videoTouchable: {
    flex: 1,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playPauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialPlayIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 16,
  },
  muteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  progressWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 35,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(107, 114, 128, 1)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  fullscreenButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 4,
    marginLeft: 8,
  },
  leftContent: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 80,
  },
  hashtagContainer: {
    marginBottom: 8,
  },
  hashtag: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
    backgroundColor: 'transparent',
  },
  followingButton: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  followButtonText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  followingButtonText: {
    color: 'black',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  episodeBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  rightActions: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingVertical: 4,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default VideoApp;