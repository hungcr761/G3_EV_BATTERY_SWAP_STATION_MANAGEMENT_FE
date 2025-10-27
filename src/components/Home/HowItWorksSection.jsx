import React from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
    UserPlus,
    MapPin,
    Calendar,
    Battery,
    CreditCard,
    ArrowRight,
    CheckCircle,
    Star
} from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            step: "01",
            icon: <UserPlus className="h-8 w-8" />,
            title: "Create Account",
            description: "Create an account and link your vehicle with VIN",
            details: [
                "Register personal information",
                "Link vehicle VIN to account",
                "Choose suitable service package",
                "Verify account"
            ],
            color: "from-blue-500 to-blue-600"
        },
        {
            step: "02",
            icon: <MapPin className="h-8 w-8" />,
            title: "Find Swap Station",
            description: "Search for the nearest battery swap station with available batteries",
            details: [
                "Use Google Maps API",
                "View real-time battery status",
                "Read user reviews",
                "Calculate travel time"
            ],
            color: "from-green-500 to-green-600"
        },
        {
            step: "03",
            icon: <Calendar className="h-8 w-8" />,
            title: "Schedule Battery Swap",
            description: "Schedule in advance to ensure full batteries when you arrive",
            details: [
                "Choose suitable time",
                "Confirm battery type needed",
                "Receive reminder notifications",
                "Can cancel/reschedule"
            ],
            color: "from-purple-500 to-purple-600"
        },
        {
            step: "04",
            icon: <Battery className="h-8 w-8" />,
            title: "Swap at Station",
            description: "Go to station and perform quick battery swap",
            details: [
                "Scan QR code to authenticate",
                "Automatic battery swap in 3-5 minutes",
                "Check new battery status",
                "Receive electronic receipt"
            ],
            color: "from-orange-500 to-orange-600"
        },
        {
            step: "05",
            icon: <CreditCard className="h-8 w-8" />,
            title: "Automatic Payment",
            description: "System automatically calculates and charges according to package",
            details: [
                "Calculate fees by delta SoH",
                "Deduct from free allowance",
                "Automatic payment at month end",
                "Receive detailed invoice"
            ],
            color: "from-red-500 to-red-600"
        }
    ];

    const benefits = [
        {
            icon: <CheckCircle className="h-6 w-6" />,
            title: "Save Time",
            description: "Only takes 3-5 minutes to swap batteries instead of 2-4 hours charging"
        },
        {
            icon: <Star className="h-6 w-6" />,
            title: "Save Money",
            description: "Reasonable costs with flexible service packages"
        },
        {
            icon: <MapPin className="h-6 w-6" />,
            title: "Convenient Anytime",
            description: "Wide network coverage, operating 24/7"
        },
        {
            icon: <Battery className="h-6 w-6" />,
            title: "Absolute Safety",
            description: "Batteries are quality tested and regularly maintained"
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-muted/30 to-blue-50 dark:from-muted/10 dark:to-blue-950/10">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                        How it works
                        <span className="text-primary block">simple & efficient</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        With just 5 simple steps, you can start using the battery swap service
                        and experience the future of green mobility.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-12 mb-16">
                    {steps.map((step, index) => (
                        <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Content */}
                            <div className={`order-2 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
                                <Card className="h-full border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-8">
                                        <div className="space-y-6">
                                            {/* Step Number & Icon */}
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
                                                    {step.step}
                                                </div>
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                    <div className="text-primary">
                                                        {step.icon}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title & Description */}
                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-bold text-foreground">
                                                    {step.title}
                                                </h3>
                                                <p className="text-muted-foreground text-lg leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>

                                            {/* Details */}
                                            <ul className="space-y-3">
                                                {step.details.map((detail, detailIndex) => (
                                                    <li key={detailIndex} className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                                        <span className="text-muted-foreground">{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA for first step */}
                                            {index === 0 && (
                                                <div className="pt-4">
                                                    <Button size="lg" asChild>
                                                        <Link to="/register">
                                                            Get Started Now
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Visual */}
                            <div className={`order-1 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
                                <div className="relative">
                                    <div className={`w-full h-80 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center`}>
                                        <div className="text-white text-8xl opacity-20">
                                            {step.icon}
                                        </div>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-background/20 rounded-full blur-xl" />
                                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-background/10 rounded-full blur-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits Section */}
                <div className="bg-card rounded-3xl p-8 lg:p-12 shadow-xl">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                            Benefits of using EVSwap
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            More than just battery swapping, EVSwap brings you
                            a completely new mobility experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <div className="text-primary">
                                                {benefit.icon}
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-foreground">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
