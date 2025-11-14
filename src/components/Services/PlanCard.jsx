import React from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Battery, Check, Star, Zap } from 'lucide-react';

export default function PlanCard({ plan, onSelect, formatPrice, formatPercent }) {
    const isUnlimited = true;

    return (
        <div className={`group flex flex-col ${isUnlimited ? 'border-slate-200/60' : 'border-blue-200/60'} shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1`}>
            <CardHeader className="text-center pb-4 flex-shrink-0">
                <div className={`mx-auto mb-3 w-14 h-14 ${isUnlimited ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300`}>
                    {isUnlimited ? (
                        <Star className="h-7 w-7 text-white" />
                    ) : (
                        <Battery className="h-7 w-7 text-white" />
                    )}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                    {plan.plan_name}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 mt-2 min-h-[40px]">
                    {plan.description}
                </CardDescription>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mt-4">
                    {formatPrice(plan.plan_fee)}/month
                </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-grow flex flex-col">
                <ul className="space-y-3 flex-grow">
                    <li className="flex items-center space-x-3">
                        <div className={`p-1 ${isUnlimited ? 'bg-emerald-100' : 'bg-blue-100'} rounded-lg`}>
                            <Check className={`h-5 w-5 ${isUnlimited ? 'text-emerald-600' : 'text-blue-600'} flex-shrink-0`} />
                        </div>
                        <span className="text-sm text-slate-700">
                            Duration: <strong>{plan.duration_days} days</strong>
                        </span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <div className={`p-1 ${isUnlimited ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-lg`}>
                            {isUnlimited ? (
                                <Star className="h-5 w-5 text-white flex-shrink-0" />
                            ) : (
                                <Battery className="h-5 w-5 text-white flex-shrink-0" />
                            )}
                        </div>
                        <span className={`text-sm font-semibold ${isUnlimited ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {isUnlimited
                                ? 'Unlimited battery swaps'
                                : `${formatPrice(plan.swap_fee)}/swap`
                            }
                        </span>
                    </li>
                </ul>

                <div className="flex justify-center pt-4">
                    <Button
                        size="lg"
                        className={`w-full ${isUnlimited
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                            } shadow-md hover:shadow-lg transition-all duration-200`}
                        onClick={() => onSelect(plan)}
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        Choose This Plan
                    </Button>
                </div>
            </CardContent>
        </div>
    )
}
