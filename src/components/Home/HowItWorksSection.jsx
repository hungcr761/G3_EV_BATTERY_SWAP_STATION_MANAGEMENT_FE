import React from 'react';
import {
    UserPlus,
    MapPin,
    Calendar,
    Battery,
    CreditCard,
    ArrowRight,
    CheckCircle,
    Star,
    Clock,
    Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router';

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
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500"
        },
        {
            step: "02",
            icon: <MapPin className="h-8 w-8" />,
            title: "Find Swap Station",
            description: "Search for the nearest battery swap station with available batteries",
            details: [
                "Intergrated map view",
                "View battery status at stations",
                "View station address",
            ],
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500"
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
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500"
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
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-500"
        },
        {
            step: "05",
            icon: <CreditCard className="h-8 w-8" />,
            title: "Payment",
            description: "System automatically calculates and charges according to package",
            details: [
                "Calculate fees by delta SoH",
                "Deduct from free allowance",
                "Automatic notify payment at month end",
                "Receive detailed invoice"
            ],
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-500"
        }
    ];

    const benefits = [
        {
            icon: <Clock className="h-6 w-6" />,
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
        <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-background dark:via-slate-950/20 dark:to-background overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <Badge variant="secondary" className="mb-4 px-4 py-2">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Simple Process
                    </Badge>
                    <h2 className="text-4xl lg:text-6xl mb-6">
                        How it works
                        <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                            simple & efficient
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        With just 5 simple steps, you can start using the battery swap service
                        and experience the future of green mobility.
                    </p>
                </div>

                {/* Timeline Steps */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-red-500 transform -translate-x-1/2" />

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Step Number Circle */}
                                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                                        <span className="text-white text-xl">{step.step}</span>
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 0 ? '' : 'lg:grid-flow-dense'}`}>
                                    {/* Text Content */}
                                    <div className={`${index % 2 === 0 ? 'lg:text-right lg:pr-20' : 'lg:col-start-2 lg:pl-20'}`}>
                                        <div className="inline-block lg:hidden mb-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white`}>
                                                {step.step}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl mb-3">{step.title}</h3>
                                        <p className="text-lg text-muted-foreground mb-6">
                                            {step.description}
                                        </p>

                                        <ul className={`space-y-2 ${index % 2 === 0 ? 'lg:items-end' : ''}`}>
                                            {step.details.map((detail, detailIndex) => (
                                                <li key={detailIndex} className={`flex items-center gap-2 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                                                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                    <span className="text-muted-foreground">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {index === 0 && (
                                            <div className={`mt-6 ${index % 2 === 0 ? 'lg:flex lg:justify-end' : ''}`}>
                                                <Link to="/register">
                                                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                                                        Get Started Now
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Icon Card */}
                                    <div className={`${index % 2 === 0 ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'}`}>
                                        <div className="relative group">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                                            <div className="relative bg-white dark:bg-card rounded-3xl p-8 border border-border shadow-xl">
                                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                                                    {step.icon}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className={`inline-block px-3 py-1 ${step.bgColor}/10 rounded-full`}>
                                                        <span className={`text-sm ${step.bgColor.replace('bg-', 'text-')}`}>
                                                            Step {step.step}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl">{step.title}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-3xl" />
                    <div className="relative bg-white/50 dark:bg-card/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-border shadow-xl">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl lg:text-4xl mb-4">
                                Benefits of using EVSwap
                            </h3>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                More than just battery swapping, EVSwap brings you
                                a completely new mobility experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white dark:bg-card p-6 rounded-2xl border border-border hover:border-blue-500/50 transition-all hover:shadow-lg"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative space-y-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <div className="text-blue-600 dark:text-blue-400">
                                                {benefit.icon}
                                            </div>
                                        </div>
                                        <h4 className="font-semibold">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
