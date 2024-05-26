import { Router, Route } from "@solidjs/router";
import App from "./App";
import Home from "./Home";

export default function Routes() {
  return (
    <Router root={App}>
      <Route path="/" component={Home} />
    </Router>
  );
}
