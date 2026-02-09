
"use client";
import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

export default function DetailedFooter() {
    return (
        <footer className="pt-24 pb-12 bg-black border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Info */}
                    <div className="col-span-1 lg:col-span-1">
                        <Logo size={48} variant="color" className="mb-8" />
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Empowering businesses with enterprise-grade WhatsApp automation. Scalable, secure, and officially powered by Meta Cloud API.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 hover:text-wa-green hover:bg-wa-green/10 transition-all border border-slate-800">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Menus */}
                    <div>
                        <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-8">Platform</h4>
                        <ul className="space-y-4">
                            {['Flow Builder', 'Bulk Broadcast', 'Live Chat', 'AI Training', 'API Documentation'].map((item, i) => (
                                <li key={i}><Link href="#" className="text-slate-500 hover:text-white text-sm transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-8">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="/how-to-use" className="text-slate-500 hover:text-white text-sm transition-colors">How to Use</Link></li>
                            {['Success Stories', 'Affiliate Program', 'Pricing', 'Terms of Service', 'Privacy Policy'].map((item, i) => (
                                <li key={i}><Link href="#" className="text-slate-500 hover:text-white text-sm transition-colors">{item}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-8">Get in Touch</h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-center text-slate-500 text-sm">
                                <Mail size={16} className="text-wa-green" /> admin@grekam.in
                            </li>
                            <li className="flex gap-3 items-center text-slate-500 text-sm">
                                <Phone size={16} className="text-wa-green" /> +91 9789359407
                            </li>
                            <li className="flex gap-3 items-center text-slate-500 text-sm">
                                <MapPin size={16} className="text-wa-green" /> Bangalore, India
                            </li>
                        </ul>
                        <div className="mt-8 p-6 rounded-3xl bg-wa-green/5 border border-wa-green/10">
                            <div className="text-wa-green font-bold text-xs mb-2">Subscribe to our News</div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Email" className="bg-black border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-wa-green w-full" />
                                <button className="bg-wa-green text-white p-2 rounded-lg"><Mail size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} WAVO Global Platforms. All rights reserved.
                    </div>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Security</Link>
                        <Link href="#" className="hover:text-white transition-colors">GDPR</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
