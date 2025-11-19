import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_CARD_CLASSES =
  "*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 xl:grid-cols-4";

export function DashboardKPIsSkeleton() {
  return (
    <div className={KPI_CARD_CLASSES}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="@container/card" data-slot="card">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 @[250px]/card:w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-28" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="mx-auto h-56 w-56 rounded-full" />
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-36" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 w-full">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}


