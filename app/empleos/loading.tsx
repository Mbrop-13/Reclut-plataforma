import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmpleosLoading() {
    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50">
            <div className="container py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-6 w-48" />
                </div>

                {/* Search Bar Skeleton */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-4 w-32" />
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((j) => (
                                                <Skeleton key={j} className="h-4 w-full" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Job Cards Skeleton */}
                    <div className="lg:col-span-3 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/4" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-4 mb-4">
                                        {[1, 2, 3, 4].map((j) => (
                                            <Skeleton key={j} className="h-4 w-20" />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4].map((j) => (
                                            <Skeleton key={j} className="h-6 w-16" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
