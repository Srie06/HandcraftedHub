"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted animate-pulse rounded-2xl" />
  ),
}) as any;

interface SubtitleTrack {
  language: LanguageCode;
  url: string; // URL to VTT file
  label: string;
}

interface VideoPlayerWithSubtitlesProps {
  videoUrl: string;
  subtitles?: SubtitleTrack[];
  currentLanguage: LanguageCode;
  originalLanguage?: string;
  className?: string;
}

export function VideoPlayerWithSubtitles({
  videoUrl,
  subtitles = [],
  currentLanguage,
  originalLanguage,
  className = "",
}: VideoPlayerWithSubtitlesProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<LanguageCode | null>(
    null
  );
  const [key, setKey] = useState(0); // Force re-render when subtitle changes

  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-select subtitle based on current language
  useEffect(() => {
    if (subtitles.length > 0) {
      const matchingSubtitle = subtitles.find(
        (sub) => sub.language === currentLanguage
      );
      if (matchingSubtitle) {
        setSelectedSubtitle(currentLanguage);
      } else if (subtitles.length > 0) {
        setSelectedSubtitle(subtitles[0].language);
      }
    }
  }, [currentLanguage, subtitles]);

  // Handle subtitle change
  const handleSubtitleChange = (language: LanguageCode) => {
    setSelectedSubtitle(language);
    // Force player re-render to apply new subtitle track
    setKey((prev) => prev + 1);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgress = (state: any) => {
    if (!seeking && state.played !== undefined) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    setSeeking(false);
    const target = e.target as HTMLInputElement;
    if (playerRef.current && target.value) {
      playerRef.current.seekTo(parseFloat(target.value));
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleFullscreen = () => {
    const playerElement = playerRef.current?.wrapper;
    if (playerElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Configure ReactPlayer with subtitle tracks
  const playerConfig = {
    file: {
      attributes: {
        crossOrigin: "anonymous",
      },
      tracks: subtitles.map((subtitle) => ({
        kind: "subtitles",
        src: subtitle.url,
        srcLang: subtitle.language,
        label: subtitle.label,
        default: subtitle.language === selectedSubtitle,
      })),
    },
  };

  return (
    <div
      className={`relative bg-black rounded-2xl overflow-hidden shadow-soft-lg ${className}`}
    >
      {/* Original Language Badge */}
      {originalLanguage && (
        <div className="absolute top-4 left-4 z-20">
          <Badge
            variant="secondary"
            className="bg-black/70 text-white border-white/20"
          >
            Originally in{" "}
            {SUPPORTED_LANGUAGES[originalLanguage as LanguageCode]
              ?.nativeName || originalLanguage}
          </Badge>
        </div>
      )}

      {/* Video Player */}
      <div
        className="relative aspect-video"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <ReactPlayer
          key={key}
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          muted={muted}
          volume={volume}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={playerConfig}
        />

        {/* Custom Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-1 mb-3 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:bg-white/20"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Subtitle Selector */}
              {subtitles.length > 0 && (
                <select
                  value={selectedSubtitle || ""}
                  onChange={(e) =>
                    handleSubtitleChange(e.target.value as LanguageCode)
                  }
                  className="bg-white/20 text-white text-sm rounded px-2 py-1 border border-white/30 hover:bg-white/30 cursor-pointer"
                >
                  <option value="" disabled>
                    Subtitles
                  </option>
                  {subtitles.map((subtitle) => (
                    <option
                      key={subtitle.language}
                      value={subtitle.language}
                      className="bg-black"
                    >
                      {subtitle.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
