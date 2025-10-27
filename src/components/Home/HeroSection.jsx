import React from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
    Battery,
    MapPin,
    Clock,
    Shield,
    Zap,
    Motorbike,
    ArrowRight,
    Star,
    Users
} from 'lucide-react';

const HeroSection = () => {
    const features = [
        {
            icon: <Battery className="h-6 w-6" />,
            title: "Fast Battery Swap",
            description: "Only takes 3-5 minutes to swap batteries, saving travel time"
        },
        {
            icon: <MapPin className="h-6 w-6" />,
            title: "Wide Network Coverage",
            description: "Over 100 battery swap stations across the city"
        },
        {
            icon: <Clock className="h-6 w-6" />,
            title: "24/7 Operation",
            description: "Serving anytime, anywhere without interruption"
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Absolute Safety",
            description: "Batteries are quality tested and regularly maintained"
        }
    ];

    const stats = [
        { number: "10,000+", label: "Trusted Customers" },
        { number: "50,000+", label: "Battery Swaps/Month" },
        { number: "99.5%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Customer Support" }
    ];

    return (
        <section className="relative bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-blue-950/20 dark:via-background dark:to-green-950/20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] -z-10" />

            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Battery className="h-8 w-8 text-primary" />
                                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    EVSwap - Green Future
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                                Electric Vehicle Battery Swap
                                <span className="text-primary block">fast & convenient</span>
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Vietnam's leading electric motorcycle battery swap station management system.
                                The perfect solution for green and sustainable mobility needs.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild className="text-lg px-8 py-6">
                                <Link to="/register">
                                    <Zap className="mr-2 h-5 w-5" />
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                                <Link to="/stations">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Find Nearest Station
                                </Link>
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl lg:text-3xl font-bold text-primary">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Hero Image/Cards */}
                    <div className="relative">
                        {/* Main Card */}
                        <Card className="relative z-10 shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Motorbike className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">ABC Station - District 1</h3>
                                                <p className="text-sm text-muted-foreground">2.3 km away</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">4.8</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">(127 reviews)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Battery className="h-5 w-5 text-green-600" />
                                                <span className="font-medium">Battery Type 1</span>
                                            </div>
                                            <div className="text-green-600 font-semibold">
                                                15 batteries ready
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Battery className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium">Battery Type 2</span>
                                            </div>
                                            <div className="text-blue-600 font-semibold">
                                                8 batteries ready
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full" size="lg">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Schedule Battery Swap
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-500/20 rounded-full blur-xl" />
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 bg-card/60 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
