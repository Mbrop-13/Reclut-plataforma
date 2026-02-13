"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress-custom"
import { AvatarInterviewer } from "@/components/features/avatar-interviewer"
import { CheckCircle2, Clock, Calendar, ChevronRight } from "lucide-react"

export default function CandidateDashboard() {
    const [interviewStarted, setInterviewStarted] = useState(false)
    const [interviewCompleted, setInterviewCompleted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)

    const questions = [
        "Tell me about a challenging project you worked on recently.",
        "How do you handle conflict in a team setting?",
        "Why do you want to work at this company?"
    ]

    const handleStartInterview = () => {
        setInterviewStarted(true)
    }

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            setInterviewStarted(false)
            setInterviewCompleted(true)
            setCurrentQuestion(0)
        }
    }

    if (interviewCompleted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-500 p-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Interview Completed!</h2>
                <p className="text-muted-foreground max-w-[600px]">
                    Thank you for completing the AI interview assessment. Your responses have been recorded and sent to the hiring team.
                    You will hear back from us within 3-5 business days.
                </p>
                <div className="flex space-x-4">
                    <Button onClick={() => setInterviewCompleted(false)} variant="outline">Back to Dashboard</Button>
                    <Button>View My Profile</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Hello, John 👋</h2>
                    <p className="text-muted-foreground">Welcome back to your candidate portal.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-slate-50">Profile Completion: 85%</Badge>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="interview-room">Interview Room</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground">1 pending interview</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">+4 this week</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Skill Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">92/100</div>
                                <p className="text-xs text-muted-foreground">Top 5% candidate</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Upcoming Interviews</CardTitle>
                            <CardDescription>You have an interview scheduled for today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Frontend Developer Role</p>
                                        <p className="text-sm text-muted-foreground">Tech Corp Inc.</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => document.getElementById('interview-tab-trigger')?.click()}>Start AI Interview</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Applications</CardTitle>
                            <CardDescription>Track the status of your job applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { role: "Frontend Developer", company: "Tech Corp Inc.", status: "Interviewing", date: "Applied 2 days ago" },
                                    { role: "Product Designer", company: "Creative Studio", status: "Under Review", date: "Applied 5 days ago" },
                                    { role: "Full Stack Engineer", company: "Startup AI", status: "Applied", date: "Applied 1 week ago" },
                                ].map((app, i) => (
                                    <div key={i} className="flex items-center justify-between border p-4 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold">{app.role}</h4>
                                            <p className="text-sm text-muted-foreground">{app.company} • {app.date}</p>
                                        </div>
                                        <Badge variant={app.status === 'Interviewing' ? 'default' : 'secondary'}>{app.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="interview-room" className="space-y-4">
                    {/* Hidden trigger for navigation reference */}
                    <span id="interview-tab-trigger" className="hidden"></span>

                    {!interviewStarted ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Interview Assessment</CardTitle>
                                <CardDescription>
                                    You are about to start a video interview with our AI recruiter.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border">
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-slate-500" />
                                        <span>Estimated time: 15-20 minutes</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-slate-500" />
                                        <span>Video and Microphone access required</span>
                                    </div>
                                </div>
                                <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                                    <strong>Tips:</strong> Ensure you are in a quiet environment with good lighting. Speak clearly and look at the camera.
                                </div>
                            </CardContent>
                            <CardContent>
                                <Button className="w-full md:w-auto" size="lg" onClick={handleStartInterview}>
                                    Start Interview <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="md:col-span-2 h-[500px] bg-slate-100 rounded-lg overflow-hidden border custom-video-container">
                                <AvatarInterviewer
                                    avatarId="alex"
                                    question={questions[currentQuestion]}
                                    isListening={true}
                                    onResponseComplete={() => { }}
                                />
                            </div>
                            <div className="space-y-4">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Question {currentQuestion + 1} of {questions.length}</CardTitle>
                                        <div className="space-y-1 mt-2">
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-right text-muted-foreground">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold mb-2">Current Question:</h3>
                                            <p className="text-lg leading-relaxed">{questions[currentQuestion]}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border text-xs text-muted-foreground flex items-center animate-pulse">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                            Recording your response...
                                        </div>
                                        <Button className="w-full" onClick={handleNextQuestion}>
                                            Submit Answer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
