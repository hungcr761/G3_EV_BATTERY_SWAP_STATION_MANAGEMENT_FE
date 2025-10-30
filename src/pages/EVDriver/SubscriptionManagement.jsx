import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useSubscription from '@/hooks/useSubscription';
import SubscriptionCard from '@/components/Subscription/SubscriptionCard';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Package } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router';

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  // local dialog state removed - using hook's confirmCancel instead

  const {
    subscriptions,
    loading,
    error,
    message,
    confirmCancel,
    fetchSubscriptions,
    handleCancel,
    executeCancel,
    getDaysRemaining,
    getStatusColor,
    setConfirmCancel
  } = useSubscription();

  // active subscriptions 
  const activeSubscriptions = subscriptions.filter(
    (s) => String(s?.status).toLowerCase() === 'active'
  );




  // dialog state handled by the useSubscription hook (confirmCancel)

  // const handleCancelClick = (subscriptionId) => {
  //   setDeleteSubId(subscriptionId);
  //   setShowDeleteSubDialog(true);
  // };

  // const confirmDelete = async () => {
  //   await handleCancel(deleteSubId);
  //   setShowDeleteSubDialog(false);
  //   setDeleteSubId(null);
  // };

  // const handleRenewalClick = (subscription) => {
  //   setSelectedSubscription(subscription);
  //   setShowDeleteSubDialog
  // };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className='mb-6 hover:bg-white/60 transition-all duration-200'
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back To Dashboard
          </Button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Subscription Management
                </h1>
                <p className="text-slate-600 mt-1 text-lg">
                  Mange your active subscriptions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message?.text && (
          <div className={`mb-8 p-5 rounded-xl flex items-start space-x-4 backdrop-blur-sm border shadow-md transition-all duration-300 ${message.type === 'success'
            ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200'
            : 'bg-red-50/90 text-red-900 border-red-200'
            }`}>
            <div
              className={`p-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <p className="font-medium">{message.text}</p>
          </div>
        )}


        {/* Error State */}
        {error && !loading && (
          <Card className="border-red-200/60 bg-red-50/80 backdrop-blur-sm shadow-md">
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-3">
                Failed to load subscriptions
              </h3>
              <p className="text-red-600 mb-6">{error.message}</p>
              <Button
                variant="outline"
                onClick={fetchSubscriptions}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}


        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
              <p className="text-slate-600 font-medium text-lg">
                Loading subcriptions....
              </p>
            </div>
          </div>
        )}


        {/* Subscription List */}
        {!loading && !error && (
          <>
            {activeSubscriptions.length === 0 ? (
              <Card className="border-slate-200/60 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <Package className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    No Active Subscriptions
                  </h3>
                  <p className="text-slate-600 mb-8 text-lg">
                    You don't have any subscriptions yet. Subscribe to a plan to get started!
                  </p>
                  <Button
                    onClick={() => navigate('/services')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Browse Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
                <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Your Subscriptions <span className="text-slate-500 font-normal">({activeSubscriptions.length})</span>
                  </h2>
                </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeSubscriptions.map((subscription) => (
                            <SubscriptionCard
                              key={subscription.subscription_id}
                              subscription={subscription}
                              onCancel={handleCancel}
                              getDaysRemaining={getDaysRemaining}
                              getStatusColor={getStatusColor}
                              isCanceling={confirmCancel?.subscription?.subscription_id === subscription.subscription_id}
                            />
                          ))}
                        </div>
              </div>
            )}
          </>
        )}

        {/* Cancel Confirm Dialog */}
        <Dialog
          open={confirmCancel?.show}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmCancel({ show: false, subscription: null });
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                Confirm Cancel
              </DialogTitle>
              <DialogDescription className="text-center text-base text-slate-600">
                Are you sure you want to cancel subscription for <strong className="text-slate-900">{confirmCancel?.subscription?.vehicle?.license_plate}</strong>? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 hover:bg-slate-50"
                onClick={() => setConfirmCancel({ show: false, subscription: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                onClick={executeCancel}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
