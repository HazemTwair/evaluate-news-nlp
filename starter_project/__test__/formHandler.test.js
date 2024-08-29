import { isValidUrl } from "../src/client/js/urlValidator";

jest.mock("../src/client/js/urlValidator", () => ({
    isValidUrl: jest.fn(),
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve({
                score_tag: "P+",
                agreement: "AGREEMENT",
                subjectivity: "OBJECTIVE",
                confidence: "100",
                irony: "NONIRONIC",
            }),
    })
);

let formHandler;

let mockFormElement;
let mockResultsElement;
let mockInputElement;

// Mocking document.getElementById before importing the module
beforeEach(async () => {
    jest.resetModules();

    mockFormElement = {
        addEventListener: jest.fn(),
    };
    mockResultsElement = {
        innerHTML: "",
        appendChild: jest.fn(),
    };
    mockInputElement = {
        value: "https://example.com",
    };

    jest.spyOn(document, "getElementById").mockImplementation((id) => {
        switch (id) {
            case "urlForm":
                return mockFormElement;
            case "results":
                return mockResultsElement;
            case "name":
                return mockInputElement;
            default:
                return null;
        }
    });

    formHandler = await import("../src/client/js/formHandler");

    jest.spyOn(formHandler, "analyze").mockImplementation(jest.fn());
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("handleSubmit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call preventDefault", () => {
        const event = { preventDefault: jest.fn() };
        formHandler.handleSubmit(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("should validate the URL and call analyze if valid", () => {
        const event = { preventDefault: jest.fn() };
        isValidUrl.mockReturnValue(true);

        formHandler.handleSubmit(event);

        expect(isValidUrl).toHaveBeenCalledWith("https://example.com");
        expect(formHandler.analyze).toHaveBeenCalledWith("https://example.com");
    });

    it("should alert if the URL is invalid", () => {
        const event = { preventDefault: jest.fn() };
        isValidUrl.mockReturnValue(false);

        formHandler.handleSubmit(event);

        expect(isValidUrl).toHaveBeenCalledWith("https://example.com");
        expect(formHandler.analyze).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
            "URL is not valid! Please enter valid URL."
        );
    });
});

describe("analyze", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should send data to the server and update the UI on success", async () => {
        const data = "https://example.com";

        await formHandler.analyze(data);

        expect(fetch).toHaveBeenCalledWith("/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ URL: data }),
        });

        expect(
            document.getElementById("results").appendChild
        ).toHaveBeenCalled();
    });

    it("should handle server errors", async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            })
        );

        await formHandler.analyze("https://example.com");

        expect(window.alert).toHaveBeenCalledWith("Error:", undefined);
    });

    it("should catch and log errors", async () => {
        const error = new Error("Network Error");
        global.fetch.mockRejectedValueOnce(error);

        await formHandler.analyze("https://example.com");

        expect(console.error).toHaveBeenCalledWith("Error:", error);
    });
});

describe("updateUI", () => {
    it("should update the UI with the correct information", () => {
        const data = {
            score_tag: "P+",
            agreement: "AGREEMENT",
            subjectivity: "OBJECTIVE",
            confidence: "100",
            irony: "NONIRONIC",
        };
        formHandler.updateUI(data);

        const results = document.getElementById("results");
        expect(results.appendChild).toHaveBeenCalledTimes(5);
    });
});
