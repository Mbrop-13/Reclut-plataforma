"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress-custom"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Download, Calendar, Star, BrainCircuit, FileText, Sparkles } from "lucide-react"

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
    // Mock data based on ID (in a real app, fetch data)
    const candidate = {
        id: params.id,
        name: "Alice Johnson",
        role: "Senior Frontend Developer",
        email: "alice@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        status: "Interviewing",
        score: 92,
        about: "Passionate Frontend Developer with over 5 years of experience building responsive and accessible web applications. Expert in React, Next.js, and modern CSS. Strong advocate for component-driven development and design systems.",
        experience: [
            {
                role: "Senior Frontend Engineer",
                company: "TechFlow Inc.",
                period: "2021 - Present",
                description: "Leading the frontend team in migrating the legacy monolith to a micro-frontend architecture using Next.js."
            },
            {
                role: "Frontend Developer",
                company: "StartupXYZ",
                period: "2018 - 2021",
                description: "Developed and maintained the company's main e-commerce platform, increasing conversion rates by 15%."
            }
        ],
        education: [
            {
                degree: "BS Computer Science",
                school: "University of California, Berkeley",
                year: "2018"
            }
        ],
        skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "Node.js", "GraphQL"],
        documents: [
            { name: "Resume.pdf", type: "PDF", size: "2.4 MB" },
            { name: "Portfolio.pdf", type: "PDF", size: "5.1 MB" },
            { name: "Certifications.zip", type: "ZIP", size: "12 MB" }
        ]
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard/candidates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{candidate.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        {candidate.role} •
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidate.location}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
                    <Button><Calendar className="mr-2 h-4 w-4" /> Schedule Interview</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Info & AI Score */}
                <div className="space-y-6">
                    {/* AI Score Card */}
                    <Card className="border-blue-100 bg-blue-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4" />
                                AI Match Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-blue-700">{candidate.score}%</span>
                                <span className="text-sm text-blue-600 mb-1">Match</span>
                            </div>
                            <Progress value={candidate.score} className="h-2 bg-blue-200" indicatorClassName="bg-blue-600" />
                            <p className="text-xs text-blue-600 mt-2">
                                Strong fit for the Senior Frontend Developer role based on skills and experience.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg"><Mail className="w-4 h-4 text-slate-600" /></div>
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-slate-500">{candidate.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg"><Phone className="w-4 h-4 text-slate-600" /></div>
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-sm text-slate-500">{candidate.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg"><Linkedin className="w-4 h-4 text-slate-600" /></div>
                                <div>
                                    <p className="text-sm font-medium">LinkedIn</p>
                                    <Link href="#" className="text-sm text-blue-600 hover:underline">linkedin.com/in/alice</Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="resume">Resume & Docs</TabsTrigger>
                            <TabsTrigger value="ai-analysis">
                                <Sparkles className="w-3 h-3 mr-2" />
                                AI Analysis
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-4 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {candidate.about}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Experience</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {candidate.experience.map((exp, i) => (
                                        <div key={i} className="relative pl-4 border-l-2 border-slate-200 last:mb-0">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300" />
                                            <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                                <span>{exp.company}</span>
                                                <span>•</span>
                                                <span>{exp.period}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{exp.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Education</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {candidate.education.map((edu, i) => (
                                        <div key={i}>
                                            <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                                            <p className="text-sm text-slate-500">{edu.school}, {edu.year}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="resume" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documents</CardTitle>
                                    <CardDescription>Resumes, portfolios, and certifications uploaded by the candidate.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {candidate.documents.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{doc.name}</p>
                                                    <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Download className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ai-analysis" className="mt-4">
                            <Card className="grad-magic border-none text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Grok 4.1 Fast Analysis
                                    </CardTitle>
                                    <CardDescription className="text-blue-100">
                                        Detailed AI evaluation of the candidate&rsquo;s fit for the Senior Frontend Developer role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Star className="w-4 h-4" /> Key Strengths
                                        </h4>
                                        <ul className="list-disc list-inside text-sm space-y-1 text-blue-50">
                                            <li>Strong production experience with Next.js and React ecosystems.</li>
                                            <li>Demonstrated leadership in technical migrations (Monolith to Micro-frontends).</li>
                                            <li>Excellent communication skills inferred from detailed documentation practices.</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4" /> Potential Areas to Probe
                                        </h4>
                                        <ul className="list-disc list-inside text-sm space-y-1 text-blue-50">
                                            <li>Experience with state management in very large scale applications.</li>
                                            <li>Specific contributions to design systems beyond usage.</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}


