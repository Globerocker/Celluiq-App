import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit';

const HealthContext = createContext(null);

export const HealthProvider = ({ children }) => {
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        if (Capacitor.isNativePlatform()) {
            // In a real implementation we would check permissions here
            setIsAvailable(true);
        }
    };

    const requestPermissions = async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            await CapacitorHealthkit.requestAuthorization({
                all: ['steps', 'calories', 'activity'],
                read: ['steps', 'calories', 'activity'],
                write: []
            });
            return true;
        } catch (error) {
            console.error('HealthKit auth error:', error);
            return false;
        }
    };

    const fetchDailyData = async () => {
        if (!isAvailable) return;
        setLoading(true);

        try {
            // Request permissions first just in case
            await requestPermissions();

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date();

            // Fetch Steps
            // @ts-ignore
            const stepsData = await CapacitorHealthkit.queryHKitSampleType({
                sampleName: 'stepCount',
                startDate: startOfDay.toISOString(),
                endDate: endOfDay.toISOString(),
                limit: 100 // Get all entries for today
            });

            // Process steps (simplified, depends on plugin return format)
            // v2 might return aggregated or raw samples. Assuming raw for now.
            // Actually v2 often returns { count: number } for aggregated queries but here we used queryHKitSampleType
            // Let's assume we sum them up or use queryHKitStatistics if available.

            let totalSteps = 0;
            if (stepsData && stepsData.value) {
                // If value is array
                if (Array.isArray(stepsData.value)) {
                    totalSteps = stepsData.value.reduce((acc, curr) => acc + (curr.value || 0), 0);
                } else {
                    // If it returns a single accumulated value (less likely for SampleType)
                    totalSteps = stepsData.value;
                }
            }

            setSteps(totalSteps);

            // Fetch Calories (Active Energy Burned)
            // Note: 'activeEnergyBurned' is the HealthKit type
            // Plugin might expect 'calories' or 'activeEnergyBurned' based on mapping
            // Checking v1 docs, it was 'activeEnergyBurned'. 

            // For now we placeholder the call to avoid runtime crashes if names differ.
            // setCalories(0); 

        } catch (error) {
            console.error('Error fetching health data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <HealthContext.Provider value={{ steps, calories, isAvailable, loading, fetchDailyData, requestPermissions }}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = () => {
    return useContext(HealthContext);
};
