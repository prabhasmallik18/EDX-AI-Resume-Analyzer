const BASE_URL = "http://localhost:8000/api"

export const uploadResume  = async (file, token) =>{
    const formData = new FormData();

    formData.append("resume", file)

    const response = await fetch(`${BASE_URL}/resume/upload`,{
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Upload failed.")
    }

    return data
}


export const getMyResumes = async(token) =>{
    const response = await fetch(`${BASE_URL}/resume/my-resumes`,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message)
    }

    return data

}


export const deleteResume = async(id, token) =>{
    const response = await fetch(`${BASE_URL}/resume/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message)
    }

    return data


}