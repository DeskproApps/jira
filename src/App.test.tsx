import { render, waitFor } from "@testing-library/react";
import App from "./App";

test("renders App component", async () => {
    const { getByText } = render(<App />);

    await waitFor(() => {
        const headingElement = getByText(/Ticket Data/i);
        expect(headingElement).toBeInTheDocument();
    });
});
