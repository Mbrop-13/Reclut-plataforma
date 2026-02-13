import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-sm py-1 px-3">Feb 2026</Badge>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground flex items-center text-green-600">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <span className="text-slate-500">2 closing this week</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground flex items-center text-green-600">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12 this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14 Days</div>
                        <p className="text-xs text-muted-foreground flex items-center text-green-600">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -2 days avg
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Pipeline */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Candidates</CardTitle>
                        <CardDescription>
                            You have 12 new applicants this week.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Match Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: "Alice Johnson", role: "Senior Frontend Dev", status: "Interviewing", score: 92 },
                                    { name: "Mark Smith", role: "Product Designer", status: "New", score: 88 },
                                    { name: "Sarah Williams", role: "Backend Engineer", status: "Review", score: 75 },
                                    { name: "James Brown", role: "Senior Frontend Dev", status: "Offer", score: 98 },
                                    { name: "Emily Davis", role: "Product Manager", status: "New", score: 82 },
                                ].map((candidate, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{candidate.name}</TableCell>
                                        <TableCell>{candidate.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={candidate.status === 'Offer' ? 'success' : candidate.status === 'New' ? 'secondary' : 'default'}>
                                                {candidate.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-600">{candidate.score}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recruitment Funnel</CardTitle>
                        <CardDescription>
                            Overview of candidate pipeline conversion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Applied", value: "100%", count: 1234, color: "bg-blue-500" },
                                { label: "Screening", value: "60%", count: 740, color: "bg-blue-400" },
                                { label: "Interview", value: "30%", count: 370, color: "bg-purple-500" },
                                { label: "Offer Sent", value: "10%", count: 123, color: "bg-green-500" },
                                { label: "Hired", value: "8%", count: 98, color: "bg-green-600" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-24 text-sm text-muted-foreground">{item.label}</div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-2">
                                        <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                                    </div>
                                    <div className="w-12 text-sm font-bold text-right">{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
