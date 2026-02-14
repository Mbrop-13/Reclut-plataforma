"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Sparkles } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
// Import firebase functions
import { functions } from "@/lib/firebase"
import { httpsCallable } from "firebase/functions"

export default function NewPositionPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // New Feature States
    const [currency, setCurrency] = useState("CLP")
    const [showSalary, setShowSalary] = useState(true)
    const [salaryMin, setSalaryMin] = useState("")
    const [salaryMax, setSalaryMax] = useState("")

    // AI Evaluation States
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [evaluationResult, setEvaluationResult] = useState<any>(null)
    const [showEvaluation, setShowEvaluation] = useState(false)

    // Form States
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [requirements, setRequirements] = useState("")
    const [department, setDepartment] = useState("")
    const [type, setType] = useState("")
    const [location, setLocation] = useState("")

    const handleEvaluate = async () => {
        setIsEvaluating(true)
        try {
            const response = await fetch('/api/ai/evaluate-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    requirements,
                    salaryMin,
                    salaryMax,
                    currency,
                    location
                })
            })

            if (response.ok) {
                const data = await response.json()
                setEvaluationResult(data)
                setShowEvaluation(true)
            } else {
                console.error("API Error", response.statusText)
                throw new Error("API Error")
            }
        } catch (error) {
            console.error("Evaluation failed", error)
            // Fallback for demo if function is not deployed yet or fails
            setEvaluationResult({
                score: 0,
                salaryAnalysis: "Error connecting to AI Service",
                demandLevel: "Unknown",
                suggestions: ["Check internet connection", "Verify API configuration"]
            })
            setShowEvaluation(true)
        } finally {
            setIsEvaluating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        router.push('/dashboard/positions')
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/positions">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Create New Position</h2>
                        <p className="text-muted-foreground">Post a new job opening to find the best talent.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleEvaluate} disabled={isEvaluating}>
                        {isEvaluating ? (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                Evaluating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 text-[#1890ff]" />
                                AI Evaluation
                            </>
                        )}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Publishing..." : "Publish Position"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Position Title</Label>
                        <Input
                            placeholder="e.g. Senior Frontend Developer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select dept" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Employment Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="e.g. Remote, New York, NY"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Salary Section */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Compensation</Label>
                            <div className="flex items-center space-x-2">
                                <Switch id="show-salary" checked={showSalary} onCheckedChange={setShowSalary} />
                                <Label htmlFor="show-salary" className="text-sm font-normal text-slate-500">
                                    Show on public listing
                                </Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLP">CLP ($)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="UF">UF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Min Salary</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1000"
                                    value={salaryMin}
                                    onChange={e => setSalaryMin(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Salary</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 2000"
                                    value={salaryMax}
                                    onChange={e => setSalaryMax(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Job Description</Label>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate with AI
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Describe the role, responsibilities, and ideal candidate..."
                            className="min-h-[200px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <Textarea
                            placeholder="- 3+ years of experience with React&#10;- Knowledge of TypeScript&#10;- ..."
                            className="min-h-[150px]"
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* AI Evaluation Modal */}
            <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#1890ff]" />
                            AI Job Evaluation
                        </DialogTitle>
                        <DialogDescription>
                            Analysis based on current market trends and similar listings.
                        </DialogDescription>
                    </DialogHeader>

                    {evaluationResult && (
                        <div className="space-y-6 py-4">
                            {/* Score */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">Listing Strength Score</span>
                                    <span className="font-bold text-[#1890ff]">{evaluationResult.score}/100</span>
                                </div>
                                <Progress value={evaluationResult.score} className="h-2" />
                            </div>

                            {/* Market Comparison */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Salary Competitiveness</p>
                                    <p className="font-medium text-slate-900">{evaluationResult.salaryAnalysis}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Demand Level</p>
                                    <p className="font-medium text-slate-900">{evaluationResult.demandLevel}</p>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-slate-900">Suggestions for Improvement</h4>
                                <ul className="space-y-2">
                                    {evaluationResult.suggestions?.map((item: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-600 flex gap-2">
                                            <span className="text-[#1890ff]">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEvaluation(false)}>Close</Button>
                        <Button className="btn-primary">Apply Suggestions</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
