"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, MoreHorizontal, Mail, Phone, Download, Filter, Plus as PlusIcon, Search as SearchIcon } from "lucide-react"

export default function CandidatesPage() {
    const candidates = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Frontend Developer", status: "Interviewing", score: 92, date: "2024-02-15" },
        { id: 2, name: "Mark Smith", email: "mark@example.com", role: "Product Designer", status: "New", score: 88, date: "2024-02-16" },
        { id: 3, name: "Sarah Williams", email: "sarah@example.com", role: "Backend Engineer", status: "Review", score: 75, date: "2024-02-14" },
        { id: 4, name: "James Brown", email: "james@example.com", role: "Frontend Developer", status: "Offer", score: 98, date: "2024-02-12" },
        { id: 5, name: "Emily Davis", email: "emily@example.com", role: "Product Manager", status: "New", score: 82, date: "2024-02-17" },
        { id: 6, name: "Michael Chen", email: "michael@example.com", role: "Data Scientist", status: "Rejected", score: 65, date: "2024-02-10" },
        { id: 7, name: "Lisa Wong", email: "lisa@example.com", role: "UX Researcher", status: "Interviewing", score: 90, date: "2024-02-13" },
    ]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Candidates</h2>
                    <p className="text-muted-foreground">View and manage all candidate applications.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Button><PlusIcon className="mr-2 h-4 w-4" /> Add Candidate</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Applications</CardTitle>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search candidates..." className="pl-8 w-[250px]" />
                            </div>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="interviewing">Interviewing</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Applied For</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>AI Score</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{candidate.name}</div>
                                                <div className="text-xs text-muted-foreground">{candidate.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{candidate.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            candidate.status === 'Offer' ? 'success' :
                                                candidate.status === 'New' ? 'secondary' :
                                                    candidate.status === 'Rejected' ? 'destructive' : 'default'
                                        }>
                                            {candidate.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <span className={`font-bold ${candidate.score >= 90 ? 'text-green-600' : candidate.score >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {candidate.score}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{candidate.date}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/dashboard/candidates/${candidate.id}`}>
                                                <Button variant="ghost" size="icon" title="View Profile">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" title="Email">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing 1-7 of 7 candidates
                    </div>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

// End of component


