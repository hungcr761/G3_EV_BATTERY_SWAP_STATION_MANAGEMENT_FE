import React from 'react';
import { Link } from 'react-router';
import { Battery } from 'lucide-react';
import { Badge } from '../ui/badge';

const SimpleHeader = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <Battery className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">EVSwap</span>
                        <Badge variant="secondary" className="text-xs">
                            Beta
                        </Badge>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default SimpleHeader;
