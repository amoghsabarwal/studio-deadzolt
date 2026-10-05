"use client";

import { useGLTF } from "@react-three/drei";
import { Component, type ReactNode, Suspense } from "react";

// A model that fails to download (a dropped or flaky connection) must never
// take the rest of the scene down with it. Each one loads inside this: on an
// error it waits, forgets the failed download and tries again, a few times
// with growing pauses, and after that simply leaves the model out.

const PAUSES_MS = [2000, 5000, 12000];

type Props = { urls: string[]; children: ReactNode };
type State = { failures: number; waiting: boolean };

export default class Retry extends Component<Props, State> {
  state: State = { failures: 0, waiting: false };
  timer: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromError(): Partial<State> {
    return { waiting: true };
  }

  componentDidCatch() {
    const failures = this.state.failures;
    if (failures >= PAUSES_MS.length) return;
    this.timer = setTimeout(() => {
      this.props.urls.forEach((url) => useGLTF.clear(url));
      this.setState({ failures: failures + 1, waiting: false });
    }, PAUSES_MS[failures]);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    if (this.state.waiting) return null;
    return (
      <Suspense key={this.state.failures} fallback={null}>
        {this.props.children}
      </Suspense>
    );
  }
}
