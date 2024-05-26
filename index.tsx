/* @refresh reload */
import "@picocss/pico/css/pico.classless.min.css";
import "./web/styles.css";
import { render } from "solid-js/web";
import Routes from "./web/Routes";

render(() => <Routes />, document.body);
