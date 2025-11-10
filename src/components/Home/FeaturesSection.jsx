import React from 'react';
import {
    Smartphone,
    CreditCard,
    Calendar,
    MapPin,
    Battery,
    Shield,
    Clock,
    Award,
    Zap,
    ArrowRight
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router';

const FeaturesSection = () => {
    const driverFeatures = [
        {
            icon: <Smartphone className="h-8 w-8" />,
            title: "Account Management",
            description: "Register and manage personal information, easily link vehicles",
            features: ["Account registration", "Vehicle VIN linking", "Update information"],
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-blue-500/10"
        },
        {
            icon: <MapPin className="h-8 w-8" />,
            title: "Station Search",
            description: "Find the nearest battery swap station with integrated Google Maps API",
            features: ["Find nearest station", "View battery status", "Usage history"],
            gradient: "from-emerald-500 to-teal-500",
            iconBg: "bg-emerald-500/10"
        },
        {
            icon: <Calendar className="h-8 w-8" />,
            title: "Schedule in Advance",
            description: "Schedule battery swaps to ensure full batteries when needed",
            features: ["Flexible scheduling", "Cancel/reschedule", "Booking history"],
            gradient: "from-purple-500 to-pink-500",
            iconBg: "bg-purple-500/10"
        },
        {
            icon: <CreditCard className="h-8 w-8" />,
            title: "Payments & Subscription Plans",
            description: "Support pay-per-swap or battery rental plans, online payments and invoice management.",
            features: [
                "Pay per swap or rent-by-plan options",
                "Online payments (Momo payment gateway)",
                "Manage invoices and transaction history"
            ],
            gradient: "from-orange-500 to-red-500",
            iconBg: "bg-orange-500/10"
        },
        {
            icon: <Battery className="h-8 w-8" />,
            title: "Battery Tracking",
            description: "Track battery status, swap frequency and usage costs",
            features: ["SoH tracking", "Swap history", "Usage statistics"],
            gradient: "from-green-500 to-emerald-500",
            iconBg: "bg-green-500/10"
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "24/7 Support",
            description: "Professional support team, ready to answer all questions",
            features: ["24/7 hotline", "Issue reporting", "Quick response"],
            gradient: "from-indigo-500 to-blue-500",
            iconBg: "bg-indigo-500/10"
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4 px-4 py-2">
                        <Award className="mr-2 h-4 w-4" />
                        Featured Features
                    </Badge>
                    <h2 className="text-4xl lg:text-6xl mb-6">
                        Everything you need for
                        <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                            electric vehicle management
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Battery swap station management system specially designed for electric vehicle drivers,
                        delivering the most optimal and convenient user experience.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {driverFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-slate-950/50 rounded-3xl p-8 border border-border hover:border-transparent transition-all duration-300 hover:shadow-2xl overflow-hidden"
                        >
                            {/* Gradient Border on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl`} />

                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="relative space-y-6">
                                {/* Icon */}
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                                    <div className={`relative w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <div className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h3 className="text-xl">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Feature List */}
                                    <ul className="space-y-2 pt-2">
                                        {feature.features.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start text-sm text-muted-foreground">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 bg-gradient-to-r ${feature.gradient} flex-shrink-0`} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Hover Arrow */}
                                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className={`inline-flex items-center text-sm bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                                        Learn more
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-10" />
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-3xl p-12 border border-border">
                        <div className="text-center space-y-8">
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                                <Zap className="h-8 w-8 text-white" />
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h3 className="text-3xl lg:text-4xl">
                                    Ready to experience the future?
                                </h3>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Join the smart electric vehicle driver community and experience
                                    Vietnam's most convenient battery swap service.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link to="/register">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg group"
                                    >
                                        <Smartphone className="mr-2 h-5 w-5" />
                                        Sign Up Now
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/services">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 hover:bg-white dark:hover:bg-card"
                                    >
                                        <Clock className="mr-2 h-5 w-5" />
                                        View Services
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span>Secure & Safe</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span>Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
