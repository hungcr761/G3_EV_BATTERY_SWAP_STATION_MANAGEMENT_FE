import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
    MessageCircle,
    Phone,
    Mail,
    MapPin,
    Clock,
    HelpCircle,
    FileText,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Support = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        issueType: '',
        priority: 'low',
        description: ''
    });

    const faqs = [
        {
            question: 'How do I swap batteries at the station?',
            answer: 'Scan the QR code at the station, the system will automatically swap batteries in 3-5 minutes.'
        },
        {
            question: 'Can I cancel my scheduled appointment?',
            answer: 'Yes, you can cancel your appointment up to 2 hours in advance without any charges.'
        },
        {
            question: 'How do I track my usage costs?',
            answer: 'Go to Dashboard > Transaction History to view detailed costs.'
        },
        {
            question: 'Are batteries insured?',
            answer: 'All batteries are fully insured, including damage and loss coverage.'
        }
    ];

    const contactMethods = [
        {
            icon: <Phone className="h-6 w-6" />,
            title: '24/7 Hotline',
            description: '',
            action: 'Call Now'
        },
        {
            icon: <Mail className="h-6 w-6" />,
            title: 'Support Email',
            description: '',
            action: 'Send Email'
        },
        {
            icon: <MessageCircle className="h-6 w-6" />,
            title: 'Live Chat',
            description: 'Instant support',
            action: 'Start Chat'
        }
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Customer Support
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            We are always ready to support you 24/7
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Methods */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Direct Contact</CardTitle>
                                    <CardDescription>
                                        Choose the contact method that works best for you
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {contactMethods.map((method, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <div className="text-primary">
                                                        {method.icon}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{method.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{method.description}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                {method.action}
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Address</p>
                                            <p className="text-sm text-muted-foreground">
                                                123 ABC Street, XYZ District, HCMC
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Working Hours</p>
                                            <p className="text-sm text-muted-foreground">
                                                24/7 - Non-stop support
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* FAQ and Support Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* FAQ */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <HelpCircle className="mr-2 h-5 w-5" />
                                        Frequently Asked Questions
                                    </CardTitle>
                                    <CardDescription>
                                        Find answers to common questions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-2">{faq.question}</h4>
                                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Support Request Form */}
                            <Card>
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
                                    <form 
                                        className="space-y-4"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!isAuthenticated) {
                                                navigate('/login');
                                                return;
                                            }
                                            // Handle form submission here
                                            console.log('Form submitted:', formData);
                                            // You can add API call here
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Issue Type
                                                </label>
                                                <select 
                                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                    value={formData.issueType}
                                                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                                >
                                                    <option value="">Select issue type</option>
                                                    <option value="technical">Technical Issue</option>
                                                    <option value="billing">Billing Issue</option>
                                                    <option value="booking">Booking Issue</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Priority Level
                                                </label>
                                                <select 
                                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Detailed Description
                                            </label>
                                            <textarea
                                                className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background"
                                                placeholder="Describe the issue you're experiencing in detail..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full">
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Submit Support Request
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
