import { useEffect, useState } from "react";
import axios from "axios";

function Leaderboard() {

    const [users, setUsers] = useState([]);

    useEffect(() => {

        const fetchLeaderboard =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const response =
                        await axios.get(
                            "http://localhost:5000/api/leaderboard",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );

                    setUsers(
                        response.data.leaderboard
                    );

                } catch (error) {

                    console.error(
                        error.response?.data ||
                        error.message
                    );

                }

            };

        fetchLeaderboard();

    }, []);

    return (

        <div>

            <h1>
                🏆 Citizen Leaderboard
            </h1>

            <table border="1">

                <thead>

                    <tr>

                        <th>Rank</th>

                        <th>Name</th>

                        <th>Total Complaints</th>

                    </tr>

                </thead>

                <tbody>

                    {users.map(
                        (user, index) => (

                            <tr key={user.id}>

                                <td>
                                    {index + 1}
                                </td>

                                <td>
                                    {user.name}
                                </td>

                                <td>
                                    {user.totalComplaints}
                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>

    );

}

export default Leaderboard;