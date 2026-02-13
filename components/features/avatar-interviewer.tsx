"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, Play, Pause } from "lucide-react"

interface AvatarInterviewerProps {
    avatarId: string
    question: string
    isListening: boolean
    onResponseComplete?: (transcript: string) => void
    showTimer?: boolean
    allowPause?: boolean
}

export function AvatarInterviewer({
    avatarId,
    question,
    isListening,
    onResponseComplete,
    showTimer = true,
    allowPause = true
}: AvatarInterviewerProps) {
    const [isPlaying, setIsPlaying] = useState(true)
    const [micOn, setMicOn] = useState(true)
    const [timer, setTimer] = useState(0)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (showTimer && isListening) {
            interval = setInterval(() => {
                setTimer(t => t + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [showTimer, isListening])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Card className="w-full h-full overflow-hidden bg-black relative">
            <CardContent className="p-0 h-full relative aspect-video flex items-center justify-center">
                {/* Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-4 animate-pulse relative overflow-hidden">
                            <div className="relative w-full h-full">
                                <Image
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}`}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <h3 className="text-white text-xl font-medium">Interview in progress</h3>
                        <p className="text-slate-400 text-sm">AI Avatar is listening...</p>
                    </div>
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">

                    {/* Question Display */}
                    <div className="mb-6 p-4 bg-black/50 rounded-lg border border-white/10 backdrop-blur-sm">
                        <p className="text-white text-lg font-medium">{question}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white">
                            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="font-mono">{formatTime(timer)}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="secondary" size="icon" onClick={() => setMicOn(!micOn)}>
                                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </Button>
                            <Button variant="secondary" size="icon">
                                <Video className="h-4 w-4" />
                            </Button>
                            {allowPause && (
                                <Button variant="destructive" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
