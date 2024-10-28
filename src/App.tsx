import React, {useState, useEffect} from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Toaster} from "@/components/ui/sonner"
import {toast} from "sonner"

import './App.css'

function App() {

    const [vehicles, setVehicles] = useState<any>([]);
    const [users, setUsers] = useState<any>([]);
    const [currentVehicle, setCurrentVehicle] = useState()
    const [currentUser, setCurrentUser] = useState("")
    const [currentMileage, setCurrentMileage] = useState(5)


    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/notification?vehicleId=${currentVehicle}&userId=${currentUser}`);
                const data = await response.json();
                toast(data.notificationMessage)
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        // Fetch notifications immediately on mount
        fetchNotifications();

        // Set up an interval to fetch notifications every 5 seconds
        const intervalId = setInterval(fetchNotifications, 5000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [currentVehicle, currentUser]);

    useEffect(() => {
        // Fetch vehicles and users when the component mounts
        const fetchVehiclesAndUsers = async () => {
            try {
                const vehiclesResponse = await fetch('http://localhost:8080/api/v1/vehicles/all');
                const vehiclesData = await vehiclesResponse.json();
                setVehicles(vehiclesData);

            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };

        fetchVehiclesAndUsers();
    }, []);

    async function fetchUsersForVehicle(vehicleId: string) {
        try {
            const usersResponse = await fetch(`http://localhost:8080/api/v1/users/test?vehicleId=${vehicleId}`);
            const usersData = await usersResponse.json();
            setUsers(usersData);
            setCurrentVehicle(vehicleId)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async function publishMileage() {
        for (let step = 0; step < 5; step++) {
            await fetch(`http://localhost:8080/api/v1/mileage`, {
                method: "POST",
                body: JSON.stringify({
                    vehicleId: currentVehicle,
                    userId: currentUser,
                    currentMileage: currentVehicle
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
        }
    }

    return (
        <main className="flex flex-col m-2">
            <h1 className="text-3xl mx-2">Demo UI</h1>
            <hr/>

            <div className="flex flex-col m-2 gap-2">
                {/* Car Selection*/}
                <div className="flex flex-row mx-2 items-center">
                    <div className="text-lg mx-2 w-[180px]">Select Vehicle :</div>
                    <Select onValueChange={value => fetchUsersForVehicle(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Vehicle name"/>
                        </SelectTrigger>
                        <SelectContent>
                            {vehicles.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* User Selection*/}
                <div className="flex flex-row mx-2 items-center">
                    <div className="text-lg mx-2 w-[180px]">Select User :</div>
                    <Select onValueChange={value => setCurrentUser(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="User"/>
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <hr/>
                {/* Mileage publisher*/}
                <div className="flex flex-row m-2 items-center ">
                    <div className="text-lg mx-2 w-[180px]">Mileage value to publish :</div>
                    <Input className="w-[180px]" type="number" value={currentMileage} min="0"
                           max="10" step="0.1"
                           onChange={event => setCurrentMileage(event.target.value)}/>
                </div>
                <Button variant="default" className="m-2 w-[180px]" onClick={publishMileage}>Publish Mileage</Button>
            </div>
            <hr/>
            <Toaster closeButton={true} position="top-right"/>
        </main>
    )
}

export default App
