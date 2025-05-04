import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter'; // Adjust import based on your router
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Info } from "lucide-react"; // Icons
import { Button } from '@/components/ui/button';

export function EmailVerificationPage() {
  // Adjust based on your router (e.g., useLocation from react-router-dom)
  const [location] = useLocation();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');

  useEffect(() => {
    // Use browser API to parse search params reliably
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'true') {
      setMessage('Your email address has been successfully verified! You can now log in.');
      setStatus('success');
    } else if (error) {
      let errorMessage = 'An error occurred during email verification.';
      if (error === 'invalid_or_expired_token') {
        errorMessage = 'The verification link is invalid or has expired. Please try logging in or request a new verification email.';
      } else if (error === 'missing_token') {
         errorMessage = 'The verification link is missing required information.';
      } else if (error === 'verification_failed') {
         errorMessage = 'An unexpected server error occurred during verification. Please try again later.';
      }
      // Add more specific backend error codes here if needed
      setMessage(errorMessage);
      setStatus('error');
    } else {
       // If no success or error param is present (e.g., direct navigation)
       setMessage('Could not determine email verification status. Please ensure you used the link from your email.');
       setStatus('error');
    }
  }, []); // Run only once on mount

  const getIcon = () => {
    if (status === 'success') return <CheckCircle className="h-4 w-4" />;
    if (status === 'error') return <XCircle className="h-4 w-4" />;
    return <Info className="h-4 w-4" />; // Loading or default
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-4 max-w-md text-center mt-10">Checking verification status...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-lg text-center flex flex-col items-center min-h-[calc(100vh-200px)] justify-center">
      <Alert variant={status === 'success' ? 'default' : 'destructive'} className="w-full">
         {getIcon()}
         <AlertTitle>{status === 'success' ? 'Verification Successful!' : 'Verification Failed!'}</AlertTitle>
         <AlertDescription>
           {message}
         </AlertDescription>
      </Alert>
      <Link href="/auth">
         <Button variant="outline" className="mt-6">
            Go to Login Page
         </Button>
      </Link>
    </div>
  );
}

export default EmailVerificationPage; 