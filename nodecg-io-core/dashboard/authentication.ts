/// <reference types="nodecg/types/browser" />

import { updateMonacoLayout } from "./serviceInstance";
import { setPassword, isPasswordSet } from "./crypto";

// HTML elements
const spanLoaded = document.getElementById("spanLoaded") as HTMLSpanElement;
const inputPassword = document.getElementById("inputPassword") as HTMLInputElement;
const divAuth = document.getElementById("divAuth");
const divMain = document.getElementById("divMain");
const spanPasswordNotice = document.getElementById("spanPasswordNotice") as HTMLSpanElement;

// Add key listener to password input
inputPassword?.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        loadFramework();
    }
});

// Handler for when the socket.io client re-connects which is usually a nodecg restart.
nodecg.socket.on("connect", () => {
    // If a password has been entered previously try to directly login using it.
    if (inputPassword.value !== "") {
        loadFramework();
    } else {
        updateLoadedStatus();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Render loaded status for initial load
    updateLoadedStatus();
});

export async function isLoaded(): Promise<boolean> {
    return new Promise((resolve, _reject) => {
        nodecg.sendMessage("isLoaded", (_err, res) => resolve(res));
        setTimeout(() => resolve(false), 5000); // Fallback in case connection gets lost.
    });
}

async function updateLoadedStatus(): Promise<void> {
    const loaded = await isLoaded();
    if (loaded) {
        spanLoaded.innerText = "Loaded";
    } else {
        spanLoaded.innerText = "Not loaded";
    }

    const loggedIn = loaded && isPasswordSet();
    if (loggedIn) {
        divAuth?.classList.add("hidden");
        divMain?.classList.remove("hidden");
        updateMonacoLayout();
    } else {
        divAuth?.classList.remove("hidden");
        divMain?.classList.add("hidden");
    }
}

export async function loadFramework(): Promise<void> {
    const password = inputPassword.value;

    if (await setPassword(password)) {
        spanPasswordNotice.innerText = "";
    } else {
        spanPasswordNotice.innerText = "The provided passwort isn't correct!";
        inputPassword.value = "";
    }

    updateLoadedStatus();
}
