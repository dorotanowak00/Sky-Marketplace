import Config from 'config';

const url = `${process.env.REACT_APP_DATABASE_BASE_URL}/user/register`;

export const registerUser = async (data: {}) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        throw new Error("Couldn't add user")
    }
};
