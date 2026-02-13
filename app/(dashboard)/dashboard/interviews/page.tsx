"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Video, User, Plus, Trash2, PlayCircle, Settings2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function InterviewStudioPage() {
    const [questions, setQuestions] = useState([
        { id: 1, text: "Tell me about yourself and your experience.", duration: 120, type: "video" },
        { id: 2, text: "Why do you want to work for our company?", duration: 90, type: "video" },
    ])

    const [activeAvatar, setActiveAvatar] = useState("alex")

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Interview Studio</h2>
                    <p className="text-muted-foreground">Configure AI interviewers and assessment flows.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">Preview</Button>
                    <Button>Save Configuration</Button>
                </div>
            </div>

            <Tabs defaultValue="avatar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="avatar">Avatar Configuration</TabsTrigger>
                    <TabsTrigger value="questions">Question Builder</TabsTrigger>
                    <TabsTrigger value="settings">General Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="avatar" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Select Avatar</CardTitle>
                                <CardDescription>Choose the persona for this interview.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className={`p-4 rounded-lg border-2 cursor-pointer flex items-center space-x-4 transition-all ${activeAvatar === 'alex' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                                    onClick={() => setActiveAvatar('alex')}
                                >
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                                        <AvatarFallback>AL</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Alex</p>
                                        <p className="text-xs text-muted-foreground">Professional & Direct</p>
                                    </div>
                                </div>

                                <div
                                    className={`p-4 rounded-lg border-2 cursor-pointer flex items-center space-x-4 transition-all ${activeAvatar === 'sarah' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                                    onClick={() => setActiveAvatar('sarah')}
                                >
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                                        <AvatarFallback>SA</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Sarah</p>
                                        <p className="text-xs text-muted-foreground">Friendly & Casual</p>
                                    </div>
                                </div>
                                <div
                                    className={`p-4 rounded-lg border-2 cursor-pointer flex items-center space-x-4 transition-all ${activeAvatar === 'mike' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                                    onClick={() => setActiveAvatar('mike')}
                                >
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" />
                                        <AvatarFallback>MI</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Mike</p>
                                        <p className="text-xs text-muted-foreground">Technical & Detailed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Avatar Preview</CardTitle>
                                <CardDescription>Live preview of the selected avatar.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-md relative overflow-hidden">
                                {/* Placeholder for real 3D/Video avatar */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <span className="text-9xl">🤖</span>
                                </div>
                                <div className="z-10 text-white text-center space-y-4">
                                    <div className="w-32 h-32 rounded-full bg-slate-700 mx-auto flex items-center justify-center border-4 border-white/10 animate-pulse">
                                        <User className="h-16 w-16 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Hello, I'm {activeAvatar.charAt(0).toUpperCase() + activeAvatar.slice(1)}</h3>
                                        <p className="text-slate-400">I'll be conducting the interview today.</p>
                                    </div>
                                    <div className="flex space-x-4 justify-center mt-6">
                                        <Button size="sm" variant="secondary"><Mic className="mr-2 h-4 w-4" /> Test Voice</Button>
                                        <Button size="sm" variant="secondary"><Settings2 className="mr-2 h-4 w-4" /> Adjust Settings</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Interview Questions</CardTitle>
                                    <CardDescription>Define the structured interview flow.</CardDescription>
                                </div>
                                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-card">
                                    <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            defaultValue={q.text}
                                            className="resize-none"
                                        />
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Label className="text-xs">Response Type:</Label>
                                                <Select defaultValue={q.type}>
                                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="video">Video Recording</SelectItem>
                                                        <SelectItem value="audio">Audio Only</SelectItem>
                                                        <SelectItem value="text">Text Response</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Label className="text-xs">Time Limit (sec):</Label>
                                                <Input type="number" defaultValue={q.duration} className="w-[80px] h-8 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Strict Time Limits</Label>
                                    <p className="text-sm text-muted-foreground">Auto-submit when time runs out.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Allow Retakes</Label>
                                    <p className="text-sm text-muted-foreground">Candidates can re-record their answers once.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Anti-Cheating Detection</Label>
                                    <p className="text-sm text-muted-foreground">Monitor tab switching and background noise.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
