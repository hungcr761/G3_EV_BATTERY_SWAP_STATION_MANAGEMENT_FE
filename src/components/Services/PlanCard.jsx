import { Button, Card } from '@radix-ui/themes';
import React from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Battery, Check, Star, Zap } from 'lucide-react';

export default function PlanCard({ plan, onSelect, formatPrice, formatPercent }) {
    const isUnlimited = parseFloat(plan.swap_fee) === 0;

    return (
        <Card
            className={`group flex flex-col border-slate-200/60 shadow-md hover:shadow-xl 
                transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1 
                ${!isUnlimited ? 'border-blue-200' : ''}`}
        >
            <CardHeader className="text-center pb-4 flex-shrink-0">
                <CardTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r 
                    from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {plan.plan_name}
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm text-slate-600 mt-2 min-h-[40px]">
                    {plan.description}
                </CardDescription>

                {/* Price */}
                {!isUnlimited ? (
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r 
                        from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-4">
                        {formatPrice(plan.plan_fee)}/month
                    </div>
                ) : (
                    <div className="mt-4 space-y-1">
                        <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r 
                            from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatPrice(plan.plan_fee)}/month
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {/* Feature List */}
                <ul className="space-y-3 flex-grow">
                    <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <span className="text-xs lg:text-sm text-slate-700 font-medium">
                            SoH Cap: {formatPercent(plan.soh_cap)} %
                        </span>
                    </li>
                    <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <span className="text-xs lg:text-sm text-slate-700 font-medium">
                            Penalty Fee: {formatPrice(plan.penalty_fee)} / %
                        </span>
                    </li>
                    <li className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <span className="text-xs lg:text-sm text-slate-700 font-medium">
                            Duration Day: {plan.duration_days} days
                        </span>
                    </li>
                    <li className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 
                        to-teal-50 p-3 rounded-lg border border-emerald-200">
                        <div className={`p-1.5 rounded-lg ${isUnlimited ? 'bg-amber-100' : 'bg-blue-100'
                            }`}>
                            {isUnlimited ? (
                                <Star className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 flex-shrink-0" />
                            ) : (
                                <Battery className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0" />
                            )}
                        </div>
                        <span className={`text-xs lg:text-sm font-semibold ${isUnlimited ? 'text-emerald-700' : 'text-blue-700'
                            }`}>
                            {isUnlimited
                                ? 'Unlimited Swaps'
                                : `Penalty fee: ${formatPrice(plan.swap_fee)}/swap`
                            }
                        </span>
                    </li>
                </ul>

                <div className="flex justify-center pt-4">
                    <Button
                        size="lg"
                        className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600
                            hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700
                            text-white font-semibold shadow-lg shadow-blue-500/30
                            transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]"
                        onClick={() => onSelect(plan)}
                    >
                        <Zap className="mr-2 h-4 w-4 animate-pulse" />
                        Select Plan
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
