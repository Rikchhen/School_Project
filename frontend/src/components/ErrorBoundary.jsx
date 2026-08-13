import { Component } from "react";
import styled from "styled-components";

/**
 * Class-based React error boundary. Wraps the whole app so one broken page/
 * component can't blank the entire site — it renders a recoverable fallback.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real deployment this would report to an error tracker.
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <Wrap role="alert">
          <Box>
            <h1>Something went wrong</h1>
            <p>
              An unexpected error occurred while rendering this page. You can
              return to the home page and try again.
            </p>
            {this.state.error?.message ? (
              <Detail>{this.state.error.message}</Detail>
            ) : null}
            <button onClick={this.handleReset}>Back to Home</button>
          </Box>
        </Wrap>
      );
    }
    return this.props.children;
  }
}

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.bg};
`;

const Box = styled.div`
  max-width: 520px;
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 2.5rem;

  h1 { color: ${({ theme }) => theme.colors.primary}; margin-bottom: 0.75rem; }
  p { color: ${({ theme }) => theme.colors.textBody}; margin-bottom: 1.25rem; }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: ${({ theme }) => theme.radii.pill};
  }
`;

const Detail = styled.pre`
  text-align: left;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow-x: auto;
  margin-bottom: 1.25rem;
  white-space: pre-wrap;
`;

export default ErrorBoundary;
