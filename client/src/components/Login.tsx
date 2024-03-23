import {SyntheticEvent, useState} from "react";

import { TEInput } from "tw-elements-react";

export default function Login({sendJsonMessage}) {
    const [username, setUsername] = useState("");

    const sendUsername = (e: SyntheticEvent) => {
        e.preventDefault()
        sendJsonMessage({
            type: "name",
            name: username,
        })
    }

    return (
        <div className={"flex"}>
            <TEInput
                type="text"
                id="username"
                label="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}/>
            <button
                type="button"
                className="ml-2 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] disabled:opacity-70 active:bg-primary-700"
                onClick={sendUsername}>
                Benutzername setzen!
            </button>
        </div>

    )
}