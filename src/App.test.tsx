import { render } from "@testing-library/react";
import App from "./App";

test("renders App component", () => {
    const { getByText } = render(<App />);
    const buttonElement = getByText(/My App/i);
    expect(buttonElement).toBeInTheDocument();
});
