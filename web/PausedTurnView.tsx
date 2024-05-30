import { useContext } from "solid-js";
import { PlayerDataContext } from "./resources/getDataResource";

export default function PausedTurnView() {
	const data = useContext(PlayerDataContext)
	console.log('woop', data)
	return 'paused'
}