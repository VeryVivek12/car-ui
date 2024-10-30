import {useEffect, useState} from 'react'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"

import './App.css'

function App() {

    const [vehicles, setVehicles] = useState<any>([]);
    const [users, setUsers] = useState<any>([]);
    const [currentVehicle, setCurrentVehicle] = useState()
    const [currentUser, setCurrentUser] = useState("")
    const [currentUsersEfficiencyTarget, setCurrentUsersEfficiencyTarget] = useState()
    const [currentMileage, setCurrentMileage] = useState(14)
    const [notificationText, setNotificationText] = useState("")

    useEffect(() => {
        // Fetch vehicles when the component mounts
        const fetchVehiclesAndUsers = async () => {
            try {
                const vehiclesResponse = await fetch('http://localhost:8080/api/v1/vehicles');
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
            const usersResponse = await fetch(`http://localhost:8080/api/v1/efficiency-targets/user/${userId}/vehicle/${currentVehicle}`);
            const targetData = await usersResponse.json();
            setCurrentUsersEfficiencyTarget(targetData.efficientTargetValue)
            setCurrentUser(userId)
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
                setNotificationText(data.message);
            }, step * 1000);
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
                    <p>Efficiency Target: {currentUsersEfficiencyTarget}</p>
                }

                <hr/>
                {/* Mileage publisher*/}
                <div className="flex flex-row m-2 items-center ">
                    <div className="text-lg mx-2 w-[180px]">Mileage value to publish :</div>
                    <Input className="w-[180px]" type="number" value={currentMileage} min="14"
                           max="30" step="1"
                           onChange={event => setCurrentMileage(event.target.value)}/>
                </div>
                <Button variant="default" className="m-2 w-[180px]" onClick={publishMileage}>Publish Mileage</Button>
            </div>
            <hr/>

            <div className="flex flex-col">
                <h2 className="text-xl">Notification</h2>
                <div className="border-2 p-2 w-fit">{notificationText}</div>
            </div>
        </main>
    )
}

export default App
