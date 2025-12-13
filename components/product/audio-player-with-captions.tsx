"use client";

import { useState, useRef, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface CaptionSegment {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

interface AudioCaption {
  language: LanguageCode;
  segments: CaptionSegment[];
}

interface AudioPlayerWithCaptionsProps {
  audioUrl: string;
  captions?: AudioCaption[];
  currentLanguage: LanguageCode;
  originalLanguage?: string;
  className?: string;
}

export function AudioPlayerWithCaptions({
  audioUrl,
  captions = [],
  currentLanguage,
  originalLanguage,
  className = "",
}: AudioPlayerWithCaptionsProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentCaption, setCurrentCaption] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement>(null);

  // Find captions for current language
  const languageCaptions = captions.find(
    (cap) => cap.language === currentLanguage
  );

  // Update current caption based on playback time
  useEffect(() => {
    if (languageCaptions && languageCaptions.segments.length > 0) {
      const activeSegment = languageCaptions.segments.find(
        (segment) => currentTime >= segment.start && currentTime <= segment.end
      );
      setCurrentCaption(activeSegment?.text || "");
    } else {
      setCurrentCaption("");
    }
  }, [currentTime, languageCaptions]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`rounded-2xl shadow-soft-lg overflow-hidden ${className}`}>
      <CardContent className="p-6 space-y-4">
        {/* Original Language Badge */}
        {originalLanguage && (
          <Badge variant="outline" className="text-xs">
            Originally in{" "}
            {SUPPORTED_LANGUAGES[originalLanguage as LanguageCode]
              ?.nativeName || originalLanguage}
          </Badge>
        )}

        {/* Audio Element (hidden) */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        {/* Live Captions Display */}
        {captions.length > 0 && (
          <div className="min-h-[80px] bg-muted/30 rounded-xl p-4 flex items-center justify-center">
            <p
              className={`text-center text-lg font-medium transition-opacity duration-300 ${
                currentCaption ? "opacity-100" : "opacity-40"
              }`}
            >
              {currentCaption || "Captions will appear here..."}
            </p>
          </div>
        )}

        {/* Waveform Visualization (Simplified Progress Bar) */}
        <div className="relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Skip Backward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipBackward}
              className="rounded-xl"
              disabled={currentTime === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              size="lg"
              onClick={handlePlayPause}
              className="rounded-full w-12 h-12 shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipForward}
              className="rounded-xl"
              disabled={currentTime >= duration}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="rounded-xl"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
        </div>

        {/* Caption Language Indicator */}
        {languageCaptions && (
          <div className="text-center text-xs text-muted-foreground">
            Captions:{" "}
            {SUPPORTED_LANGUAGES[languageCaptions.language]?.nativeName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
