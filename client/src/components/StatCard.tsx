import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideProps } from 'lucide-react'; // Import LucideProps for icon type

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType<LucideProps>; // Use LucideProps for icon type
  iconColor?: string;
  description?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon, // Rename to Icon for rendering
  iconColor = 'text-muted-foreground', // Default icon color
  description,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-2/3" /> {/* Skeleton for title */}
          <Skeleton className="h-6 w-6 rounded-full" /> {/* Skeleton for icon */}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-1" /> {/* Skeleton for value */}
          {description && <Skeleton className="h-4 w-full" />} {/* Skeleton for description */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
