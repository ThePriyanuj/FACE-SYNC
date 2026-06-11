import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  recoveryAttempts: number;
}

export class NeuralLogicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    recoveryAttempts: 0
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true, recoveryAttempts: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical biometric component failure caught:", error, errorInfo);
  }

  private handleSystemReset = () => {
    this.setState(prevState => ({
      hasError: false,
      recoveryAttempts: prevState.recoveryAttempts + 1
    }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl glass-accelerated">
            <h2 className="text-xl font-light tracking-wide text-white">Neural Logic Reboot</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The camera engine or connection encountered an error. The interface is resetting to safe offline settings.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={this.handleSystemReset}
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white tracking-wider uppercase transition-all duration-150 hover:bg-white/20"
              >
                Reinitialize Biometrics
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
