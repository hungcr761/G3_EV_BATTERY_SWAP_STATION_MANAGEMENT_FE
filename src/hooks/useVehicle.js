
import { modelAPI, vehicleAPI } from '@/lib/apiServices';
import{ useCallback, useEffect, useState } from 'react'

export default function useVehicle() {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleModels, setVehicleModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, vehicle: null });

    // fetch vehicles model
    useEffect(() => {
        const fetchData = async() => {
            try{
                const modelRes = await modelAPI.getAll();
                const models = modelRes.data?.payload?.vehicleModels || [];
                setVehicleModels(models);
            }catch(error){
                console.log('Error fetching models', error);
            }
        };
        fetchData();
    }, []);

    // fetch vehicles list
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vehicleAPI.getAll();
            const vehiclesData = res.data?.vehicles || [];

            const mappedVehicles = vehiclesData.map(v => {
                const modelName = v.model?.name || 'Unknown Model';
                const batteryName = v.model?.batteryType?.battery_type_code || 'Unknown Batteryt';
                const batterySlot = v.model?.battery_slot || 0;

                return {
                    ...v,
                    modelName,
                    batteryName,
                    batterySlot
                };   
            })

            setVehicles(mappedVehicles);
        } catch (error) {
            console.error('Error fetching vehicles:', error);;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);


    // Submit add or update vehicle
    const handleSubmit = async (data , editingVehicle , onSuccess) => {
        setIsSubmitting(true);
        setApiError('');
        try {
            const selectedModel = vehicleModels.find(m => m.name === data.model);

            if (!selectedModel) {
                setApiError('Invalid vehicle model selected');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                vin: data.vin,
                model_id: selectedModel.model_id,
                license_plate: data.license_plate
            };

            let res;
            if (editingVehicle) {
                res = await vehicleAPI.update(editingVehicle.vehicle_id, payload);
            } else {
                res = await vehicleAPI.create(payload);
            }

            const isSuccess = res.data?.success == true ||
                res.status === 200 ||
                res.status === 201;

            if (isSuccess) {
                setMessage({
                    type: 'success',
                    text: editingVehicle ? 'Vehicle Update Successfully!' : 'Vehicle Added Successfully!'
                });

                await fetchVehicles();

                if (onSuccess) {
                    onSuccess();
                }

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            }
        } catch (error) {
            setApiError(error.response?.data?.message || 'Error while saving data.');
            console.error(error.response?.data?.message || 'Error while saving data.');
        }finally{
            setIsSubmitting(false);
        };
    };


    // Delete vehicle
    const handleDelete = (vehicle) => {
        setConfirmDelete({show: true, vehicle: vehicle});
    };

    const executeDelete = async() => {
        const vehicleToDelete = confirmDelete.vehicle;
        const vehicleId = vehicleToDelete.vehicle_id;

        setConfirmDelete({show: false , vehicle: null});

        try{
            const res = await vehicleAPI.delete(vehicleId);
            const isSuccess = res.data?.success === true || 
                res.status === 200 ||
                res.status === 204;

                if(isSuccess){
                    setMessage({
                        type: 'success',
                        text: `Delete Vehicle ${vehicleToDelete.modelName} (${vehicleToDelete.license_plate}) Successfully!`
                    });

                    await fetchVehicles();

                    setTimeout(() => setMessage({
                        type: '',
                        text: ''
                    }), 3000);
                }
        }catch(error){
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Cannot Delete Vehicle. Please try again!'
            });

            setTimeout(() => setMessage({
                type: '',
                text: ''
            }), 5000);
        }
    };

    return {
        //State
        vehicles,
        vehicleModels,
        loading,
        message,
        apiError,
        isSubmitting,
        confirmDelete,

        //methods
        fetchVehicles,
        handleSubmit,
        handleDelete,
        executeDelete,
        setMessage,
        setApiError,
        setConfirmDelete
    };
}
