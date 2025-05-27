import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSectionHeaderProps {
  title: string;
  actionComponent?: React.ReactNode;
  isLoading?: boolean;
  className?: string; // Allow custom styling
}

const DashboardSectionHeader: React.FC<DashboardSectionHeaderProps> = ({
  title,
  actionComponent,
  isLoading,
  className = "flex items-center justify-between mb-6", // Default styling
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-8 w-1/3" /> {/* Skeleton for title */}
        {actionComponent && <Skeleton className="h-10 w-24" />} {/* Skeleton for action button */}
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {actionComponent}
    </div>
  );
};

export default DashboardSectionHeader;
