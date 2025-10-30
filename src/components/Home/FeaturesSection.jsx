import React from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
    Smartphone,
    CreditCard,
    Calendar,
    MapPin,
    Battery,
    Shield,
    Clock,
    Users,
    TrendingUp,
    Award
} from 'lucide-react';

const FeaturesSection = () => {
    const driverFeatures = [
        {
            icon: <Smartphone className="h-8 w-8" />,
            title: "Account Management",
            description: "Register and manage personal information, easily link vehicles",
            features: ["Account registration", "Vehicle VIN linking", "Update information", "2FA security"]
        },
        {
            icon: <MapPin className="h-8 w-8" />,
            title: "Station Search",
            description: "Find the nearest battery swap station with integrated Google Maps API",
            features: ["Find nearest station", "View battery status", "Rate station", "Usage history"]
        },
        {
            icon: <Calendar className="h-8 w-8" />,
            title: "Schedule in Advance",
            description: "Schedule battery swaps to ensure full batteries when needed",
            features: ["Flexible scheduling", "Smart reminders", "Cancel/reschedule", "Booking history"]
        },
        {
            icon: <CreditCard className="h-8 w-8" />,
            title: "Flexible Payment",
            description: "Pay for battery rental packages with multiple payment methods",
            features: ["Diverse rental packages", "Automatic payment", "Electronic invoices", "Cost tracking"]
        },
        {
            icon: <Battery className="h-8 w-8" />,
            title: "Battery Tracking",
            description: "Track battery status, swap frequency and usage costs",
            features: ["SoH tracking", "Swap history", "Usage statistics", "Cost prediction"]
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "24/7 Support",
            description: "Professional support team, ready to answer all questions",
            features: ["Live chat", "24/7 hotline", "Issue reporting", "Quick response"]
        }
    ];

    const stats = [
        { icon: <Users className="h-6 w-6" />, value: "10,000+", label: "Registered Drivers" },
        { icon: <Battery className="h-6 w-6" />, value: "50,000+", label: "Battery Swaps/Month" },
        { icon: <MapPin className="h-6 w-6" />, value: "100+", label: "Swap Stations" },
        { icon: <TrendingUp className="h-6 w-6" />, value: "99.5%", label: "Satisfaction Rate" }
    ];

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">
                        <Award className="mr-2 h-4 w-4" />
                        Featured Features
                    </Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                        Everything you need for
                        <span className="text-primary block">electric vehicle management</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Battery swap station management system specially designed for electric vehicle drivers,
                        delivering the most optimal and convenient user experience.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {driverFeatures.map((feature, index) => (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/30">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    {/* Icon */}
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <div className="text-primary">
                                            {feature.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>

                                        {/* Feature List */}
                                        <ul className="space-y-2">
                                            {feature.features.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-primary/5 via-background to-green-500/5 dark:from-primary/10 dark:via-background dark:to-green-500/10 rounded-3xl p-8 lg:p-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <div className="text-primary">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-muted-foreground font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-foreground">
                            Ready to experience the future?
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Join the smart electric vehicle driver community and experience
                            Vietnam's most convenient battery swap service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="text-lg px-8">
                                <Link to="/register">
                                    <Smartphone className="mr-2 h-5 w-5" />
                                    Sign Up Now
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-lg px-8">
                                <Link to="/services">
                                    <Clock className="mr-2 h-5 w-5" />
                                    View Services
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
