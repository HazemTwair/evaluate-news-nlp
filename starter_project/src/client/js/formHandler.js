import { isValidUrl } from "./urlValidator";

const serverURL = "/api";
const form = document.getElementById("urlForm");
form.addEventListener("submit", handleSubmit);
const results = document.getElementById("results");

function handleSubmit(event) {
    event.preventDefault();

    // Get the URL from the input field
    const formText = document.getElementById("name").value.trim();
    results.innerHTML = "";

    // Check if the URL is valid
    if (isValidUrl(formText)) {
        // If the URL is valid, send it to the server using the serverURL constant above
        analyze(formText);
    } else {
        alert("URL is not valid! Please enter valid URL.");
    }
}

// Function to send data to the server
async function analyze(data) {
    try {
        const response = await fetch(serverURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ URL: data }),
        });

        if (!response.ok) {
            throw new Error(`Error sending data: ${response.status}`);
        }

        const responseData = await response.json();
        updateUI(responseData);
    } catch (error) {
        console.error("Error:", error);
        results.innerHTML = "";
        alert("Error:", error);
    }
}

const score = {
    "P+": "Strong Positive",
    P: "Positive",
    NEU: "Neutral",
    N: "Negative",
    "N+": "Strong Negative",
    NONE: "Without Polarity",
};

function updateUI(data) {
    let res = {};
    res.Score = score[data.score_tag];
    res.Agreement =
        data.agreement == "AGREEMENT"
            ? "The different elements have the same polarity"
            : "There is disagreement between the different elements' polarity";
    res.Subjectivity =
        data.subjectivity == "OBJECTIVE"
            ? "The blog does not have any subjectivity marks"
            : "The blog has subjective marks";
    res.Confidence = data.confidence;
    res.Irony =
        data.iron == "NONIRONIC"
            ? "The blog does not have any irony marks"
            : "The blog has irony marks";

    for (let key in res) {
        const resItem = document.createElement("p");
        resItem.innerHTML = `<span style="font-weight: 1000;">${key}</span>: ${res[key]}`;
        results.appendChild(resItem);
    }
}

// Export the handleSubmit function
export { handleSubmit, analyze, updateUI };
