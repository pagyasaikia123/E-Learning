import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button'; // For the login link

const VerifyEmailPage: React.FC = () => {
  const [message, setMessage] = useState<string>('Verifying your email...');
  const { verifyEmail, isLoading } = useAuth();
  const [location, setLocation] = useLocation(); // setLocation for navigation
  const [showLoginLink, setShowLoginLink] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setMessage('Invalid or missing verification token.');
      return;
    }

    const doVerify = async () => {
      try {
        const successMessage = await verifyEmail(token);
        setMessage(successMessage);
        if (successMessage.includes("successfully") || successMessage.includes("already verified")) {
          setShowLoginLink(true);
        }
      } catch (err: any) {
        setMessage(err.message || 'Failed to verify email. Please try again or contact support.');
        setShowLoginLink(false);
      }
    };

    doVerify();
  }, [location.search, verifyEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {isLoading ? "Processing your verification..." : "Verification status:"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-lg ${message.startsWith('Failed') || message.startsWith('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
          {isLoading && (
            <div className="mt-4">
              {/* You can add a spinner or loading animation here */}
              <p>Loading...</p>
            </div>
          )}
          {showLoginLink && !isLoading && (
            <Button onClick={() => setLocation('/login')} className="mt-6">
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
