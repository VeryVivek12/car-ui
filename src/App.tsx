import {useEffect, useState} from 'react'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Toaster} from "@/components/ui/sonner"

import './App.css'
import {toast} from "sonner";

function App() {

    const [vehicles, setVehicles] = useState<any>([]);
    const [users, setUsers] = useState<any>([]);
    const [currentVehicle, setCurrentVehicle] = useState()
    const [currentUser, setCurrentUser] = useState("")
    const [currentUsersEfficiencyTarget, setCurrentUsersEfficiencyTarget] = useState()
    const [currentMileage, setCurrentMileage] = useState(14)
    const [currentAverageMileage, setAverageMileage] = useState("")
    const [notificationText, setNotificationText] = useState("")

    useEffect(() => {
        // Fetch vehicles when the component mounts
        const fetchVehicles = async () => {
            try {
                const vehiclesResponse = await fetch('http://localhost:8080/api/v1/vehicles');
                const vehiclesData = await vehiclesResponse.json();
                setVehicles(vehiclesData);

            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };

        fetchVehicles();
    }, []);

    async function fetchUsersForVehicle(vehicleId: string) {
        try {
            const usersResponse = await fetch(`http://localhost:8080/api/v1/users/vehicle/${vehicleId}`);
            const usersData = await usersResponse.json();
            setUsers(usersData);
            setCurrentVehicle(vehicleId)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async function fetchEfficiencyTargetForCurrentUser(userId: string) {
        try {
            // get target value
            const usersResponse = await fetch(`http://localhost:8080/api/v1/efficiency-targets/user/${userId}/vehicle/${currentVehicle}`);
            const targetData = await usersResponse.json();
            setCurrentUsersEfficiencyTarget(targetData.efficientTargetValue)
            setCurrentUser(userId)

            // get current average value
            const res = await fetch(`http://localhost:8080/api/v1/mileage/averageMileage?userId=${userId}&vehicleId=${currentVehicle}`);
            const averageMileage = await res.text();
            setAverageMileage(averageMileage)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }


    async function publishMileage() {
        for (let step = 0; step < 5; step++) {
            setTimeout(async () => {
                const res = await fetch(`http://localhost:8080/api/v1/mileage`, {
                    method: "POST",
                    body: JSON.stringify({
                        vehicleId: currentVehicle,
                        userId: currentUser,
                        currentMileage: currentMileage
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const data = await res.json();
                if (data.message) {
                    setNotificationText(data.message);
                    toast(data.message)
                }
            }, step * 1000);
        }
    }

    async function updateMileage() {
        try {
            const res = await fetch(`http://localhost:8080/api/v1/efficiency-targets`, {
                method: "PUT",
                body: JSON.stringify({
                    efficientTargetValue: currentUsersEfficiencyTarget,
                    status: 1,
                    userId: currentUser,
                    vehicleId: currentVehicle
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            setCurrentUsersEfficiencyTarget(data.efficientTargetValue)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async function updateAverageMileageData() {
        // get current average value
        const res = await fetch(`http://localhost:8080/api/v1/mileage/averageMileage?userId=${currentUser}&vehicleId=${currentVehicle}`);
        const averageMileage = await res.text();
        setAverageMileage(averageMileage)
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
                                <SelectItem key={vehicle.vehicleId}
                                            value={vehicle.vehicleId}>{vehicle.model}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* User Selection*/}
                <div className="flex flex-row mx-2 items-center">
                    <div className="text-lg mx-2 w-[180px]">Select User :</div>
                    <Select onValueChange={value => fetchEfficiencyTargetForCurrentUser(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="User"/>
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.userId} value={user.userId}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {
                    currentUsersEfficiencyTarget &&
                    <div className="flex flex-row mx-2 items-center">
                        <p className="mx-2 w-[180px]">Efficiency Target: </p>
                        <Input className="w-[180px]" type="number"
                               value={currentUsersEfficiencyTarget} step="1"
                               onChange={event => setCurrentUsersEfficiencyTarget(event.target.value)}/>
                        <Button variant="default" className="m-2 w-[120px]" onClick={updateMileage}>Update</Button>
                    </div>

                }
                {
                    currentUsersEfficiencyTarget &&
                    <div className="flex flex-row mx-2 items-center">
                        <p className="mx-2 w-[180px]">Current Average: </p>
                        <Input className="w-[180px]" type="number" disabled={true}
                               value={currentAverageMileage} step="1"/>
                        <Button variant="default" className="m-2 w-[120px]"
                                onClick={updateAverageMileageData}>Update</Button>
                    </div>
                }

                <hr/>
                {/* Mileage publisher*/}
                <div className="flex flex-row mx-2 items-center ">
                    <div className="text-lg mx-2 w-[180px]">Mileage value to publish :</div>
                    <Input className="w-[180px]" type="number" value={currentMileage} min="14"
                           max="35" step="1"
                           onChange={event => setCurrentMileage(event.target.value)}/>
                    <Button variant="default" className="m-2 w-[120px]" onClick={publishMileage}>Publish
                        Mileage</Button>
                </div>
            </div>
            <hr/>

            <div className="flex flex-col mt-2">
                <h2 className="text-xl">Notification</h2>
                {
                    notificationText &&
                    <div className="border-2 p-2 w-fit">{notificationText}</div>
                }
            </div>
            <Toaster position="top-right" closeButton={true}/>
        </main>
    )
}

export default App
