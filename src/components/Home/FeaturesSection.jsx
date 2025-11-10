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
    return (
        <section className="py-24 bg-white dark:bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                
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
