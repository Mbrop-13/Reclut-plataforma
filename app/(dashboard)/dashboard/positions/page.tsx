"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, MoreHorizontal, MapPin, DollarSign, Users } from "lucide-react"

export default function PositionsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
                    <p className="text-muted-foreground">Manage job openings and hiring pipelines.</p>
                </div>
                <Link href="/dashboard/positions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Position
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <Input placeholder="Search positions..." className="max-w-[300px]" />
                <Button variant="outline">Filter</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        title: "Senior Frontend Developer",
                        dept: "Engineering",
                        location: "Remote",
                        salary: "$120k - $160k",
                        candidates: 45,
                        status: "Active"
                    },
                    {
                        title: "Product Designer",
                        dept: "Design",
                        location: "New York, NY",
                        salary: "$100k - $140k",
                        candidates: 28,
                        status: "Active"
                    },
                    {
                        title: "Marketing Manager",
                        dept: "Marketing",
                        location: "London, UK",
                        salary: "£60k - £80k",
                        candidates: 12,
                        status: "Draft"
                    }
                ].map((job, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{job.title}</CardTitle>
                                    <CardDescription className="mt-1">{job.dept}</CardDescription>
                                </div>
                                <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>{job.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" /> {job.location}
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="mr-2 h-4 w-4" /> {job.salary}
                                </div>
                                <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" /> {job.candidates} Applicants
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" className="w-full mr-2">View Pipeline</Button>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
