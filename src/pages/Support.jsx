import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Support = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    issueType: '',
    priority: 'low',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issueType || !formData.description) return;
    console.log('Submit:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Support Center
          </h1>
          <p className="text-slate-600">
            Submit your issues and track support tickets
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <p>{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Ticket Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Submit Support Request
                </CardTitle>
                <CardDescription>
                  Describe the issue you're experiencing in detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Issue Type</Label>
                    <select
                      id="subject"
                      value={formData.issueType}
                      onChange={(e) =>
                        setFormData({ ...formData, issueType: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select issue type</option>
                      <option value="station_issue">Station Issue</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="battery_issue">Battery Issue</option>
                      <option value="account_issue">Account Issue</option>
                      <option value="vehicle_issue">Vehicle Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tickets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>Track your submitted tickets</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No tickets found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => {
                      const isResolved = ticket.status === 'resolved';
                      const isClosed = ticket.status === 'closed';
                      return (
                        <div
                          key={ticket.ticket_id}
                          className="border border-slate-200/60 rounded-lg p-4 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
                        >
                          <div className="bg-slate-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-slate-700">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Created</p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {new Date(ticket.create_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {ticket.resolve_date && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-emerald-500" />
                                <div>
                                  <p className="text-xs text-slate-500">Resolved</p>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {new Date(ticket.resolve_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {isResolved && !isClosed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => console.log('Close ticket')}
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Closed
                            </Button>
                          )}

                          {isClosed && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <p className="text-sm font-medium text-emerald-700">
                                This ticket has been closed
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
