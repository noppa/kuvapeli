import * as Solid from "solid-js";
import getToken from "./getToken";

const App: Solid.Component<{ children?: Solid.JSX.Element }> = (props) => {
  console.log("app init");
  const token = getToken();
  if (!token) {
    return <div>Tarvitset kutsun pelataksesi.</div>;
  }

  return <div>{props.children}</div>;
};

export default App;
