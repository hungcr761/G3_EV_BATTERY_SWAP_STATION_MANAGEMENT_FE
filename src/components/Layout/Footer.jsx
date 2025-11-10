import React from 'react';
import { Link } from 'react-router';
import { Battery, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-100 relative z-0">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Battery className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">EVSwap</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                            Vietnam's leading electric motorcycle battery swap station management system.
                            Convenient solution for a green future.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                            <Twitter className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                            <Instagram className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/stations" className="text-slate-300 hover:text-primary transition-colors">
                                    Find Swap Station
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="text-slate-300 hover:text-primary transition-colors">
                                    Service Packages
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-slate-300 hover:text-primary transition-colors">
                                    Book Appointment
                                </Link>
                            </li>
                            <li>
                                <Link to="/support" className="text-slate-300 hover:text-primary transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-slate-300">Fast Battery Swap</li>
                            <li className="text-slate-300">Battery Rental Packages</li>
                            <li className="text-slate-300">Battery Maintenance</li>
                            <li className="text-slate-300">24/7 Support</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="text-slate-300">
                                    123 ABC Street, XYZ District, HCMC
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-primary" />
                                <span className="text-slate-300">1900 1234</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="text-slate-300">support@evswap.vn</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-700 mt-8 pt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        © 2024 EVSwap. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
