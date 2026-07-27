const BASE_URL = "http://localhost:8000/api"

export const loginUser = async(userData) =>{
    const response = await fetch(`${BASE_URL}/auth/login`,{
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Login Failed.")
    }

    return data
}