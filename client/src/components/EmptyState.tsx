import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType<LucideProps>;
  title: string;
  message: string;
  actionButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string; // Allow custom styling for the Card
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionButton,
  className = "p-6 text-center", // Default padding and text alignment
}) => {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center">
        {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
        {actionButton && (
          actionButton.href ? (
            <Link href={actionButton.href}>
              <Button onClick={actionButton.onClick}>{actionButton.text}</Button>
            </Link>
          ) : (
            <Button onClick={actionButton.onClick}>{actionButton.text}</Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
