import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatRating(rating: number): string {
  return (rating / 10).toFixed(1);
}

export function calculateProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString();
}

export function generateVideoThumbnail(title: string): string {
  // Generate a placeholder image URL based on course title
  const encodedTitle = encodeURIComponent(title);
  return `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format&q=80&overlay-text=${encodedTitle}`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Technology': 'bg-emerald-100 text-emerald-800',
    'Design': 'bg-purple-100 text-purple-800',
    'Business': 'bg-blue-100 text-blue-800',
    'Creative': 'bg-pink-100 text-pink-800',
    'Data Science': 'bg-orange-100 text-orange-800',
    'Marketing': 'bg-yellow-100 text-yellow-800',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'Beginner': 'text-green-600',
    'Intermediate': 'text-yellow-600',
    'Advanced': 'text-red-600',
  };
  
  return colors[level] || 'text-gray-600';
}

export function generateStars(rating: number): string[] {
  const stars = [];
  const fullStars = Math.floor(rating / 10);
  const hasHalfStar = (rating % 10) >= 5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full');
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  
  return stars;
}
