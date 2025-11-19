import { useEffect, useState } from "react";

export default function Api() {
const [responses, setResponses] = useState({ express: "", ts: "", spring: "" });
const [errors, setErrors] = useState({ express: false, ts: false, spring: false });

useEffect(() => {
    const fetchApi = async (url: string, key: keyof typeof responses) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.text();
            setResponses(prev => ({ ...prev, [key]: data }));
        } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            setErrors(prev => ({ ...prev, [key]: true }));
        }
    };

    // Use environment variables injected by Docker Compose
    //fetchApi(`${process.env.REACT_APP_EXPRESS_API}/`, "express");
    //fetchApi(`${process.env.REACT_APP_TS_API}/`, "ts");
    //fetchApi(`${process.env.REACT_APP_SPRING_API}/`, "spring");

    fetchApi("http://localhost:3001/", "express");
    fetchApi("http://localhost:3002/", "ts");
    fetchApi("http://localhost:8080/", "spring");
}, []);

return (
<div className="p-4">
    <h1 className="text-xl font-bold">React App</h1>
    <p> <b>Express API:</b> </p> 
    <p> {errors.express ? "Error fetching data" : responses.express || "Loading..."} </p>
    
    <p> <b>TypeScript API:</b> </p> 
    <p>  {errors.ts ? "Error fetching data" : responses.ts || "Loading..."} </p>
    
    <p> <b>Spring API:</b> </p> 
    <p> {errors.spring ? "Error fetching data" : responses.spring || "Loading..."} </p>
</div>
);
}


/*
import { useEffect, useState } from "react";

export default function Api() {
const [responses, setResponses] = useState({ express: "", ts: "", spring: "" });

useEffect(() => {
Promise.all([
fetch("http://localhost:3001/").then(r => r.text()), // express_api
fetch("http://localhost:3002/").then(r => r.text()), // typescript_api
fetch("http://localhost:8080/").then(r => r.text()) // spring_api
]).then(([express, ts, spring]) => setResponses({ express, ts, spring }))
.catch(err => console.error(err));
}, []);

return (
<div className="p-4">
<h1 className="text-xl font-bold">React App</h1>
<p>Express API: {responses.express || "Loading..."}</p>
<p>TypeScript API: {responses.ts || "Loading..."}</p>
<p>Spring API: {responses.spring || "Loading..."}</p>
</div>
);
}
*/