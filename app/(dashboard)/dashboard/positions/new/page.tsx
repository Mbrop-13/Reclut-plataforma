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

export default function NewPositionPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

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
                    <Button variant="outline">Save Draft</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Publishing..." : "Publish Position"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Position Title</Label>
                        <Input placeholder="e.g. Senior Frontend Developer" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select>
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
                            <Select>
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
                        <Input placeholder="e.g. Remote, New York, NY" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Salary Range (Min)</Label>
                            <Input type="number" placeholder="50000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Salary Range (Max)</Label>
                            <Input type="number" placeholder="80000" />
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
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <Textarea
                            placeholder="- 3+ years of experience with React&#10;- Knowledge of TypeScript&#10;- ..."
                            className="min-h-[150px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
