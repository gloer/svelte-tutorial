
import {useEffect, useState} from "react"

function Person(props) {


    const [fullName, setfullName] = useState("")

    useEffect(() => {
        setfullName(`${props.title} ${props.first} ${props.last}`)        
    }, []);


    return (
        <article>
            <img src={props.picture} alt={props.last}/>
            <p>Hallo {fullName}</p>
        </article>
    )
}

export default Person