import React from 'react';
import {
    Battery,
    MapPin,
    Clock,
    Shield,
    Zap,
    ArrowRight,
    Star,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router';

const HeroSection = () => {

    const highlights = [
        "Fast Battery Swap - Only takes 3-5 minutes to swap batteries, saving travel time",
        "Wide Network Coverage - Over 8 battery swap stations across Ho Chi Minh City",
        "24/7 Operation - Serving anytime, anywhere without interruption",
        "Absolute Safety - Batteries are quality tested and regularly maintained"
    ];

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <Battery className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-700 dark:text-blue-300">EVSwap - Green Future</span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-6">
                            <h1 className="text-5xl lg:text-7xl tracking-tight">
                                Electric Vehicle Battery Swap
                                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                                    fast & convenient
                                </span>
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                                Vietnam's leading electric motorcycle battery swap station management system.
                                The perfect solution for green and sustainable mobility needs.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register">
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/20 group">
                                    <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/booking">
                                <Button size="lg" variant="outline" className="border-2 hover:bg-muted">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Find Nearest Station
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Content - Visual Elements */}
                    <div className="relative lg:flex hidden items-center justify-center">
                        {/* Decorative Circles */}
                        <div className="relative w-full h-[500px]">
                            {/* Main Circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
                            </div>

                            {/* Floating Icons */}
                            <div className="absolute top-10 left-10 w-20 h-20 bg-white dark:bg-card rounded-2xl shadow-xl flex items-center justify-center animate-bounce border border-border/50">
                                <Battery className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div className="absolute top-20 right-10 w-16 h-16 bg-white dark:bg-card rounded-2xl shadow-xl flex items-center justify-center animate-pulse border border-border/50">
                                <Zap className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                            </div>

                            <div className="absolute bottom-32 left-16 w-24 h-24 bg-white dark:bg-card rounded-2xl shadow-xl flex items-center justify-center animate-pulse delay-300 border border-border/50">
                                <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div className="absolute bottom-20 right-20 w-18 h-18 bg-white dark:bg-card rounded-2xl shadow-xl flex items-center justify-center animate-bounce delay-500 border border-border/50 p-4">
                                <Clock className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                            </div>

                            {/* Center Badge */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 shadow-2xl">
                                    <div className="text-center text-white space-y-2">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <Battery className="h-8 w-8" />
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <div className="text-4xl">3-5min</div>
                                        <div className="text-sm opacity-90">Fast Swap</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Rings */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-blue-500/20 rounded-full animate-ping" />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-cyan-500/20 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Highlights Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {highlights.map((highlight, index) => {
                        const [title, description] = highlight.split(' - ');
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-blue-500/50 transition-colors"
                            >
                                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold mb-1">{title}</h4>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
