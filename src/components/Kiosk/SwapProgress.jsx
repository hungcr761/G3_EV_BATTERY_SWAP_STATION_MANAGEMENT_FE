import React from 'react';
import { Battery, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const SwapProgress = ({ currentStep, steps }) => {
    const getStepIcon = (stepIndex, status) => {
        if (status === 'completed') {
            return <CheckCircle2 className="h-12 w-12 text-green-500" />;
        } else if (status === 'in_progress') {
            return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
        } else {
            return <Circle className="h-12 w-12 text-gray-300" />;
        }
    };

    return (
        <div className="space-y-6">
            {steps.map((step, index) => (
                <Card
                    key={index}
                    className={`transition-all ${step.status === 'in_progress'
                            ? 'border-4 border-primary shadow-xl scale-105'
                            : step.status === 'completed'
                                ? 'border-2 border-green-500 bg-green-50'
                                : 'border-2 border-gray-200'
                        }`}
                >
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-6">
                            {/* Step Number/Icon */}
                            <div className="flex-shrink-0">
                                {getStepIcon(index, step.status)}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-2xl font-bold">{step.title}</h3>
                                    {step.status === 'in_progress' && (
                                        <Badge variant="default" className="text-lg px-3 py-1">
                                            Đang xử lý
                                        </Badge>
                                    )}
                                    {step.status === 'completed' && (
                                        <Badge variant="outline" className="text-lg px-3 py-1 bg-green-100 text-green-800 border-green-300">
                                            Hoàn thành
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xl text-muted-foreground">
                                    {step.description}
                                </p>

                                {/* Progress indicator for in-progress steps */}
                                {step.status === 'in_progress' && step.progress !== undefined && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-lg font-medium">Tiến độ</span>
                                            <span className="text-lg font-bold">{step.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className="bg-primary h-4 rounded-full transition-all duration-500"
                                                style={{ width: `${step.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Estimated time */}
                                {step.status === 'in_progress' && step.estimatedTime && (
                                    <p className="text-lg text-muted-foreground mt-3">
                                        Ước tính: {step.estimatedTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default SwapProgress;

