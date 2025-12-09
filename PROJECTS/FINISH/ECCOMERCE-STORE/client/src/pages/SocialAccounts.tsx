import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link2, Unlink, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useUser } from '@clerk/clerk-react';

interface ClerkStatus {
  isLinked: boolean;
  clerkUserId?: string;
  googleId?: string;
  authProvider: string;
}

const SocialAccounts = () => {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();

  // Fetch Clerk status
  const { data: clerkStatus, isLoading } = useQuery({
    queryKey: ['clerk-status'],
    queryFn: async (): Promise<ClerkStatus> => {
      const response = await api.get('/auth/clerk/status');
      return response.data.data;
    },
  });

  // Unlink Google account
  const unlinkMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/clerk/unlink');
    },
    onSuccess: () => {
      toast.success('Google account unlinked successfully');
      queryClient.invalidateQueries({ queryKey: ['clerk-status'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to unlink Google account');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Social Accounts</h1>
            <p className="text-base-content/70">
              Manage your connected social accounts for easy sign-in.
            </p>
          </div>

          {/* Google Account */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Account
              </h2>

              {clerkStatus?.isLinked ? (
                <div>
                  <div className="alert alert-success mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-bold">Connected</h3>
                      <div className="text-sm">
                        Your Google account is linked. You can sign in with Google.
                      </div>
                    </div>
                  </div>

                  {clerkUser && (
                    <div className="mb-4">
                      <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
                        {clerkUser.imageUrl && (
                          <img
                            src={clerkUser.imageUrl}
                            alt="Profile"
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{clerkUser.fullName || 'Google User'}</p>
                          <p className="text-sm text-base-content/70">
                            {clerkUser.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="alert alert-warning mb-4">
                    <AlertTriangle className="h-6 w-6" />
                    <div className="text-sm">
                      <p className="font-semibold">Before unlinking:</p>
                      <p>Make sure you have a password set for your account to continue signing in.</p>
                    </div>
                  </div>

                  <button
                    className="btn btn-error btn-outline"
                    onClick={() => unlinkMutation.mutate()}
                    disabled={unlinkMutation.isPending}
                  >
                    {unlinkMutation.isPending && (
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                    )}
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect Google Account
                  </button>
                </div>
              ) : (
                <div>
                  <div className="alert alert-info mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <div>
                      <h3 className="font-bold">Not Connected</h3>
                      <div className="text-sm">
                        Connect your Google account for quick and easy sign-in.
                      </div>
                    </div>
                  </div>

                  <p className="text-base-content/70 mb-4">
                    Benefits of connecting your Google account:
                  </p>
                  <ul className="list-disc list-inside text-sm text-base-content/70 mb-4 space-y-1">
                    <li>Sign in with one click</li>
                    <li>No need to remember another password</li>
                    <li>Secure authentication through Google</li>
                    <li>Keep your existing account and data</li>
                  </ul>

                  <a
                    href="/login"
                    className="btn btn-primary btn-outline"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Google Account
                  </a>
                  <p className="text-sm text-base-content/60 mt-2">
                    You'll be redirected to the login page where you can sign in with Google.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title mb-4">Security Notice</h2>
              <div className="text-sm text-base-content/70 space-y-2">
                <p>
                  When you connect a social account, we only access basic profile information
                  like your name and email address. We never access your password or post on
                  your behalf.
                </p>
                <p>
                  You can disconnect your social account at any time. Make sure you have a
                  password set before disconnecting to maintain access to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialAccounts;
